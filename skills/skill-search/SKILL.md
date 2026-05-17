---
name: skill-search
description: On-demand skill discovery tool. Use when you need to find relevant skills for a task instead of scanning all available skills manually. Replaces full skill injection with search-by-keyword.
---
# skill-search

Use this skill when you need to **find** the right skill for a task from a large collection.

## When to use

- You see `## Available Skill Domains` in your system prompt — this means `pi-skill-search` is active and skills are indexed.
- You need a skill for a specific task but don't know its exact name.
- A user mentions a domain (chemistry, ML, plotting, databases…) and you want matching skills.
- You're about to work on a task that could benefit from specialized instructions.

## How to use

### 1. Search for skills

Call the `skill-search` tool with a keyword query:

```
skill-search({ query: "molecular docking", limit: 5 })
```

- `query` (required): 1–500 characters. Use **domain keywords**, tool names, or task descriptions.
- `limit` (optional): 1–20 results, default 5.

### 2. Read the full skill

Search results return `name`, `description`, and `path`. **Always** use the `read` tool to load the full SKILL.md from the returned path before following its instructions:

```
read({ path: "/path/to/skill/SKILL.md" })
```

When a skill file references relative paths, resolve them against the skill's parent directory.

### 3. Follow the skill's instructions

After loading SKILL.md, follow its guidance for the current task. Each skill contains domain-specific rules, anti-patterns, and code conventions.

## Query tips

| Strategy | Example query | When |
|---|---|---|
| Domain keyword | `"plotting"`, `"database"`, `"genomics"` | Broad exploration |
| Tool/library name | `"rdkit"`, `"scanpy"`, `"spark"` | You know the tool |
| Task description | `"train machine learning model"` | Describe what you want |
| Category hint | `"chemistry"`, `"visualization"` | Browse a domain |

The search engine applies **synonym expansion** automatically (e.g., "ml" → "machine learning", "plot" → "plotting visualization chart graph"). You don't need to guess exact keywords.

## How it works

1. **At session start**, the extension strips the full `<available_skills>` block and replaces it with a compact category summary (~250 tokens instead of ~23,500 for 137 skills).
2. **On search**, it scores skills using tokenized query matching against name, description, and category keywords.
3. **Results** include name, description, score, and file path.

## Anti-patterns

- **Don't** call `skill-search` on every turn "just in case" — call it when you actually need a skill for the current task.
- **Don't** skip reading the SKILL.md — the search result description is a summary, not the full instructions.
- **Don't** assume the category summary lists every skill — it shows domain names and a few examples. Search for specifics.
- **Don't** use overly specific queries like exact error messages — use domain keywords instead.

