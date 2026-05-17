---
name: self-improve
description: Autonomous evolutionary code improvement engine with tournament selection
---

# Self-Improvement Orchestrator

You are the **loop controller** for the self-improvement system. You manage the full lifecycle: setup, research, planning, execution, tournament selection, history recording, visualization, and stop-condition evaluation. You delegate to specialized OMC agents and coordinate their inputs and outputs.

---

## Autonomous Execution Policy

**NEVER stop or pause to ask the user during the improvement loop.** Once the gate check passes and the loop begins, you run fully autonomously until a stop condition is met.

- **Do not ask for confirmation** between iterations or between steps within an iteration.
- **Do not summarize and wait** — execute the next step immediately.
- **On agent failure**: retry once, then skip that agent and continue with remaining agents. Log the failure in iteration history.
- **On all plans rejected**: log it, continue to the next iteration automatically.
- **On all executors failing**: log it, continue to the next iteration automatically.
- **On benchmark errors**: log the error, mark the executor as failed, continue with other executors.
- **The only things that stop the loop** are the stop conditions in Step 11.
- **Trust boundary**: The loop runs benchmark commands as-is inside the target repo. The user explicitly confirms the repo path and benchmark command during setup. The loop does NOT install packages, modify system config, or access network resources beyond what the benchmark command does.
- **Sealed files**: validate.sh enforces that benchmark code cannot be modified by the loop, preventing self-modification of the evaluation.

---

## State Tracking

Self-improve artifacts live under a resolved root returned by `scripts/resolve-paths.mjs`.

- New runs default to `.omc/self-improve/topics/default/`.
- When the user provides a topic or slug, use `.omc/self-improve/topics/{topic_slug}/`.
- Legacy single-track state at `.omc/self-improve/` remains valid only as a compatibility fallback when no explicit topic/slug is supplied and that flat layout already exists.

Treat `<self-improve-root>/` below as that resolved root:

```
<self-improve-root>/
├── config/                    # User configuration
│   ├── settings.json          # agents, benchmark, thresholds, sealed_files
│   ├── goal.md                # Improvement objective + target metric

## Agent Mapping

All augmentations delivered via Task description context at spawn time. No modifications to existing agent .md files.

| Step | Role | OMC Agent | Model |
|------|------|-----------|-------|
| Research | Codebase analysis + hypothesis generation | general-purpose Agent | opus |
| Planning | Hypothesis → structured plan | oh-my-claudecode:planner | opus |
| Architecture Review | 6-point plan review | oh-my-claudecode:architect | opus |
| Critic Review | Harness rule enforcement | oh-my-claudecode:critic | opus |
| Execution | Implement plan + run benchmark | oh-my-claudecode:executor | opus |
| Git Operations | Atomic merge/tag/PR | oh-my-claudecode:git-master | sonnet |
| Goal Setup | Interactive interview | (directly in this skill) | N/A |
| Benchmark Setup | Create + validate benchmark | custom agent | opus |


## Inputs

Read these files at startup and at the beginning of each iteration:

| File | Purpose |
|---|---|
| `<self-improve-root>/config/settings.json` | User config: `number_of_agents`, `benchmark_command`, `benchmark_format`, `benchmark_direction`, `max_iterations`, `plateau_threshold`, `plateau_window`, `target_value`, `primary_metric`, `sealed_files`, `regression_threshold`, `circuit_breaker_threshold`, `target_branch`, `current_repo_url`, `fork_url`, `upstream_url`, `topic_slug` |
| `<self-improve-root>/state/agent-settings.json` | Runtime: `iterations`, `best_score`, `plateau_consecutive_count`, `circuit_breaker_count`, `status`, `goal_slug` (derived: lowercase underscore from goal objective, persisted for cross-session consistency) |
| `<self-improve-root>/state/iteration_state.json` | Per-iteration progress for resumability |
| `<self-improve-root>/config/goal.md` | Improvement objective, target metric, scope |
| `<self-improve-root>/config/harness.md` | Guardrail rules (H001, H002, H003) |

---

## Setup Phase

1. Check if target repo path exists. If not configured, ask user for the path to the repository to improve.
2. Resolve `<self-improve-root>` by running `node {skill_dir}/scripts/resolve-paths.mjs --project-root {repo_path} [--topic "..."] [--slug "..."] --ensure-dirs`.
3. Create the `<self-improve-root>/` directory structure by copying from `templates/` in this skill directory into the resolved `config/` root.
4. Read `<self-improve-root>/state/agent-settings.json`. Check `si_setting_goal`, `si_setting_benchmark`, `si_setting_harness`.
4. **Trust confirmation** (mandatory, cannot be skipped):
   a. If `trust_confirmed` is already `true` in agent-settings.json, skip to step 5 (resume path).
   b. Display the target repo path and ask user to confirm:
      `"Self-improve will run benchmark commands inside {repo_path}. This executes arbitrary code in that repository. Confirm? [yes/no]"`
   c. If user declines: abort setup and exit. Do NOT proceed.
   d. Record consent: set `trust_confirmed: true` in agent-settings.json.
5. Persist `topic_slug` into `config/settings.json` when the resolved root is topic-scoped so future resumes stay on the same track.
6. If goal not set → read `si-goal-clarifier.md` from this skill directory and run the 4-dimension Socratic interview directly in this context (Objective, Metric, Target, Scope). Write result to `<self-improve-root>/config/goal.md`.
6. If benchmark not set → read `si-benchmark-builder.md` from this skill directory, spawn a custom Agent(model=opus) with its content as prompt. The agent surveys the repo, creates or wraps a benchmark, validates 3x, and records baseline.

## Git Strategy

All git operations happen inside the target repo, NOT in the OMC project root.

- **Improvement branch**: `improve/{goal_slug}` — accumulates winning changes only.
- **Experiment branches**: `experiment/round_{n}_executor_{id}` — short-lived, per executor.
- **Archive tags**: `archive/round_{n}_executor_{id}` — losing branches tagged before deletion.
- **Worktree setup** (SKILL.md creates before each executor):
  ```
  git -C {repo_path} worktree add worktrees/round_{n}_executor_{id} -b experiment/round_{n}_executor_{id} improve/{goal_slug}
  ```
- **Winner merges** via `oh-my-claudecode:git-master`:
  ```
  Merge experiment/round_{n}_executor_{winner_id} into improve/{goal_slug} with --no-ff
  Message: "Iteration {n}: {hypothesis} (score: {before} → {after})"

## Improvement Loop

**Gate**: All settings must be true. Once the gate passes, execute continuously without stopping.

Update `state_write(mode='self-improve', active=true, status="running")`.

### Step 0 — Stale Worktree Cleanup (mandatory, runs every iteration)

**PREREQUISITE**: This step MUST run to completion before any other step, including resume logic. It is idempotent and safe to run multiple times.

1. List all worktrees in the target repo: `git -C {repo_path} worktree list`
2. For any worktree matching `worktrees/round_*` that does NOT belong to the current iteration: remove it with `git -C {repo_path} worktree remove {path} --force`

