---
name: widget-rendering
description: Pi TUI crew widget data sources, display priority, and rendering performance. Use when debugging empty agents, ghost runs, or widget timing issues.
---


# widget-rendering

The crew widget (`src/ui/crew-widget.ts`) displays active runs and their agents in the Pi TUI. It must render synchronously at TTY refresh rate without blocking. Understanding the data sources and timing rules is essential for debugging display issues.

## Three Data Sources

The widget has three sources, used in priority order:

### 1. `liveAgents` Map (real-time, highest priority)

In-memory map from `live-agent-manager.ts`. Provides:
- Real-time tool names: `activeTools` Map (toolName → description)
- Turn count, response text, compaction count
- Session stats: context %, token usage
- Status from the handle

**When used:** Agents with `liveHandle && liveHandle.status === "running"` get the live activity description (tool labels, response text, turn counter).

**When NOT used:** After `evictStaleLiveAgentHandles()` removes a handle, widget falls back to agent records on disk.

### 2. Snapshot cache (500ms TTL)

`RunSnapshotCache` from `run-snapshot-cache.ts` caches parsed manifests and agents for 500ms. Reduces disk reads during rapid refresh.

**When used:** As the fallback when no live handle exists. Prevents excessive disk reads on every render tick.

**Invalidation:** Cache is invalidated when:
- `invalidate()` is called on a specific run
- An empty result is returned (forces refresh on next tick)
- TTL expires (500ms)

### 3. `agents.json` on disk (durables, lowest priority)

`readCrewAgents(run)` reads `artifactsRoot/agents.json`. Provides:
- Final agent status (completed/failed/cancelled)
- Tool count, token usage from final record
- Error messages
- Timestamps (startedAt, completedAt)

**When used:** For completed agents, or when snapshot cache misses.

---

## Display Priority

```
for each active run:
  for each agent in run:
    if liveAgents has this agent (by agentId or taskId):
      → use live activity description (tool labels, response text)
      → use live status (running/queued/waiting)
      → use live session stats (context %, turns, tokens)
    else if snapshot cache has fresh data:
      → use cached agent status
      → use cached tool count, tokens, progress
    else:
      → read agents.json from disk
      → use disk agent status

    if status is completed/failed/cancelled:
      → apply linger rules (finishedAgents: 1min, errors: 2min)
```

---

## Active Runs Filtering

`activeWidgetRuns()` determines which runs to show. Key filter: `isDisplayActiveRun(manifest, tasks)` from `process-status.ts`.

**Rule: `hasStaleAsyncProcess()`**

A run with an async PID is considered stale (hidden) if:
1. PID is recorded but process is dead, AND
2. The run is more than 30 minutes old (`STALE_ACTIVE_RUN_MS = 30 * 60 * 1000`)

**Rule: `isDisplayActiveRun()`**

```typescript
export function isDisplayActiveRun(manifest: TeamRunManifest, tasks: TeamTaskState[]): boolean {
