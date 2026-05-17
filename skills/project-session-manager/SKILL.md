---
name: project-session-manager
description: Worktree-first dev environment manager for issues, PRs, and features with optional tmux sessions
---


# Project Session Manager (PSM) Skill

`psm` is the compatibility alias for this canonical skill entrypoint.

> **Quick Start (worktree-first):** Start with `omc teleport` when you want an isolated issue/PR/feature worktree before adding any tmux/session orchestration:
> ```bash
> omc teleport #123          # Create worktree for issue/PR
> omc teleport my-feature    # Create worktree for feature
> omc teleport list          # List worktrees
> ```
> See [Teleport Command](#teleport-command) below for details.

Automate isolated development environments using git worktrees and tmux sessions with Claude Code. Enables parallel work across multiple tasks, projects, and repositories.

Canonical slash command: `/oh-my-claudecode:project-session-manager` (alias: `/oh-my-claudecode:psm`).

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `review <ref>` | PR review session | `/psm review omc#123` |
| `fix <ref>` | Issue fix session | `/psm fix omc#42` |
| `feature <proj> <name>` | Feature development | `/psm feature omc add-webhooks` |
| `list [project]` | List active sessions | `/psm list` |
| `attach <session>` | Attach to session | `/psm attach omc:pr-123` |
| `kill <session>` | Kill session | `/psm kill omc:pr-123` |
| `cleanup` | Clean merged/closed | `/psm cleanup` |
| `status` | Current session info | `/psm status` |

## Project References

Supported formats:
- **Alias**: `omc#123` (requires `~/.psm/projects.json`)
- **Full**: `owner/repo#123`
- **URL**: `https://github.com/owner/repo/pull/123`
- **Current**: `#123` (uses current directory's repo)

## Configuration

### Project Aliases (`~/.psm/projects.json`)

```json
{
  "aliases": {
    "omc": {
      "repo": "Yeachan-Heo/oh-my-claudecode",
      "local": "~/Workspace/oh-my-claudecode",
      "default_base": "main"
    }
  },
  "defaults": {
    "worktree_root": "~/.psm/worktrees",
    "cleanup_after_days": 14
  }
}
```

## Providers

PSM supports multiple issue tracking providers:

| Provider | CLI Required | Reference Formats | Commands |
|----------|--------------|-------------------|----------|
| GitHub (default) | `gh` | `owner/repo#123`, `alias#123`, GitHub URLs | review, fix, feature |
| Jira | `jira` | `PROJ-123` (if PROJ configured), `alias#123` | fix, feature |

### Jira Configuration

To use Jira, add an alias with `jira_project` and `provider: "jira"`:

```json
{
  "aliases": {
    "mywork": {
      "jira_project": "MYPROJ",
      "repo": "mycompany/my-project",
      "local": "~/Workspace/my-project",
      "default_base": "develop",
      "provider": "jira"
```

