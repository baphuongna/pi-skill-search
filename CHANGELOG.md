# Changelog

## 0.2.0 (2026-05-23)

### Fixed
- **Packaging conflict**: Renamed `skills/` to `data/` to prevent Pi from discovering and inject-all-ing 284 skills
- **Install script**: Created `install.mjs` to copy `skill-search` skill to `~/.pi/agent/skills/` (where Pi discovers skills)
- **Scoring weights**: Changed from +5/+2 to +3/+1 per SPEC §5.1 for better relevance scoring
- **Unused nameIndex**: Removed from SkillIndex interface and buildIndex() function
- **EOF newline**: Added missing newline in categories.ts
- **SPEC §7.4**: Updated documentation to always return `{ systemPrompt }`, never undefined

### Changed
- Scanner now scans `data/` directory instead of `skills/`
- Extension registers `skill-search` tool via `before_agent_start` event
- 284 skills corpus in `data/` (Pi does not discover this directory)

## 0.1.0 (2026-05-17)

### Added
- Core extension: replaces Pi's inject-all skill descriptions with on-demand search tool + category summary
- `skill-search` tool with query (1-500 chars) and limit (1-20, default 5)
- Category classifier with 14 domain rules, 76+ keywords
- Synonym dictionary with 50+ entries across 10 domains
- 70+ English stopwords for accurate search scoring
- Strip regex to remove Pi's `<available_skills>` block from system prompt
- Category summary injection via `before_agent_start` event
- Proactive suggestion hook for Python package detection (opt-in)
- **284 bundled skills** from 10 source repos
- 14/14 categories, 0 Other
- 123 tests across 14 test files including search quality benchmarks
- Biome lint + TypeScript strict mode clean