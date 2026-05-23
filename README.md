# pi-skill-search

> Pi extension: replace "inject all skill descriptions" with on-demand search tool + category summary.

## Problem

Pi injects **all** skill `<available_skills>` descriptions into every agent's system prompt. With 258+ skills across 14 categories, that's ~40,000+ tokens wasted per turn — even when the agent never uses any skill.

## Solution

- **Strip** the `<available_skills>` block from the system prompt on `before_agent_start`
- **Inject** a compact `## Available Skill Domains` category summary (≤250 tokens)
- **Register** a `skill-search` tool the agent calls on-demand to find relevant skills

Result: **~97% token reduction** in skill-related system prompt content.

## Installation

```bash
# Install from local source
npx pi install .

# Or from npm (when published)
npm install pi-skill-search
```

The `install.mjs` script automatically sets up the `skill-search` skill in `~/.pi/agent/skills/` so Pi can discover it.

## Quick Start

```bash
# Run tests
npm test

# Build fixture from scientific-agent-skills
npx tsx scripts/build-skills-fixture.ts
```

## Architecture

```
index.ts              ← Extension entry (before_agent_start + skill-search tool)
install.mjs           ← Post-install: copy skill-search to ~/.pi/agent/skills/
src/
  scanner.ts          ← findCorpusPath() + scanSkillDirectory()
  types.ts            ← PiSkill, SkillEntry, SearchResult, SkillIndex
  text.ts             ← Tokenizer (SPEC §5.3)
  synonyms.ts         ← Synonym dictionary + expandQuery
  categories.ts       ← 14 category rules + classify()
  indexer.ts          ← buildIndex() two-pass + fingerprintSkills()
  search.ts           ← Scored search (SPEC §5.1)
  strip.ts            ← Regex strip <available_skills>
  format.ts           ← Category summary + result formatting
  proactive.ts        ← Python package detection (Phase 10, opt-in)
data/                 ← 284 skills corpus for search (not discovered by Pi)
test/
  text.test.ts        ← 12 tests
  synonyms.test.ts    ← 8 tests
  classify.test.ts    ← 8 tests
  indexer.test.ts     ← 12 tests
  search.test.ts      ← 11 tests
  format.test.ts     ← 12 tests
  strip.test.ts       ← 6 tests
  lifecycle.test.ts   ← 15 tests
  integration.test.ts ← 8 tests (284-skill corpus)
  failure-isolation.test.ts ← 3 tests
  coverage.test.ts    ← 3 tests (classifier coverage)
  proactive.test.ts   ← 9 tests
  scanner.test.ts     ← 7 tests
  search-quality.test.ts ← 10 tests
```

## Tool: `skill-search`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ | Search query (1–500 chars) |
| `limit` | number | ❌ | Max results (1-20, default 5) |

Returns formatted skill descriptions with name, description, category, and file path.

## How It Works

1. **At session start**: Extension scans `data/` (284 skills) and builds a search index
2. **On `before_agent_start`**: Strips `<available_skills>` block, injects category summary, registers `skill-search` tool
3. **On `skill-search` call**: Returns top matching skills with path for `read` tool

## Configuration

No configuration needed — the extension auto-indexes skills from `data/` on startup.

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Skills in `data/` not `skills/` | Pi would discover them and inject-all again |
| skill-search in `~/.pi/agent/skills/` | Pi discovers skills here, not in extension dirs |
| install.mjs for skill setup | pi install doesn't auto-discover extension skills |

## License

MIT