---
name: skill
description: Manage local skills - list, add, remove, search, edit, setup wizard
---

# Skill Management CLI

Meta-skill for managing oh-my-claudecode skills via CLI-like commands.

## Subcommands

### /skill list

Show all available skills organized by scope.

**Behavior:**
1. Scan bundled built-in skills in the plugin `skills/` directory (read-only)
2. Scan user skills at `${CLAUDE_CONFIG_DIR:-~/.claude}/skills/omc-learned/`
3. Scan project skills at `.omc/skills/`
4. Parse YAML frontmatter for metadata
5. Display in organized table format:

```
BUILT-IN SKILLS (bundled with oh-my-claudecode):
| Name              | Description                    | Scope    |
|-------------------|--------------------------------|----------|

### /skill add [name]

Interactive wizard for creating a new skill.

**Behavior:**
1. **Ask for skill name** (if not provided in command)
   - Validate: lowercase, hyphens only, no spaces
2. **Ask for description**
   - Clear, concise one-liner
3. **Ask for triggers** (comma-separated keywords)
   - Example: "error, fix, debug"
4. **Ask for argument hint** (optional)
   - Example: "<file> [options]"
5. **Ask for scope:**
   - `user` → `${CLAUDE_CONFIG_DIR:-~/.claude}/skills/omc-learned//SKILL.md`

#  Skill

## Purpose

[Describe what this skill does]

## When to Activate

[Describe triggers and conditions]

## Workflow

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Examples

```
/oh-my-claudecode: example-arg
```

## Notes

[Additional context, edge cases, gotchas]
```

7. **Report success** with file path
8. **Suggest:** "Edit `/skill edit ` to customize content"

**Example:**
```
User: /skill add custom-logger
Assistant: Creating new skill 'custom-logger'...

Description: Enhanced logging with structured output
Triggers (comma-separated): log, logger, logging

### /skill remove 

Remove a skill by name.

**Behavior:**
1. **Search for skill** in both scopes:
   - `${CLAUDE_CONFIG_DIR:-~/.claude}/skills/omc-learned//SKILL.md`
   - `.omc/skills//SKILL.md`
2. **If found:**
   - Display skill info (name, description, scope)
   - **Ask for confirmation:** "Delete '' skill from <scope>? (yes/no)"
3. **If confirmed:**
   - Delete entire skill directory (e.g., `${CLAUDE_CONFIG_DIR:-~/.claude}/skills/omc-learned//`)
   - Report: "✓ Removed skill '' from <scope>"
4. **If not found:**

### /skill edit 

Edit an existing skill interactively.

**Behavior:**
1. **Find skill** by name (search both scopes)
2. **Read current content** via Read tool
3. **Display current values:**
   ```
   Current skill 'custom-logger':
   - Description: Enhanced logging with structured output
   - Triggers: log, logger, logging
   - Argument hint: <level> [message]
   - Scope: user

### /skill search <query>

Search skills by content, triggers, name, or description.


