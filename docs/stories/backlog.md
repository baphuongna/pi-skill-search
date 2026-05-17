# Story Backlog

Derived from `SPEC.md` §Candidate Epics and §11 First Story Candidates.

## Candidate Epics

| Epic | Description | Status |
| --- | --- | --- |
| E01 | Core extension: indexer + search tool + category summary | sliced (US-001, US-002) |
| E02 | Proactive suggestion: `tool_call` hook for package detection | sliced (US-003) |
| E03 | Query caching + telemetry hooks | unsliced |

## Active Stories

| ID | Title | Lane | Status | Path |
| --- | --- | --- | --- | --- |
| US-001 | Core indexer and search tool | normal | planned | `epics/E01-core-search/US-001-core-indexer-and-search-tool.md` |
| US-002 | Category rules tuning | normal | planned | `epics/E01-core-search/US-002-category-rules-tuning.md` |
| US-003 | Proactive suggestion hook | normal | planned | `epics/E02-proactive/US-003-proactive-suggestion-hook.md` |

## Slicing Notes

- **US-001 → US-002 → US-003** is the recommended order. US-001 ships the
  core hypothesis (token savings + working search). US-002 tunes the category
  summary against real corpus measurements that only exist after US-001.
  US-003 is opt-in and depends on the index US-001 builds.
- **E03** is intentionally unsliced. Query caching is premature optimisation
  until US-001 surfaces real latency numbers. Telemetry hooks need an upstream
  Pi capability that does not exist yet (`pi-recollect`, see
  `docs/HARNESS_BACKLOG.md`).
- **No high-risk stories.** Per `docs/FEATURE_INTAKE.md` risk checklist, none
  of US-001/002/003 touch auth, data migration, audit/security, external
  providers, or removed validation. All three stay in the normal lane with
  stronger validation (US-001 carries 2 risk flags: Public contracts + Existing
  behavior, so validation is heavier than a default normal-lane story).
