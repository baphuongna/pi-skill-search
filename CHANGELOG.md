# Changelog

## 0.0.0 (2026-05-16)

### Added

- Core extension: replaces Pi's inject-all skill descriptions with on-demand search tool + category summary
- `skill-search` tool with query (1-500 chars) and limit (1-20, default 5)
- Category classifier with 14 domain rules
- Synonym dictionary for chemistry, biology, ML, clinical, physics domains
- Strip regex to remove Pi's `<available_skills>` block from system prompt
- Category summary injection via `before_agent_start` event
- Proactive suggestion hook for Python package detection (opt-in)
- 94+ tests: unit, integration, failure isolation, classifier coverage
