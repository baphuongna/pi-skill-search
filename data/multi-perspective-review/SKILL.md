---
name: multi-perspective-review
description: Use when reviewing a plan, diff, implementation, worker output, release candidate, or external review feedback.
---


# multi-perspective-review

Core principle: review early, review often, and separate concerns. Reviewer output is evidence to evaluate, not an instruction to obey blindly.

Distilled from detailed reads of requesting-code-review, receiving-code-review, subagent review checkpoints, differential review, and specialized review-agent patterns.

## Review Passes

Run relevant passes separately:

1. Spec compliance: Does the work match the request and nothing extra?
2. Correctness: Are edge cases, state transitions, and failure paths right?
3. Regression risk: Could config precedence, runtime defaults, or public APIs break?
4. Security: Trust boundaries, path containment, prompt injection, secrets, permissions.
5. Tests: Do tests assert the changed behavior and isolation concerns?
6. Maintainability: Narrow diff, typed inputs, clear ownership, reversible changes.
7. Operator experience: Error/status text, recovery hints, artifacts, logs.
8. Compatibility: Windows paths, Node/Pi versions, CLI flags, legacy paths.

## Finding Format

```text
[severity] path:line or symbol
Issue: ...
Impact: ...
Fix: ...
Verification: ...
```

Severity:

- critical: data loss, secret leak, arbitrary command/path escape, unusable default install;
- high: broken core workflow, ownership bypass, persistent incorrect state;
- medium: important regression, flaky test, confusing recoverable behavior;
- low: polish, maintainability, docs.

## Example Findings by Perspective

### Spec Compliance

```
[medium] src/runtime/task-runner.ts:89
Issue: `executeWorkers` is checked once at top of runTeamTask but the value
  is passed through an untyped parameter. The function comment says "workers
  are disabled in scaffold mode" but the actual behavior is driven by `runtimeKind`.
Impact: If someone changes the comment but not the code, the mismatch is invisible.
Fix: Add a runtimeKind guard and deprecate the executeWorkers parameter.
Verification: `npx tsc --noEmit` passes; test with `PI_TEAMS_MOCK_CHILD_PI=scaffold`.
```

### Correctness

```
[high] src/runtime/live-agent-manager.ts:47
Issue: `registerLiveAgent` returns the new handle but callers may use the
  old handle reference if they captured it before the call.
Impact: Status updates may apply to the wrong handle if the agent re-registers.
Fix: Always call `getLiveAgent` after `registerLiveAgent` to get the canonical handle.
Verification: Add test that verifies status after re-registration.
```

### Regression Risk

```
[medium] src/state/state-store.ts:150
Issue: `saveRunTasks` uses `atomicWriteJson` but the file may grow large.
  No pagination or archiving strategy for long-running runs.
Impact: Tasks file could exceed 10MB with many updates, causing slow I/O.
Fix: Consider splitting into per-task files or adding a size warning.
Verification: Load test with 10,000 task updates.
```

### Security

```
[critical] src/utils/safe-paths.ts:20
Issue: `resolveRealContainedPath` follows symlinks but doesn't verify the
  resolved path stays under the allowed base.
Impact: A malicious symlink could escape the workspace boundary.
