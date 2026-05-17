# Changelog

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
- **258 bundled skills** from 10 source repos:
  - scientific-agent-skills (137), oh-my-claudecode (29), vetc-dev-kit (33)
  - pi-crew (27), superpowers (14), oh-my-pi (2), claude-mem (12)
  - gstack (1), context-mode (1), spec-kit (1)
- 14/14 categories, 0 Other
- 123 tests across 14 test files including search quality benchmarks
- Biome lint + TypeScript strict mode clean
