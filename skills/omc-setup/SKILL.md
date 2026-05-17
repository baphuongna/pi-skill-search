---
name: omc-setup
description: Install or refresh oh-my-claudecode for plugin, npm, and local-dev setups from the canonical setup flow
---


# OMC Setup

This is the **only command you need to learn**. After running this, everything else is automatic.

**When this skill is invoked, immediately execute the workflow below. Do not only restate or summarize these instructions back to the user.**

Note: All `~/.claude/...` paths in this guide respect `CLAUDE_CONFIG_DIR` when that environment variable is set.

## Best-Fit Use

Choose this setup flow when the user wants to **install, refresh, or repair OMC itself**.

- Marketplace/plugin install users should land here after `/plugin install oh-my-claudecode`
- npm users should land here after `npm i -g oh-my-claude-sisyphus@latest`
- local-dev and worktree users should land here after updating the checked-out repo and rerunning setup

## Flag Parsing

Check for flags in the user's invocation:
- `--help` → Show Help Text (below) and stop
- `--local` → Phase 1 only (target=local), then stop
- `--global` → Phase 1 only (target=global), then stop
- `--force` → Skip Pre-Setup Check, run full setup (Phase 1 → 2 → 3 → 4)
- No flags → Run Pre-Setup Check, then full setup if needed

## Help Text

When user runs with `--help`, display this and stop:

```
OMC Setup - Configure oh-my-claudecode

USAGE:
  /oh-my-claudecode:omc-setup           Run initial setup wizard (or update if already configured)
  /oh-my-claudecode:omc-setup --local   Configure local project (.claude/CLAUDE.md)
  /oh-my-claudecode:omc-setup --global  Configure global settings (~/.claude/CLAUDE.md)
  /oh-my-claudecode:omc-setup --force   Force full setup wizard even if already configured
  /oh-my-claudecode:omc-setup --help    Show this help

MODES:
  Initial Setup (no flags)
    - Interactive wizard for first-time setup
    - Configures CLAUDE.md (local or global)
    - Sets up HUD statusline
    - Checks for updates
    - Offers MCP server configuration
    - Configures team mode defaults (agent count, type, model)
    - If already configured, offers quick update option

  Local Configuration (--local)
    - Downloads fresh CLAUDE.md to ./.claude/
    - Backs up existing CLAUDE.md to .claude/CLAUDE.md.backup.YYYY-MM-DD
    - Project-specific settings
    - Use this to update project config after OMC upgrades

  Global Configuration (--global)
    - Downloads fresh CLAUDE.md to ~/.claude/
    - Backs up existing CLAUDE.md to ~/.claude/CLAUDE.md.backup.YYYY-MM-DD
    - Default: explicitly overwrites ~/.claude/CLAUDE.md so plain `claude` also uses OMC
    - Optional preserve mode keeps the user's base `CLAUDE.md` and installs OMC into `CLAUDE-omc.md` for `omc` launches
    - Applies to all Claude Code sessions
    - Cleans up legacy hooks
    - Use this to update global config after OMC upgrades

  Force Full Setup (--force)
    - Bypasses the "already configured" check
    - Runs the complete setup wizard from scratch
    - Use when you want to reconfigure preferences

EXAMPLES:
  /oh-my-claudecode:omc-setup           # First time setup (or update CLAUDE.md if configured)
  /oh-my-claudecode:omc-setup --local   # Update this project
  /oh-my-claudecode:omc-setup --global  # Update all projects
  /oh-my-claudecode:omc-setup --force   # Re-run full setup wizard

For more info: https://github.com/Yeachan-Heo/oh-my-claudecode
```

## Pre-Setup Check: Already Configured?
