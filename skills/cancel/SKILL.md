---
name: cancel
description: Cancel any active OMC mode (autopilot, ralph, ultrawork, ultraqa, swarm, ultrapilot, pipeline, team)
---


# Cancel Skill

Intelligent cancellation that detects and cancels the active OMC mode.

**The cancel skill is the standard way to complete and exit any OMC mode.**
When the stop hook detects work is complete, it instructs the LLM to invoke
this skill for proper state cleanup. If cancel fails or is interrupted,
retry with `--force` flag, or wait for the 2-hour staleness timeout as
a last resort.

## What It Does

Automatically detects which mode is active and cancels it:
- **Autopilot**: Stops workflow, preserves progress for resume
- **Ralph**: Stops persistence loop, clears linked ultrawork if applicable
- **Ultrawork**: Stops parallel execution (standalone or linked)
- **UltraQA**: Stops QA cycling workflow
- **Swarm**: Stops coordinated agent swarm, releases claimed tasks
- **Ultrapilot**: Stops parallel autopilot workers
- **Pipeline**: Stops sequential agent pipeline
- **Team**: Sends shutdown_request to all teammates, waits for responses, calls TeamDelete, clears linked ralph if present
- **Team+Ralph (linked)**: Cancels team first (graceful shutdown), then clears ralph state. Cancelling ralph when linked also cancels team first.

## Usage

```
/oh-my-claudecode:cancel
```

Or say: "cancelomc", "stopomc"

## Critical: Deferred Tool Handling

The state management tools (`state_clear`, `state_read`, `state_write`, `state_list_active`,
`state_get_status`) may be registered as **deferred tools** by Claude Code. Before calling
any state tool, you MUST first load all of them via `ToolSearch`:

```
ToolSearch(query="select:mcp__plugin_oh-my-claudecode_t__state_clear,mcp__plugin_oh-my-claudecode_t__state_read,mcp__plugin_oh-my-claudecode_t__state_write,mcp__plugin_oh-my-claudecode_t__state_list_active,mcp__plugin_oh-my-claudecode_t__state_get_status")
```

If `state_clear` is unavailable or fails, use this **bash fallback** as an **emergency
escape from the stop hook loop**. This is NOT a full replacement for the cancel flow —
it only removes state files to unblock the session. Linked modes (e.g. ralph→ultrawork,
autopilot→ralph/ultraqa) must be cleared separately by running the fallback once per mode.

Replace `MODE` with the specific mode (e.g. `ralplan`, `ralph`, `ultrawork`, `ultraqa`).

**WARNING:** Do NOT use this fallback for `autopilot` or `omc-teams`. Autopilot requires
`state_write(active=false)` to preserve resume data. omc-teams requires tmux session
cleanup that cannot be done via file deletion alone.

```bash
# Fallback: direct file removal when state_clear MCP tool is unavailable
SESSION_ID="${CLAUDE_SESSION_ID:-${CLAUDECODE_SESSION_ID:-}}"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || { d="$PWD"; while [ "$d" != "/" ] && [ ! -d "$d/.omc" ]; do d="$(dirname "$d")"; done; echo "$d"; })"

# Cross-platform SHA-256 (macOS: shasum, Linux: sha256sum)
sha256portable() { printf '%s' "$1" | (sha256sum 2>/dev/null || shasum -a 256) | cut -c1-16; }

# Resolve state directory (supports OMC_STATE_DIR centralized storage)
if [ -n "${OMC_STATE_DIR:-}" ]; then
  # Mirror getProjectIdentifier() from worktree-paths.ts
  SOURCE="$(git remote get-url origin 2>/dev/null || echo "$REPO_ROOT")"
  HASH="$(sha256portable "$SOURCE")"
  DIR_NAME="$(basename "$REPO_ROOT" | sed 's/[^a-zA-Z0-9_-]/_/g')"
  OMC_STATE="$OMC_STATE_DIR/${DIR_NAME}-${HASH}/state"
  [ ! -d "$OMC_STATE" ] && { echo "ERROR: State dir not found at $OMC_STATE" >&2; exit 1; }
elif [ "$REPO_ROOT" != "/" ] && [ -d "$REPO_ROOT/.omc" ]; then
  OMC_STATE="$REPO_ROOT/.omc/state"
else
  echo "ERROR: Could not locate .omc state directory" >&2
  exit 1
fi
MODE="ralplan"  # <-- replace with the target mode

# Clear session-scoped state for the specific mode
if [ -n "$SESSION_ID" ] && [ -d "$OMC_STATE/sessions/$SESSION_ID" ]; then
  rm -f "$OMC_STATE/sessions/$SESSION_ID/${MODE}-state.json"
```
