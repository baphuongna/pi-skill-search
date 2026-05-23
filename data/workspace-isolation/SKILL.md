---
name: workspace-isolation
description: Workspace isolation boundaries in pi-crew. Use when ensuring agents from workspace A cannot access workspace B, or when implementing worktree-based parallel execution.
---


# workspace-isolation

pi-crew enforces workspace isolation so that agents, runs, and live sessions from one project folder cannot be accessed from another. The workspace boundary is `manifest.cwd` — the directory where a run was initiated.

## Workspace Boundary Definition

**`manifest.cwd`** is the canonical workspace root. Every run record carries the directory where it was created.

**Why it matters:** Pi can have multiple workspace folders open simultaneously. Without isolation, an agent from workspace A could be steered/controlled from workspace B.

**Rules:**
- Every run's `manifest.cwd` is set at creation time
- Every live agent handle carries `workspaceId = manifest.cwd`
- Widget queries filter by `manifest.cwd`
- API operations reject cross-workspace access

## Live Agent Workspace Check

`LiveAgentHandle.workspaceId` field (added to prevent cross-workspace access):

```typescript
interface LiveAgentHandle {
  // ... other fields
  /** Workspace where this agent was spawned — used for session-scoped visibility. */
  workspaceId: string;
}
```

**Enforcement in `api.ts`** (team-tool operations):

```typescript
// list-active-live-agents: filter by workspace
listActiveLiveAgentsByWorkspace(manifest.cwd);

// steer-agent, follow-up-agent, stop-agent, resume-agent:
const live = getLiveAgent(agentId);
if (live && live.workspaceId !== manifest.cwd)
  return result(`Live agent '${agentId}' does not belong to workspace ${manifest.cwd}.`, { status: "error" }, true);
```

**Enforcement in `live-agent-manager.ts`**:

```typescript
// listLiveAgentsByWorkspace(workspaceId): filter by workspaceId
export function listLiveAgentsByWorkspace(workspaceId: string): LiveAgentHandle[] {
  return listLiveAgents().filter((a) => a.workspaceId === workspaceId);
}
```

## Team Workspace Modes

### `single` (default)

- All agents run in the project root (`manifest.cwd`)
- No worktree creation
- Simpler, but all workers share the same git state

### `worktree` (parallel isolation)

- Each task (or phase) gets its own git worktree
- Worktree path: `<repo-root>/.worktrees/<runId>/<taskId>/`
- Branch name: `crew/<runId>-<taskId>` (sanitized)
- Allows parallel code-changing tasks without git conflicts

**Entry point in `team-runner.ts`:**
```typescript
const worktree = workspaceMode === "worktree" && task.worktree !== undefined
  ? { path: task.worktree.path, branch: task.worktree.branch, reused: task.worktree.reused }
  : undefined;
```

**Worktree lifecycle:**

1. **Creation** (`prepareTaskWorkspace` in `worktree-manager.ts`):
   - Check leader repo is clean (`assertCleanLeader`)
   - `git worktree add <path> <branch>`
   - Link `node_modules` if present
   - Mark reused if already exists

