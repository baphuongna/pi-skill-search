# US-001 Core Indexer And Search Tool

## Status

planned

## Lane

normal (with stronger validation — 2 risk flags: Public contracts, Existing behavior)

## Product Contract

`pi-skill-search` is a Pi extension that, when activated in a session with
loaded skills:

1. Strips Pi's auto-injected `<available_skills>` block from the system
   prompt every turn.
2. Injects a category summary (≤ 250 tokens) listing the domains present in
   the user's skill set.
3. Registers a `skill-search` tool the agent can call on demand. The tool
   accepts a `query` (1–500 chars) and optional `limit` (default 5, clamped
   to `[1, 20]`) and returns the top-N matching skills with name,
   description, score, and `filePath`.
4. Performs no filesystem I/O — sources `Skill[]` from
   `event.systemPromptOptions.skills` and filters
   `disableModelInvocation === true` before indexing.

For the 137-skill `scientific-agent-skills` corpus, the activated extension
must reduce skill-subsystem prompt tokens from ~23,589 to ≤ 600, a ≥ 97%
reduction.

## Relevant Product Docs

- `SPEC.md` (the input spec — sections §3 decision, §4 design, §5 algorithm,
  §6 categories, §7 architecture, §9 validation).
- `docs/decisions/0004-search-over-inject.md` (project decision record).
- `docs/product/skill-search.md` — to be created in this story (tool contract,
  search algorithm, category rules) per `SPEC.md` Candidate Product Docs
  table.

## Acceptance Criteria

- A built `pi-skill-search` extension loads in Pi v0.74.0+ without throwing.
- On `before_agent_start`, the returned `systemPrompt` no longer contains
  `<available_skills>` AND contains `## Available Skill Domains`.
- The `skill-search` tool is registered exactly once (not duplicated on
  subsequent turns).
- Tool description is rendered from the live category list (deterministic per
  `SPEC.md` §4.4 + §6.4) and lists the categories present in the active skill
  set.
- Search precision@1 ≥ 0.85 and recall@5 ≥ 0.95 over the 25+ labeled-query
  fixture from `SPEC.md` §9.
- Search latency p50 < 5 ms and p99 < 15 ms over the 1,000-query latency
  corpus.
- `disableModelInvocation: true` skills are not indexed and never returned
  by `skill-search` (regression test for `SPEC.md` §7.5 trade-off table).
- The handler returns `"Search failed: <message>"` instead of throwing if any
  internal call throws (verified by failure-injection test).
- Tool handler edge cases match `SPEC.md` §9 row "tool handler edge cases":
  `query: ""`, `query > 500 chars`, `limit ∈ {0, -5, NaN, 1000}` all behave
  as specified.
- Strip-regex drift detector test fails fast if Pi changes the
  `<available_skills>` lead-in sentence wording.
- Total system-prompt tokens contributed by the skill subsystem with
  extension active ≤ 600 (cl100k_base via `tiktoken`); `(A − B) / A ≥ 0.97`
  where `A` is the no-extension baseline ≈ 23,589.
- Extension failure (`buildIndex`, `formatCategorySummary`, or `search`
  throwing) does not crash the Pi session — agent still produces a normal
  response, just without the summary or tool.

## Design Notes

- **Files** (per `SPEC.md` §7.1):
  `index.ts`, `src/indexer.ts`, `src/search.ts`, `src/categories.ts`,
  `src/synonyms.ts`, `src/format.ts`, `src/strip.ts`. Target ~400 lines total.
- **Commands**: none. The extension exposes only the `skill-search` tool to
  the agent.
- **Queries**: one — `skill-search(query, limit?)`. Schema in `SPEC.md` §4.3.
- **API**: registers a Pi tool; no HTTP/RPC.
- **Tables**: none. In-memory `Map<string, SkillEntry>`.
- **Domain rules**:
  - Reuse Pi's `Skill[]` — no YAML parser, no filesystem scan
    (`SPEC.md` §7.5, §8).
  - Filter `disableModelInvocation === true` before indexing.
  - Strip regex anchored on Pi's lead-in sentence
    (`AVAILABLE_SKILLS_BLOCK_REGEX` in `SPEC.md` §7.3).
  - Lazy tool registration on first non-empty `before_agent_start`.
  - Index rebuilds when `Skill[]` fingerprint (sorted `filePath` join)
    changes; tool description does NOT update mid-session (known limitation,
    `SPEC.md` §7.3).
- **UI surfaces**: none in this story. (The `ctx.ui.notify` call in
  `SPEC.md` §7.3 was historical — current spec emits no notifications from
  US-001; opt-in notifications belong to US-003.)
- **Dependencies**: peer `@earendil-works/pi-coding-agent >=0.74.0`. Zero
  npm runtime dependencies. Test-only: `tinybench` (latency),
  `tiktoken` (token measurement), `vitest` or equivalent (project picks one
  in this story).

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Search quality (precision@1 ≥ 0.85, recall@5 ≥ 0.95 on 25+ labeled queries from `SPEC.md` §9). Search latency (p50 < 5 ms, p99 < 15 ms on synthetic 1,000-query corpus, fixture committed to `test/fixtures/latency-queries.json`). Synonym reachability (every entry hit by ≥ 1 labeled query, regression for the §5.4 metabolism miss). Tokenizer edge cases (empty, 1-char, 3D, hyphenated, Unicode, 10K-char). Classifier coverage (every seed-corpus skill assigned ≥ 1 category). |
| Integration | Strip-regex correctness against literal output of Pi's `formatSkillsForPrompt(testSkills)`. Index-reuse spy (no rebuild when fingerprint unchanged; rebuild exactly once on change). Empty/malformed `Skill[]` handling. Tool handler edge cases (query empty / >500 chars; limit 0/-5/NaN/1000). `disableModelInvocation` filter regression. |
| E2E | Install extension into Pi v0.74+, start session with 137 scientific skills, assert (a) `<available_skills>` absent, (b) `## Available Skill Domains` present, (c) agent calls `skill-search` for `"molecular docking"` and reads the returned SKILL.md. |
| Platform | Pi v0.74.0 on Node (the runtime Pi uses). No browser/desktop concerns. |
| Performance | Startup tokens: `B ≤ 600` AND `(A − B) / A ≥ 0.97` against 137-skill baseline. Per-turn `Δtokens` constant within ±20 tokens across 5 simulated turns. |
| Release | Failure isolation: forced exceptions in `buildIndex`, `formatCategorySummary`, `search` do not crash the Pi session. Strip-regex drift detector. |

## Harness Delta

- This story will introduce the first project source code, package.json, and
  test commands. Update `scripts/README.md` with the chosen validation
  commands when they exist.
- Update `docs/ARCHITECTURE.md` with the chosen Node + Pi-extension stack
  (currently a placeholder).
- File any Pi-side gaps discovered during implementation in
  `docs/HARNESS_BACKLOG.md` (initial items already proposed: skill-injection
  opt-out, persistent system-message API, `updateToolDescription`).

## Evidence

(none yet — story is `planned`)
