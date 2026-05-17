---
name: read-only-explorer
description: Read-only exploration and audit workflow. Use for explorer, analyst, reviewer, and source-audit roles that must inspect code without modifying files.
---


# read-only-explorer

Use this skill for explorer, analyst, reviewer, and source-audit roles. These roles must inspect code without modifying it.

## Core Contract

1. **Do not edit files** — no write, no edit, no delete
2. **Do not write generated artifacts** outside the run artifact directory
3. **Prefer read-only commands**: `read`, `rg`, `find`, `ls`, `git status`
4. **Record exact files inspected** — include path and relevant line numbers
5. **Distinguish direct evidence from inference** — don't guess
6. **If implementation is needed, recommend** — don't modify code

## Tool Selection Guide

Choosing the right tool for the task reduces noise and speeds up discovery.

### `rg` (ripgrep) — Code pattern search

**Best for:** Finding function definitions, imports, patterns, usages
```
# Find all uses of a function
rg "functionName" --type ts

# Find with context (2 lines before/after)
rg "pattern" -B2 -A2

# Case-insensitive
rg -i "error handling"

# Only match whole word
rg -w "agent"

# JSON output for machine parsing
rg "pattern" --json | head -20

# Respect .gitignore (skip node_modules)
rg "pattern" --type-add 'exclude:*.json' --type ts
```

### `find` — File and directory search

**Best for:** Finding files by name, type, or path pattern
```
# Find all TypeScript files
find . -name "*.ts" -not -path "*/node_modules/*" | head -20

# Find recently modified files
find . -name "*.ts" -mtime -7 | head -20

# Find files larger than 100KB
find . -size +100k -name "*.ts"

# Find by path pattern
find . -path "*/runtime/*" -name "*.ts" | head -10
```

### `read` — File content inspection

**Best for:** Reading specific files or file sections
```
# Read full file
read file.ts

# Read with line numbers
read -n file.ts  # (use read tool with offset/limit)

# Read first N lines
read --limit 50 file.ts

# Read specific section
read --offset 100 --limit 30 file.ts
```

### `ls` — Directory structure

**Best for:** Listing directories, understanding layout
```
ls src/runtime/
