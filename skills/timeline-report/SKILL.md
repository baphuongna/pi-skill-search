---
name: timeline-report
description: Generate a "Journey Into [Project]" narrative report analyzing a project's entire development history from claude-mem's timeline. Use when asked for a timeline report, project history analysis, development journey, or full project report.
---

# Timeline Report

Generate a comprehensive narrative analysis of a project's entire development history using claude-mem's persistent memory timeline.

## When to Use

Use when users ask for:

- "Write a timeline report"
- "Journey into [project]"
- "Analyze my project history"
- "Full project report"
- "Summarize the entire development history"
- "What's the story of this project?"

## Prerequisites

The claude-mem worker must be running. The project must have claude-mem observations recorded.

**Resolve the worker port** (do this once at the start and reuse `$WORKER_PORT` in every curl call below):

```bash
WORKER_PORT="${CLAUDE_MEM_WORKER_PORT:-$(node -e "const fs=require('fs'),p=require('path'),os=require('os');const uid=(typeof process.getuid==='function'?process.getuid():77);const fallback=String(37700+(uid%100));try{const s=JSON.parse(fs.readFileSync(p.join(os.homedir(),'.claude-mem','settings.json'),'utf-8'));process.stdout.write(String(s.CLAUDE_MEM_WORKER_PORT||fallback));}catch{process.stdout.write(fallback);}" 2>/dev/null)}"
```

This honors `CLAUDE_MEM_WORKER_PORT` env, then `~/.claude-mem/settings.json`, then falls back to the per-UID default `37700 + (uid % 100)` — matching how the worker itself picks its port. Required for multi-account setups (#2101) and any user who has overridden the default port (#2103).

## Workflow

### Step 1: Determine the Project Name

Ask the user which project to analyze if not obvious from context. The project name is typically the directory name of the project (e.g., "tokyo", "my-app"). If the user says "this project", use the current working directory's basename.

**Worktree Detection:** Before using the directory basename, check if the current directory is a git worktree. In a worktree, the data source is the **parent project**, not the worktree directory itself. Run:

```bash
git_dir=$(git rev-parse --git-dir 2>/dev/null)
git_common_dir=$(git rev-parse --git-common-dir 2>/dev/null)
if [ "$git_dir" != "$git_common_dir" ]; then
  # We're in a worktree — resolve the parent project name
  parent_project=$(basename "$(dirname "$git_common_dir")")
  echo "Worktree detected. Parent project: $parent_project"
else
  parent_project=$(basename "$PWD")

### Step 2: Fetch the Full Timeline

Use Bash to fetch the complete timeline from the claude-mem worker API:

```bash
curl -s "http://localhost:${WORKER_PORT}/api/context/inject?project=PROJECT_NAME&full=true"
```

This returns the entire compressed timeline -- every observation, session boundary, and summary across the project's full history. The response is pre-formatted markdown optimized for LLM consumption.

**Token estimates:** The full timeline size depends on the project's history:
- Small project (< 1,000 observations): ~20-50K tokens
- Medium project (1,000-10,000 observations): ~50-300K tokens
- Large project (10,000-35,000 observations): ~300-750K tokens

If the response is empty or returns an error, the worker may not be running or the project name may be wrong. Try `curl -s "http://localhost:${WORKER_PORT}/api/search?query=*&limit=1"` to verify the worker is healthy.

### Step 3: Estimate Token Count

Before proceeding, estimate the token count of the fetched timeline (roughly 1 token per 4 characters). Report this to the user:

```
Timeline fetched: ~X observations, estimated ~Yk tokens.
This analysis will consume approximately Yk input tokens + ~5-10k output tokens.
Proceed? (y/n)
```

Wait for user confirmation before continuing if the timeline exceeds 100K tokens.

### Step 4: Analyze with a Subagent

Deploy an Agent (using the Task tool) with the full timeline and the following analysis prompt. Pass the ENTIRE timeline as context to the agent. The agent should also be instructed to query the SQLite database at `~/.claude-mem/claude-mem.db` for the Token Economics section.

**Agent prompt:**

```
