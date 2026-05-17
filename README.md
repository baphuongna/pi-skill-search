# pi-skill-search

> Pi extension: replace "inject all skill descriptions" with on-demand search tool + category summary.

## Problem

Pi injects **all** skill `<available_skills>` descriptions into every agent's system prompt. With 258 skills across 14 categories, that's ~40,000+ tokens wasted per turn — even when the agent never uses any skill.

## Solution

- **Strip** the `<available_skills>` block from the system prompt on `before_agent_start`
- **Inject** a compact `## Available Skill Domains` category summary (≤250 tokens)
- **Register** a `skill-search` tool the agent calls on-demand to find relevant skills

Result: **~97% token reduction** in skill-related system prompt content.

## Quick Start

```bash
# Install
npm install

# Run tests
npm test

# Build fixture from scientific-agent-skills
npx tsx scripts/build-skills-fixture.ts
```

## Architecture

```
index.ts              ← Extension entry (before_agent_start + skill-search tool)
src/
  types.ts            ← PiSkill, SkillEntry, SearchResult, SkillIndex
  text.ts             ← Tokenizer (SPEC §5.3)
  synonyms.ts         ← Synonym dictionary + expandQuery
  categories.ts       ← 14 category rules + classify()
  indexer.ts          ← buildIndex() two-pass + fingerprintSkills()
  search.ts           ← Scored search (SPEC §5.1)
  strip.ts            ← Regex strip <available_skills>
  format.ts           ← Category summary + result formatting
  proactive.ts        ← Python package detection (Phase 10, opt-in)
test/
  text.test.ts        ← 12 tests
  synonyms.test.ts    ← 8 tests
  classify.test.ts    ← 8 tests
  indexer.test.ts     ← 12 tests
  search.test.ts      ← 11 tests
  format.test.ts      ← 12 tests
  strip.test.ts       ← 6 tests
  lifecycle.test.ts   ← 15 tests
  integration.test.ts ← 8 tests (258-skill corpus)
  failure-isolation.test.ts ← 3 tests
  coverage.test.ts    ← 3 tests (classifier coverage)
  proactive.test.ts   ← 9 tests
```

## Tool: `skill-search`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ | Search query (1–500 chars) |
| `limit` | number | ❌ | Max results (1–20, default 5) |

Returns formatted skill descriptions with name, description, category, and file path.

## Configuration

No configuration needed — the extension auto-indexes skills from Pi's `systemPromptOptions.skills` on the first `before_agent_start` event.

## Bundled Skills (`skills/`)

The extension ships with **25 bundled skills** covering 14 scientific domains. These live in `skills/` and are scanned by the extension directly — Pi does **not** discover them at startup.

| Category | Skills |
|---|---|
| Cheminformatics & Drug Discovery | rdkit |
| Bioinformatics & Genomics | scanpy, biopython, huggingface, openephys, rdkit |
| Machine Learning & AI | pytorch, huggingface, xgboost, xgboost-ts |
| Clinical & Medical | clinical-trial, pubmed-search |
| Physics & Quantum | astropy |
| Databases & Data Sources | sqlite-pandas, fastapi, pyspark, pubmed-search |
| Data Analysis & Visualization | matplotlib, statsmodels, xgboost-ts, nilearn, pyspark |
| Scientific Writing & Communication | matplotlib, pubmed-search, research-reproducibility |
| Geospatial & Remote Sensing | landsat, astropy, matplotlib |
| Lab Automation & Integration | docker-sandbox, celery-pipeline |
| Time Series & Forecasting | statsmodels, xgboost-ts, openephys |
| Materials Science & Engineering | pymatgen |
| Research Methodology | research-reproducibility, statsmodels |
| Integration Platforms | rdflib, markitdown-docs, sqlite-pandas |
| Meta | skill-search (this tool usage guide) |

To add new skills: create `skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`). The extension picks them up automatically.

## License
MIT
