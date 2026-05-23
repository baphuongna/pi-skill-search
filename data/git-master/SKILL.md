---
name: git-master
description: Commit and release hygiene for safe version-control work. Use when preparing commits, releases, version bumps, publishing, or validating package installation.
---


# git-master

Use this skill for commit/release hygiene. This skill covers git workflow from local changes to published releases.

## Pre-commit Checklist

Before every commit:

1. Run `git status --short` — understand what changed
2. Stage only files related to the current task
3. Review staged diff with `git diff --staged`
4. Check for unintended changes (generated files, temp files, secrets)
5. Ensure tests pass locally before committing

## Commit Rules

- **Independent commits**: Each commit should be self-contained and revertible. Don't mix unrelated changes.
- **Concise messages**: Use imperative mood, 50 chars or less for subject. Add body for context.
- **Format**: `type(scope): subject` where type is `fix`, `feat`, `chore`, `docs`, `test`, `refactor`
- **Do not include**: secrets, OTPs, local temp files, `node_modules`, `dist/`, `*.log`, `*.tmp`
- **Do not push/publish** unless explicitly requested
- **Verify** before staging large generated files (tarballs, build outputs)

## Commit Message Format

```
type(scope): short description (50 chars max)

 Longer description if needed. Explain WHY the change was made,
 not just what changed. Reference issues/PRs if applicable.

Refs: #123
```

**Examples:**
```
fix(live-agent): prevent cross-workspace agent access
feat(widget): add snapshot cache with 500ms TTL
docs(skills): add event-log-tracing skill
chore(tests): add integration test for reconcileAllStaleRuns
```

## Branch Naming

| Pattern | Use case | Example |
|---|---|---|
| `fix/<description>` | Bug fixes | `fix/ghost-run-display` |
| `feat/<description>` | New features | `feat/skill-templates` |
| `docs/<description>` | Documentation | `docs/skills-deep-research` |
| `chore/<description>` | Tooling, CI | `chore/update-ci-node22` |
| `hotfix/<description>` | Urgent production fixes | `hotfix/secret-leak` |

## Rollback Procedures

### Revert last commit (safe, keeps history)
```bash
git revert HEAD
git push
```

### Reset to known-good state (rewrites history)
```bash
# Soft: keep changes staged
git reset --soft HEAD~1

# Mixed: keep changes unstaged
git reset HEAD~1

# Hard: discard all changes (DESTRUCTIVE)
git reset --hard <commit-hash>
```

### Checkout single file from a past commit
```bash
git checkout <commit-hash> -- path/to/file
```

### Recover from a bad reset
```bash
