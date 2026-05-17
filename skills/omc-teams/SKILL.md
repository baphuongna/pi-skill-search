---
name: omc-teams
description: CLI-team runtime for claude, codex, or gemini workers in tmux panes when you need process-based parallel execution
---

# OMC Teams Skill

Spawn N CLI worker processes in tmux panes to execute tasks in parallel. Supports `claude`, `codex`, and `gemini` agent types.

`/omc-teams` is a legacy compatibility skill for the CLI-first runtime: use `omc team ...` commands (not deprecated MCP runtime tools).

## Usage

```bash
omc-teams N:claude "task description"
omc-teams N:codex "task description"
omc-teams N:gemini "task description"
```

### Parameters

- **N** - Number of CLI workers (1-10)
- **agent-type** - `claude` (Claude CLI), `codex` (OpenAI Codex CLI), or `gemini` (Google Gemini CLI)
- **task** - Task description to distribute across all workers

### Examples

```bash
/omc-teams 2:claude "implement auth module with tests"
/omc-teams 2:codex "review the auth module for security issues"
/omc-teams 3:gemini "redesign UI components for accessibility"
```

## Requirements

- **tmux binary** must be installed and discoverable (`command -v tmux`)
- **Classic tmux session optional** for in-place pane splitting (`$TMUX` set). Inside cmux or a plain terminal, `omc team` falls back to a detached tmux session instead of splitting the current surface.
- **claude** CLI: `npm install -g @anthropic-ai/claude-code`
- **codex** CLI: `npm install -g @openai/codex`
- **gemini** CLI: `npm install -g @google/gemini-cli`

## Workflow

### Phase 0: Verify prerequisites

Check tmux explicitly before claiming it is missing:

```bash
command -v tmux >/dev/null 2>&1
```

- If this fails, report that **tmux is not installed** and stop.
- If `$TMUX` is set, `omc team` can reuse the current tmux window/panes directly.
- If `$TMUX` is empty but `CMUX_SURFACE_ID` is set, report that the user is running inside **cmux**. Do **not** say tmux is missing or that they are "not inside tmux"; `omc team` will launch a **detached tmux session** for workers instead of splitting the cmux surface.
- If neither `$TMUX` nor `CMUX_SURFACE_ID` is set, report that the user is in a **plain terminal**. `omc team` can still launch a **detached tmux session**, but if they specifically want in-place pane/window topology they should start from a classic tmux session first.
- If you need to confirm the active tmux session, use:

```bash
tmux display-message -p '#S'
```

### Phase 1: Parse + validate input

Extract:

- `N` — worker count (1–10)
- `agent-type` — `claude|codex|gemini`
- `task` — task description

Validate before decomposing or running anything:

- Reject unsupported agent types up front. `/omc-teams` only supports **`claude`**, **`codex`**, and **`gemini`**.
- If the user asks for an unsupported type such as `expert`, explain that `/omc-teams` launches external CLI workers only.
- For native Claude Code team agents/roles, direct them to **`team`** instead.

### Phase 2: Decompose task

Break work into N independent subtasks (file- or concern-scoped) to avoid write conflicts.

### Phase 2.5: Resolve workspace root for multi-repo plans
