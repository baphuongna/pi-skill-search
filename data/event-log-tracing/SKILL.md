---
name: event-log-tracing
description: Structured event logging system for worker lifecycle, live agents, and crash recovery. Use when debugging worker crashes, tracing agent lifecycle, or investigating stale runs.
---


# event-log-tracing

Every pi-crew run writes a persistent event log at `.crew/state/runs/<runId>/events.jsonl`. Events are the primary evidence for understanding what happened — especially when workers crash, agents get stuck, or runs become orphaned.

## Event Format

Every event is a JSON object on one line:

```json
{
  "time": "2026-05-14T10:27:52.000Z",
  "type": "worker.spawned",
  "runId": "team_20260514092752_218fe358085d7115",
  "taskId": "01_explore",
  "message": "Worker spawned: pid 12345",
  "data": { "pid": 12345, "role": "explorer" },
  "metadata": {
    "seq": 42,
    "provenance": "team_runner",
    "fingerprint": "a1b2c3d4e5f6g7h8"
  }
}
```

**Required fields:** `time`, `type`, `runId`
**Optional fields:** `taskId`, `message`, `data`, `metadata`
**Metadata auto-populated:** `seq` (line number), `provenance` (who wrote it), `fingerprint` (for terminal events)

---

## Event Taxonomy

### Worker Lifecycle Events (from child-pi.ts via onLifecycleEvent callback)

| Event | When | Data |
|---|---|---|
| `worker.spawned` | Child process starts with a PID | `{pid, cwd}` |
| `worker.spawn_error` | Spawn failed (no PID, binary not found, permission denied) | `{pid?, error}` |
| `worker.response_timeout` | No stdout for `responseTimeoutMs` (default 5 min) | `{pid, error}` |
| `worker.final_drain` | Child finished but lingered — SIGTERM sent | `{pid}` |
| `worker.hard_kill` | Child still alive after `hardKillMs` — SIGKILL sent | `{pid}` |
| `worker.exit` | Process exited (before close) | `{pid, exitCode}` |
| `worker.close` | stdio fully closed | `{pid, exitCode}` |

**Tracing worker crashes:**
- `worker.spawned` followed by `worker.exit` with non-zero code → worker crashed
- `worker.spawned` followed immediately by `worker.spawn_error` → spawn failed
- `worker.spawned` followed by `worker.response_timeout` → worker hung
- `worker.spawned` followed by `worker.final_drain` → worker lingered but completed
- `worker.spawned` followed by `worker.hard_kill` → worker had to be forcibly killed

**Tracing "worker blinks":**
- Widget shows agent appears and disappears within 1 frame
- Root cause: `worker.spawned` + very fast `worker.exit` (crash during spawn)
- Look for `worker.spawn_error` with error details (API key, model, binary)
- `executeWorkers=false` (scaffold mode) means no `worker.spawned` at all — agent completes instantly

### Live Agent Events (from live-agent-manager.ts)

| Event | When | Data |
|---|---|---|
| `live_agent.registered` | `registerLiveAgent` called | `{agentId, role, agent, workspaceId, runId, taskId}` |
| `live_agent.terminated` | `terminateLiveAgent` called | `{agentId, status, role, workspaceId, runId, taskId}` |

These track the full lifecycle from spawn to cleanup.

### Run Lifecycle Events (from task-runner.ts, team-runner.ts)

| Event | When | Data |
|---|---|---|
| `run.created` | Run manifest created | `{team, workflow}` |
| `run.running` | Workflow execution begins | — |
| `run.completed` | All tasks done, no errors | — |
| `run.failed` | Run failed (fatal error, cancelled) | `{reason?}` |
| `task.started` | Task worker spawned | `{role, agent, runtime, cwd}` |
| `task.progress` | Progress event (activity, turns, tokens) | `{eventType, activityState, toolCount, turns, tokens}` |
| `task.attention` | Attention needed (no yield, completion guard, etc.) | `{reason, activityState}` |
| `task.completed` | Task finished successfully | — |
| `task.failed` | Task failed | `{error?}` |
