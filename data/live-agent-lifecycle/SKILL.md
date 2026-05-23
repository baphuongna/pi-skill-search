---
name: live-agent-lifecycle
description: Live agent registration, workspace isolation, termination, and eviction workflow. Use when tracking live agents, debugging ghost agents, or understanding workspace boundaries.
---


# live-agent-lifecycle

Live agents are real-time, in-memory worker sessions managed by `LiveAgentManager` (`src/runtime/live-agent-manager.ts`). They are distinct from `CrewAgentRecord` files on disk — live agents provide real-time activity (tool names, response text, turn count) while agent records are durable snapshots.

## Architecture

**LiveAgentHandle** is the core data structure:

```typescript
interface LiveAgentHandle {
  agentId: string;        // unique per run
  taskId: string;         // maps to task
  runId: string;          // run this agent belongs to
  workspaceId: string;   // manifest.cwd — workspace boundary
  role?: string;
  agent?: string;
  modelName?: string;
  session: LiveSessionHandle; // steer/prompt/abort/dispose
  status: CrewAgentRecord["status"];
  pendingSteers: string[];
  pendingFollowUps: string[];
  pendingMessages: IrcMessage[];
  activity: LiveAgentActivity; // real-time tracking
  createdAt: string;
  updatedAt: string;
}
```

The in-memory `liveAgents` Map stores all active handles. It is never persisted — on Pi restart, the Map is empty and agents are re-created from agent records.

---

## Registration

`registerLiveAgent(input, eventLogFn?, eventsPath?)` is called when a live session worker starts. It:

1. Creates or reuses the handle in `liveAgents` Map
2. Preserves pending steers/followups from previous sessions
3. Emits `live_agent.registered` event to events.jsonl
4. Flushes any pending steers/followups immediately if the session already has the methods

Key caller sites:
- `live-session-runtime.ts` — when a live session agent starts
- `live-executor.ts` — when spawning a live task
- (workspaceId is passed through the entire call chain)

---

## Workspace Isolation

**`workspaceId: string`** field is the workspace boundary. Set to `manifest.cwd` at registration time.

**Why it matters:** When Pi has multiple workspace folders open, agents from workspace A must not be visible or controllable from workspace B. Every handle carries its origin workspace.

**Enforcement in api.ts:**
- `listActiveLiveAgentsByWorkspace(workspaceId)` — filters by workspace
- Steering/follow-up operations check `live.workspaceId !== manifest.cwd` → reject with error
- Widget queries use `listLiveAgentsByWorkspace(manifest.cwd)` so each workspace only sees its own agents

**Enforcement in live-session-runtime.ts:**
- Config carries `workspaceId` from `TeamContext.workspaceId`
- Session creation passes workspaceId through

---

## Activity Tracking

`LiveAgentActivity` provides real-time data without reading disk:

```typescript
interface LiveAgentActivity {
  activeTools: Map<string, string>;   // toolName → description
  toolUses: number;                   // total invocations
  turnCount: number;
  maxTurns?: number;
  responseText: string;               // last 200 chars
  compactionCount: number;
  startedAtMs: number;
  completedAtMs: number;              // 0 = still running
