---
name: worktree-isolation
description: Conflict-safe git worktree workflow. Use when running parallel implementation workers, isolating risky edits, or cleaning up task worktrees.
---


# worktree-isolation

Use this skill for worktree-based execution or cleanup. Git worktrees create isolated working directories that allow parallel code-changing tasks without git conflicts.

## How Worktrees Work

A git worktree is a separate working directory linked to the same repository. It has its own:
- Working directory (different path)
- HEAD (can be on a different branch)
- Staged/unstaged changes

But it shares:
- Object database (`.git/objects`)
- Refs (branches, tags)

This means creating a worktree is cheap (no clone needed) and fast.

## When to Use Worktrees

**Use worktree mode when:**
- Running parallel implementation workers that modify the same repo
- Isolating risky changes that might need to be discarded
- Running multiple agents on the same codebase simultaneously
- Running a long task that would block other work

**Don't use worktree mode when:**
- The task is read-only (use scaffold mode instead)
- Only one agent needs to work at a time
- The repository has uncommitted changes (must be clean)

## Worktree Lifecycle

### 1. Creation

**Prerequisites:**
- Leader repository must be clean (`git status` empty)
- Sufficient disk space for worktree directory

**Creation flow:**
```
team-runner.ts (workspaceMode: "worktree")
  → prepareTaskWorkspace(manifest, task)
    → assertCleanLeader(repoRoot)
    → git worktree add <path> <branch>
    → linkNodeModulesIfPresent(repoRoot, worktreePath)
    → return { cwd: worktreePath, worktreePath, branch }
```

**Naming convention:**
- Branch: `crew/<sanitized-runId>-<sanitized-taskId>`
- Path: `.worktrees/<runId>/<taskId>/`
- Deterministic from run/task IDs — no user-controlled fragments

**Example:**
```
Run: team_20260514092752_218fe358085d7115
Task: 01_explore

Branch: crew/team-20260514092752-218fe358085d7115/01-explore
Path: .worktrees/team-20260514092752-218fe358085d7115/01-explore/
```

### 2. Reuse

If a worktree with the same branch already exists, it is reused instead of recreated:

```typescript
// Check if worktree already exists
const existing = git(cwd, ["worktree", "list", "--porcelain"]);
if (existing.includes(branch)) {
  return { reused: true, worktreePath: parsePath(existing) };
}
```

Reuse is safe when the worktree's base branch hasn't diverged (checked via `branch-freshness.ts`).

### 3. Work in worktree

Each task works in its own worktree directory:
