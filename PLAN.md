# Implementation Plan

Detailed implementation roadmap for `pi-skill-search`, derived from `SPEC.md`
and the three story packets (US-001, US-002, US-003). This file is the
master plan; story files remain the contract per harness convention.

Each phase has:

- **Goal**: what must be true at end of phase.
- **Deliverables**: files created or modified.
- **Validation gate**: command(s) and pass criteria that must hold before
  starting the next phase. Skipping a gate is a harness-visible deviation.
- **SPEC anchor**: section(s) of `SPEC.md` this phase realises.

Phases 0–8 deliver US-001 (Phase 8 is the validation gate that moves US-001
to `implemented`). Phase 9 delivers US-002. Phase 10 delivers US-003.
Phase 11 is release prep. The npm-publish action itself is deferred per
user decision (phương án C, 2026-05-16).

---

## Phase Map

| # | Phase | Story | SPEC anchor | Depends on |
|---|---|---|---|---|
| 0 | Project setup | US-001 | §7.1, §7.2 | — |
| 1 | Types and tokenization | US-001 | §4.1, §5.3 | 0 |
| 2 | Synonym dictionary | US-001 | §5.2 | 1 |
| 3 | Classifier | US-001 | §6.1, §6.2 | 1 |
| 4 | Index builder | US-001 | §6.4 | 1, 3 |
| 5 | Search algorithm | US-001 | §5.1, §5.4 | 1, 2, 4 |
| 6 | Strip regex + summary + result formatters | US-001 | §4.4, §4.5, §6.3, §7.3 | 4, 5 |
| 7 | Extension lifecycle (entry point) | US-001 | §7.3, §7.4 | 6 |
| 8 | Token + in-process E2E validation | US-001 | §9 | 7 |
| 8b | Agent-transcript E2E | US-001 | §9 (E2E row) | 8 |
| 9 | Category rules tuning | US-002 | §6.1, §10.3 | 8b |
| 10 | Proactive suggestion hook | US-003 | §11 E02-S01 | 8b |
| 11 | Polish + release prep + CI | — | — | 9, 10 |

Notes:

- Phase 4 depends on 1 (types + tokenize) and 3 (classifier), **not** 2
  (synonyms). Synonym expansion happens at query time inside `search()`,
  not at index-build time.
- Phase 8 covers the in-process validation (token measurement + handler
  edge cases). Phase 8b covers the agent-transcript E2E required by
  US-001 acceptance criteria. Splitting lets Phase 8 ship deterministic
  pass/fail signal without coupling to a real LLM run.

---

## Phase 0 — Project Setup

**Goal**: a working npm package skeleton that lints, type-checks, and runs an
empty test suite. Stack decisions recorded.

**SPEC anchor**: §7.1 file structure, §7.2 dependencies.

**Phase 0 blockers (resolve before any task)**

- [ ] Confirm license with user. Default proposal: **MIT** (consistent with
  Pi ecosystem). Do not commit `LICENSE` until user confirms.
- [x] Confirm `@earendil-works/pi-coding-agent@>=0.74.1` is **installable**.
  Verified: `package.json` shows `"version": "0.74.1"` in
  `Source/pi-mono/packages/coding-agent/`. If the published npm version
  is below 0.74.1, fall back to a local file dependency:
  `"file:../pi-mono/packages/coding-agent"` in `devDependencies`
  (and document the constraint in `0005`).
- [x] Pi extension loading from `node_modules`:
  `loader.ts` uses `jiti` with aliases that resolve
  `@earendil-works/pi-coding-agent` to the main `index.js` (dist).
  Extensions can only import what's re-exported from that entry point.
  **jiti CAN load `.ts` source** (it transpiles on the fly), so Phase 11
  ships `src/**/*.ts`.
- [x] **Public API audit** (discovered during plan review 2026-05-16):
  The following symbols are **NOT exported** from
  `@earendil-works/pi-coding-agent`:
  - `formatSkillsForPrompt` — internal to `skills.ts`
  - `loadSkills` — internal to `skills.ts`
  - `buildSystemPrompt` — internal to `system-prompt.ts`
  - `Skill` type — internal to `skills.ts`

  Package `exports` field only exposes `"."` and `"./hooks"` — no deep
  imports possible. This affects Phase 0 task #9, Phase 1, Phase 4,
  Phase 6, and Phase 8. Each affected phase has been updated with an
  alternative approach.

  **Symbols confirmed exported**: `BeforeAgentStartEvent`,
  `BeforeAgentStartEventResult`, `ExtensionAPI`,
  `BuildSystemPromptOptions`, `defineTool`, `ToolCallEvent`,
  `BashToolCallEvent`, `ToolCallEventResult`.

**Tasks**

1. Pick the stack and record decision `0005-stack-choice.md`. Defaults
   (mirror Pi-mono):
   - Language: **TypeScript ESM** (`"type": "module"` in `package.json`).
   - Test runner: **vitest**. Invoke via
     `npx tsx node_modules/vitest/dist/cli.js --run` (Pi-mono pattern).
   - Linter / formatter: **biome** (tabs, indent 3, line width 120).
   - Type-check only: `tsc --noEmit` (no build step at install time —
     pending the loader-verification blocker above).
2. Create `package.json` with:
   - `name: "pi-skill-search"`, `version: "0.0.0"` (no publish yet).
   - `peerDependencies: { "@earendil-works/pi-coding-agent": ">=0.74.1" }`.
   - `devDependencies` (in addition to peer):
     - `@earendil-works/pi-coding-agent` (matching peer range, so
       imports work locally for tests + fixture generation),
     - `typescript`, `vitest`, `tsx`, `@biomejs/biome`,
     - `tinybench`, `tiktoken`, `@types/node`,
     - `js-yaml` + `@types/js-yaml` (for fixture generation script).
   - `scripts`: `check` (biome + tsc --noEmit), `test`, `bench`, `format`.
3. Create `tsconfig.json` (target ES2022, module ESNext,
   `moduleResolution: "Bundler"`, strict, noEmit).
4. Create `biome.json` based on `Source/pi-mono/biome.json` BUT replace the
   `files.includes` list (pi-mono's references `packages/*/src/**`, which
   does not exist here). Use:
   ```json
   "files": {
     "includes": [
       "index.ts",
       "src/**/*.ts",
       "test/**/*.ts",
       "bench/**/*.ts",
       "scripts/**/*.ts",
       "!**/node_modules/**",
       "!**/dist/**"
     ]
   }
   ```
5. Create `.gitignore` (`node_modules`, `dist`, `*.log`, `.vscode`,
   `coverage`).
6. Create `LICENSE` — content depends on the blocker above.
7. Create empty stub files so `tsc --noEmit` and `vitest` run cleanly:
   - `index.ts` (empty default export).
   - `src/types.ts`, `src/text.ts`, `src/indexer.ts`, `src/search.ts`,
     `src/categories.ts`, `src/synonyms.ts`, `src/format.ts`,
     `src/strip.ts` — each with a `// TODO` doc comment so biome doesn't
     flag empty files.
   - `test/.gitkeep`, `bench/.gitkeep`.
8. Create `test/fixtures/.gitkeep`.
9. Run `npm install` and verify `@earendil-works/pi-coding-agent`
   exports the symbols this plan depends on. Method:
   - Verify type-only exports that ARE available:
     `BeforeAgentStartEvent`, `BeforeAgentStartEventResult`,
     `ExtensionAPI`, `BuildSystemPromptOptions`, `defineTool`,
     `ToolCallEvent`, `BashToolCallEvent` — all confirmed exported.
   - `Skill` is NOT exported — declared locally in `src/types.ts`
     (see Phase 1). `formatSkillsForPrompt`, `loadSkills`, and
     `buildSystemPrompt` are also NOT exported and NOT imported
     anywhere in this extension.
   - Run `npx tsc --noEmit` — passes only if all verified exports
     resolve.
10. Update `scripts/README.md` with the chosen commands.
11. Update `docs/ARCHITECTURE.md` with concrete stack + Pi extension
    loading model (replacing the placeholder discovery section).

**Deliverables**

```text
Source/pi-skill-search/
  package.json
  tsconfig.json
  biome.json
  .gitignore
  LICENSE                                  (after user-confirmed license)
  index.ts                                 (stub)
  src/{types,text,indexer,search,categories,synonyms,format,strip}.ts  (stubs)
  test/.gitkeep
  test/fixtures/.gitkeep
  bench/.gitkeep
  docs/decisions/0005-stack-choice.md
  docs/ARCHITECTURE.md                     (updated)
  scripts/README.md                        (updated)
```

**Validation gate**

```text
npm install                          → exits 0
npx biome check .                    → 0 errors, 0 warnings
npx tsc --noEmit                     → 0 errors
npx tsx node_modules/vitest/dist/cli.js --run → 0 tests, exit 0
```

---

## Phase 1 — Types and Tokenization

**Goal**: domain types declared; `tokenize()` working with all SPEC §5.3
edge cases.

**SPEC anchor**: §4.1 domain model, §5.3 tokenization.

**Tasks**

1. In `src/types.ts`, declare interfaces from SPEC §4.1: `SkillEntry`,
   `SearchResult`, `CategorySummary`, `SkillIndex`. Add the Pi-Skill →
   SkillEntry mapping comment.

   **`Skill` is NOT exported from the package.** Declare a local
   `PiSkill` interface with only the fields the extension needs
   (verified against `skills.ts:75` at v0.74.1):
   ```ts
   /** Subset of Pi's Skill interface (skills.ts:75) — not exported by the package. */
   export interface PiSkill {
     name: string;
     description: string;
     filePath: string;
     disableModelInvocation: boolean;
   }
   ```
   Re-export the event types that ARE available as **type-only**:
   ```ts
   export type {
     ExtensionAPI,
     BeforeAgentStartEvent,
     BeforeAgentStartEventResult,
     ToolCallEvent,
     BuildSystemPromptOptions,
   } from "@earendil-works/pi-coding-agent";
   ```
   Type-only re-exports erase at compile time, so consumers who install
   only the peer dep (no devDep) still resolve types correctly.
2. In `src/text.ts`, implement `tokenize(text: string): Set<string>`
   exactly per §5.3 code block. Keeping tokenization separate from
   `src/search.ts` matches SPEC §7.1 ("Search algorithm: score, rank,
   format results" — search.ts is for the algorithm proper).
3. Create `test/text.test.ts` (was `tokenize.test.ts`) with cases from
   SPEC §5.3 "Edge cases handled":
   - `""` → `Set()`.
   - `"a"` → `Set()` (filtered).
   - `"3D"` → `Set(["3d"])`.
   - `"R"` → `Set()` (filtered, deliberate).
   - `"single-cell"` → `Set(["single", "cell"])`.
   - `"PyTorch_Lightning"` → `Set(["pytorch", "lightning"])`.
   - `"naïve"` → `Set(["nave"])` (Unicode stripped).
   - 10K-char input → no throw, deterministic output.
   - Repeated words deduplicated.
4. Snapshot test the tokenizer output for stability.

**Deliverables**

- `src/types.ts`, `src/text.ts`, `test/text.test.ts`.

**Validation gate**

```text
npx tsx node_modules/vitest/dist/cli.js --run test/text.test.ts
  → all assertions pass
npx biome check src/text.ts src/types.ts test/text.test.ts → 0 issues
```

---

## Phase 2 — Synonym Dictionary

**Goal**: synonym expansion ready for the scorer; every entry reachable.

**SPEC anchor**: §5.2.

**Tasks**

1. In `src/synonyms.ts`, declare `SYNONYMS` exactly per §5.2 (including
   the new `metabolism`/`metabolic` entries).
2. Implement `expandQuery(query: string): Set<string>` that tokenizes and
   then unions in synonym values for each matched key.
3. Create `test/synonyms.test.ts`:
   - Round-trip `metabolism` → contains `metabolic`, `pathway`, `flux`.
   - Round-trip `molecule` ↔ `molecular` (bidirectional).
   - Empty query → empty set.
   - Query with no synonym hits → identity (just tokens).
4. Add a "no dead synonyms" assertion: for each key in `SYNONYMS`, fail if
   no labeled query in Phase 5's fixture references the key. (Test added
   in Phase 5; a placeholder skipped test goes here.)

**Deliverables**

- `src/synonyms.ts`, `test/synonyms.test.ts`.

**Validation gate**

```text
npx tsx node_modules/vitest/dist/cli.js --run test/synonyms.test.ts → pass
```

---

## Phase 3 — Classifier

**Goal**: `classify(entry)` produces deterministic categories; baseline
rules from SPEC §6.1 commit to source.

**SPEC anchor**: §6.1 rules, §6.2 logic.

**Tasks**

1. In `src/categories.ts`, declare `CATEGORY_RULES` exactly per §6.1
   (14 rules), and implement `classify(entry: { name: string;
   description: string }): string[]` per §6.2.
2. Add the substring-match caveat from §6.2 as a doc comment on
   `CATEGORY_RULES`.
3. Create `test/classify.test.ts`:
   - `rdkit` description → contains "Cheminformatics & Drug Discovery".
   - `deepchem` description → contains both Cheminformatics and ML.
   - Skill with no matching rule → `["Other"]`.
   - Empty description → `["Other"]`.
   - Determinism: same input twice → same output (asserted via snapshot).
4. Defer corpus-coverage assertion to Phase 9 (US-002 tuning).

**Deliverables**

- `src/categories.ts`, `test/classify.test.ts`.

**Validation gate**

```text
npx tsx node_modules/vitest/dist/cli.js --run test/classify.test.ts → pass
```

---

## Phase 4 — Index Builder

**Goal**: `buildIndex(skills)` produces `SkillIndex` deterministically;
performance < 100 ms for 137 skills.

**SPEC anchor**: §6.4.

**Tasks**

1. In `src/indexer.ts`, implement `buildIndex(skills: PiSkill[]): SkillIndex`
   exactly per §6.4 algorithm (two-pass, deterministic, last-write-wins
   `nameIndex`).
2. Implement `fingerprintSkills(skills: PiSkill[]): string` using sorted
   `filePath` join (used by `ensureIndex` in Phase 7).
3. Create `test/indexer.test.ts`:
   - Determinism: same input → identical `SkillIndex` (deep-equal).
   - `categories` ordering matches `CATEGORY_RULES` declaration order.
   - `examples` retain skill insertion order, sliced to `maxExamples`.
   - Empty `skills` → `entries.size === 0`, `categories.length === 0`.
   - Single skill → indexed, fingerprint stable.
4. Create `test/fixtures/skills-137.json` snapshot.

   **`loadSkills` is NOT exported from the package.** Two options:

   **Option A (preferred)**: Read YAML frontmatter directly from
   `Source/scientific-agent-skills/scientific-skills/*/SKILL.md` using
   `js-yaml` (devDep added in Phase 0). Parse `name`, `description`,
   `filePath` from each frontmatter. This is a one-time fixture
   generator script (`scripts/build-skills-fixture.ts`), not production
   code. Serialize the resulting array to JSON and commit.

   **Option B (if local dev with pi-mono checkout)**: Import from the
   deep path `../../../Source/pi-mono/packages/coding-agent/src/core/skills.ts`
   in the script only (not in extension code). Only works with local
   checkout and jiti.

   Either way, the fixture is **committed and NOT regenerated** at
   build time.
5. Create `bench/buildIndex.bench.ts` using `tinybench`; run on
   `skills-137.json`.

**Deliverables**

- `src/indexer.ts`.
- `test/indexer.test.ts`.
- `test/fixtures/skills-137.json` (137 entries).
- `bench/buildIndex.bench.ts`.

**Validation gate**

```text
npx tsx node_modules/vitest/dist/cli.js --run test/indexer.test.ts → pass
npm run bench:index → mean < 100 ms (SPEC §9 row "Performance — index build")
```

---

## Phase 5 — Search Algorithm

**Goal**: search hits `precision@1 ≥ 0.85`, `recall@5 ≥ 0.95`, latency
`p50 < 5 ms` and `p99 < 15 ms` over the labelled and synthetic corpora.

**SPEC anchor**: §5.1, §5.4, §9.

**Tasks**

1. In `src/search.ts`, implement `search(index, query, limit)` per §5.1
   scoring formula:
   - `+50` exact name match.
   - `+20` per name-token match.
   - `+3` per first-120-char description-token match.
   - `+1` per remaining description-token match.
   - `+5` per category-keyword match.
   - Apply `expandQuery()` (Phase 2) before scoring; synonym hits inherit
     the same weight as the original.
   - Sort by score descending, ties broken by skill name ascending.
   - Return top-N (N already clamped by handler in Phase 7).
2. Create `test/fixtures/labeled-queries.json` with 25+ entries. Seed
   from §5.4 (15 entries) plus:
   - Add `cobrapy` as the expected primary for "metabolism pathway
     analysis" (regression for §5.4 miss now fixed by §5.2 synonyms).
   - Add 10+ multi-token queries spanning every category from §6.1 to
     ensure no dead category. Suggested:
     - `"crystal structure prediction"` → expected `pymatgen`.
     - `"single cell trajectory"` → expected `scvelo` or `scanpy`.
     - `"differential expression"` → expected `scanpy` or `pydeseq2`.
     - `"protein structure prediction"` → expected `boltz-design` or
       similar (verify against actual seed corpus).
     - `"NLP text classification"` → expected ML category.
     - … (full list during this phase).
   - Each entry: `{ query, expected: [primary, ...alternates], reason }`.
3. Implement `precisionAt1(results, expected)` and `recallAt5(results,
   expected)` helpers in `test/utils.ts`.
4. Create `test/search.test.ts`:
   - Iterate the labelled fixture; assert aggregate
     `precision@1 ≥ 0.85`, `recall@5 ≥ 0.95`.
   - Assert each row from §5.4 still passes individually (regression
     guard).
   - Assert that every entry in `SYNONYMS` is referenced by ≥ 1 labelled
     query (kills the Phase 2 placeholder skip).
   - Assert that "rdkit" returns `rdkit` first, not `datamol` (the spec's
     motivating evidence).
5. Create `test/fixtures/latency-queries.json` per SPEC §9 row "search
   latency" (500 single-token + 500 multi-token, drawn from
   `nameTokens` and top-200 `descTokens`).
6. Create `bench/search.bench.ts` using `tinybench`. **Note**: tinybench's
   result API exposes `mean`, `min`, `max`, `p75`, `p99`, `p995`, `p999`,
   and `samples` — but **not p50 (median)**. To meet SPEC §9's `p50 < 5ms`
   bar, compute p50 manually from `result.samples` (sort + pick middle).
   The bench harness should emit both `mean` and computed-p50 alongside
   tinybench's native `p99`.

**Deliverables**

- `src/search.ts` (full).
- `test/fixtures/labeled-queries.json` (25+ entries).
- `test/fixtures/latency-queries.json` (1,000 entries).
- `test/utils.ts` (precision/recall helpers, computed-p50 helper).
- `test/search.test.ts`.
- `bench/search.bench.ts`.

**Validation gate**

```text
npx tsx node_modules/vitest/dist/cli.js --run test/search.test.ts → pass
npm run bench:search
  → computed-p50 < 5 ms, p99 < 15 ms over 1,000 queries (SPEC §9)
```

---

## Phase 6 — Strip Regex, Summary, Result Formatters

**Goal**: every output the extension produces is correct and within token
budgets.

**SPEC anchor**: §4.4 tool description template, §4.5 category summary,
§6.3 summary generator, §7.3 strip regex.

**Tasks**

1. In `src/strip.ts`:
   - Export `AVAILABLE_SKILLS_BLOCK_REGEX` per §7.3 exact regex.
   - Export `stripAvailableSkillsBlock(systemPrompt: string): string`.
   - Drift detector: a small function that, given a Pi-built systemPrompt
     (Phase 8 will use Pi imports), checks the regex matched. Used by
     §9 strip-regex test.
2. In `src/format.ts`:
   - Implement `estimateTokens(text)` (chars / 3.5).
   - Implement `renderSummary(index, maxExamples)` per §6.3.
   - Implement `formatCategorySummary(index)` with the truncation loop
     (max 5 → 4 → 3 → 2 → 1 → 0 examples) until ≤ 250 tokens.
   - Implement `renderToolDescription(index)` per §4.4 template:
     - `{{categoryList}}` from `index.categories[*].name` (lowercased,
       comma-joined).
     - Top-3 categories by `count` (ties by `CATEGORY_RULES` declaration
       order); take `examples[0]` from each.
     - Render the static template with placeholders replaced.
   - Implement `formatResults(query, results, totalIndexed)` per §4.3
     output format:
     - Header line `Found {N} skills for "{query}":`.
     - Per-result block with `## name (score: X.XX)`, description, and
       `Path:`.
     - Trailing usage hint about `read` tool and relative-path resolution.
     - Empty-results path: `"No skills found matching 'X'. {N} skills
       indexed. Try broader terms."`.
3. Create `test/format.test.ts`:
   - `formatCategorySummary` ≤ 250 tokens on the 137-skill index.
   - At full `maxExamples=5`, output ≤ 200 tokens (preferred bar; record
     actual number for Phase 9 tuning).
   - Empty categories omitted; "Other" only if non-empty.
   - `renderToolDescription` is deterministic given identical index.
   - `formatResults` matches a snapshot for a known 5-result query.
4. Create `test/strip.test.ts`:
   - **`formatSkillsForPrompt` is NOT exported.** Build the
     `<available_skills>` block manually in the test fixture instead,
     matching the exact output format verified in
     `skills.ts:340-366` at v0.74.1:
     ```
     \n\nThe following skills provide specialized instructions...
     <available_skills>...<\/available_skills>
     ```
     Concatenate arbitrary preamble text + this synthetic block.
     Strip → no `<available_skills>`.
   - No `<available_skills>` in input → strip is no-op (no exception,
     same string returned).
   - Drift case: input where lead-in sentence is reworded → drift
     detector reports `false`, regex match is empty,
     `formatCategorySummary` still appended (sub-optimal but valid
     behaviour).

**Deliverables**

- `src/strip.ts`, `src/format.ts`.
- `test/strip.test.ts`, `test/format.test.ts`.

**Validation gate**

```text
npx tsx node_modules/vitest/dist/cli.js --run test/strip.test.ts test/format.test.ts → pass
```

---

## Phase 7 — Extension Lifecycle (Entry Point)

**Goal**: the extension wires everything together correctly under Pi's
event API; passes integration-level tests with mocked
`BeforeAgentStartEvent`.

**SPEC anchor**: §7.3, §7.4.

**Tasks**

1. In `index.ts`, implement the default export per §7.3:
   - Closure-scoped `index`, `lastSkillsFingerprint`, `toolRegistered`.
   - `ensureIndex(skills)` filters `disableModelInvocation`, fingerprint
     short-circuits, calls `buildIndex` with try/catch.
   - `pi.on("before_agent_start", ...)`:
     - Calls `ensureIndex`.
     - First-time tool registration (idempotent guard).
     - Strips `<available_skills>` block.
     - Returns `{ systemPrompt: stripped + "\n\n" + summary }`.
   - `makeSearchHandler` per §7.3 (with the try/catch added in round-3
     review).
2. Create `test/lifecycle.test.ts`:
   - Mock `pi: ExtensionAPI` with spied `on` and `registerTool`.
   - Fire `before_agent_start` with `systemPromptOptions.skills`
     containing 5 skills; assert tool registered exactly once.
   - Fire 3 more times with same fingerprint; assert `buildIndex` called
     once total, tool registered once total.
   - Fire with new fingerprint (skills changed); assert `buildIndex`
     called again, tool NOT re-registered (known limitation).
   - `disableModelInvocation: true` filter: pass 5 skills with one
     disabled; assert search handler does not return that skill.
   - Empty `skills`: handler returns `{ result: "No skills indexed." }`.
   - Tool handler edge cases (every row from SPEC §9):
     - `query: ""` → `"Query is required."`.
     - `query: "x".repeat(501)` → `"Query too long (max 500 chars)."`.
     - `limit: 0` → 1 result returned.
     - `limit: 1000` → at most 20 returned.
     - `limit: -5` → 1 result.
     - `limit: NaN` → 5 results (default).
   - Force exception in `search` (mocked); assert handler returns
     `"Search failed: <message>"`, not throw.

**Deliverables**

- `index.ts` (full).
- `test/lifecycle.test.ts`.

**Validation gate**

```text
npx tsx node_modules/vitest/dist/cli.js --run test/lifecycle.test.ts → pass
```

---

## Phase 8 — Token + In-Process E2E Validation

**Goal**: SPEC §9 acceptance bars met deterministically without depending
on a real LLM. Phase 8b adds the agent-transcript E2E.

**SPEC anchor**: §9 entire table (except the agent-transcript E2E row).

**Tasks**

1. Create `test/integration.test.ts`.

   **`buildSystemPrompt` is NOT exported.** Instead of importing it,
   measure token contribution using a different approach:

   - Build a synthetic `systemPrompt` that contains the
     `<available_skills>` block (matching Pi's exact format from
     `skills.ts:340-366`) for the 137-skill fixture. This is the
     "baseline with skills" (A).
   - Build a synthetic `systemPrompt` WITHOUT the skills block. This
     is the "bare baseline".
   - **A** = tokens(baseline_with_skills) - tokens(bare_baseline)
     (should ≈ 23,589).
   - Feed the `baseline_with_skills` string as `event.systemPrompt`
     into the extension's `before_agent_start` handler. The handler
     strips `<available_skills>` and appends category summary.
   - **B** = tokens(extension_output) - tokens(bare_baseline)
     (≤ 600 target).
   - All measurements use `tiktoken` `cl100k_base`.
   - Assert: `B ≤ 600` AND `(A − B) / A ≥ 0.97`.
   - Assert `<available_skills>` absent in the extension's output.
   - Assert `## Available Skill Domains` present in the extension's output.
2. Per-turn delta test: simulate 5 invocations; record tokens each turn;
   assert variance ≤ ±20 tokens.
3. Failure isolation tests in `test/failure-isolation.test.ts`. Use
   **`vi.mock()` with `vi.hoisted()`** to swap `buildIndex`,
   `formatCategorySummary`, and `search` for throwing stubs (ESM-mocking
   pattern; documented in vitest docs). Alternative considered:
   refactor lifecycle to take these as injectable dependencies — rejected
   to avoid changing the lifecycle contract just for testability.
4. Token measurement script `scripts/measure-tokens.ts` callable from CLI
   for ad-hoc verification.
5. Update `docs/TEST_MATRIX.md`:
   - US-001 row → all in-process layers move to `implemented`. The
     agent-transcript E2E row stays `planned` until Phase 8b passes.
6. File any Pi-side gaps surfaced during Phase 8 in
   `docs/HARNESS_BACKLOG.md`.

**Deliverables**

- `test/integration.test.ts`.
- `test/failure-isolation.test.ts`.
- `scripts/measure-tokens.ts`.
- `docs/TEST_MATRIX.md` (partial update).

**Validation gate**

```text
B ≤ 600                                    (cl100k_base, 137 skills)
(A − B) / A ≥ 0.97                         (≈ 23,589 baseline)
precision@1 ≥ 0.85, recall@5 ≥ 0.95        (labelled corpus, Phase 5)
search p50 < 5 ms, p99 < 15 ms             (latency corpus, Phase 5)
buildIndex < 100 ms (137 skills)           (Phase 4)
no failure-injection scenario crashes the extension's contract
```

---

## Phase 8b — Agent-Transcript E2E

**Goal**: a real Pi session, with the extension installed, demonstrates
that the agent calls `skill-search` and then uses `read` on the returned
path. This is the E2E row in SPEC §9 and the third acceptance criterion
in story US-001.

**SPEC anchor**: §9 E2E row.

**Tasks**

1. Set up a reproducible Pi v0.74+ test environment:
   - Either link the locally-checked-out `Source/pi-mono` via
     `npm install file:../pi-mono/packages/coding-agent`, or install the
     published `@earendil-works/pi-coding-agent@0.74.x` from npm.
   - Decision recorded in Phase 0 outcome (`0005-stack-choice.md`).
2. Decide on the LLM provider for the transcript:
   - **Preferred:** Pi's faux/test provider (the same approach
     `Source/pi-mono/packages/coding-agent/test/suite/harness.ts` uses).
     This avoids real API spend and makes the test reproducible.
   - **Fallback:** a real Anthropic / OpenAI key supplied via env var, with
     the test skipped when the env var is absent.
3. Create `test/agent-transcript.e2e.test.ts`:
   - Start a Pi session pointed at the 137-skill corpus.
   - Send a user prompt: `"I need to compute molecular descriptors with rdkit"`.
   - Assert the transcript contains a `tool_use` entry with
     `name === "skill-search"` and an argument matching `query: "rdkit"`
     (or a close variant).
   - Assert a follow-up `read` tool call against the returned
     `rdkit/SKILL.md` path.
   - Capture the transcript to `test/evidence/us-001-agent-transcript.json`.
4. Mark US-001 `Status: implemented` in
   `docs/stories/epics/E01-core-search/US-001-core-indexer-and-search-tool.md`
   and add an Evidence section pointing to:
   - The token-measurement run from Phase 8.
   - The agent transcript captured here.
5. Update `docs/TEST_MATRIX.md` US-001 E2E column to `implemented`.

**Deliverables**

- `test/agent-transcript.e2e.test.ts`.
- `test/evidence/us-001-agent-transcript.json`.
- Story status + matrix updates.

**Validation gate**

```text
npx tsx node_modules/vitest/dist/cli.js --run test/agent-transcript.e2e.test.ts → pass
transcript contains skill-search tool_use AND a follow-up read on the returned path
```

---

## Phase 9 — Category Rules Tuning (US-002)

**Goal**: classifier coverage 100% on seed corpus; summary ≤ 200 tokens
preferred / ≤ 250 hard cap.

**SPEC anchor**: §6.1, §10.3.

**Tasks**

1. Run `classify` over `test/fixtures/skills-137.json`; produce
   `test/fixtures/classification-coverage.json` mapping skill name → list
   of categories.
2. Inspect every skill: any `["Other"]` requires a rule update.
3. Inspect category memberships: any false positive (e.g., "general"
   skill landing in "Bioinformatics" because `"gene"` matched
   `"generation"`). Three mitigations, in increasing strength:
   - **Tighten the keyword** (e.g., `"gene"` → `"gene "`, requiring a
     trailing space). Quick fix, but misses inflections like `"genes"`,
     `"genetic"` — must be paired with adding those as separate keywords.
   - **Switch to word-boundary regex matching** for the rule. Replace
     `text.includes(kw)` with `new RegExp(\`\\b${kw}\\b\`).test(text)`.
     Cleaner; does not require adding inflections. Requires escaping
     regex specials in the keyword strings.
   - **Document and accept** the false positive in
     `docs/product/category-rules.md` if it is harmless (the skill
     legitimately has multi-domain content).

   The decision per false positive is recorded in
   `docs/product/category-rules.md` rationale section.
4. Re-measure summary tokens with `tiktoken`. If > 200 tokens at
   `maxExamples=5`, lower `maxExamples` per category until ≤ 200, but
   don't go below 3 unless category has very few members.
5. Add `test/coverage.test.ts`:
   - Every seed-corpus skill assigned ≥ 1 category (no "Other" output).
   - Summary ≤ 200 tokens at chosen `maxExamples` per rule.
6. Create `docs/product/category-rules.md` documenting:
   - Final rule set with rationales for any tightened keywords.
   - Synonym dictionary (cross-link to `src/synonyms.ts`).
   - Substring-match caveat from SPEC §6.2 + the mitigations applied.
7. Create `docs/product/skill-search.md` (was originally a US-001
   deliverable per SPEC; produced here because we have the empirical
   data only after the full search loop runs).
8. Update story `US-002` status → `implemented` with evidence.
9. Update `docs/TEST_MATRIX.md` row for US-002.

**Deliverables**

- Final tuned `src/categories.ts`.
- `test/fixtures/classification-coverage.json`.
- `test/coverage.test.ts`.
- `docs/product/category-rules.md`, `docs/product/skill-search.md`.
- Story + matrix updates.

**Validation gate**

```text
npx tsx node_modules/vitest/dist/cli.js --run test/coverage.test.ts → pass
classifier coverage 100% on 137-skill corpus
summary ≤ 200 tokens at chosen maxExamples
```

---

## Phase 10 — Proactive Suggestion Hook (US-003)

**Goal**: opt-in `tool_call` hook detects Python imports and surfaces a
hint when the imported package matches an indexed skill.

**SPEC anchor**: §11 E02-S01.

**Tasks**

1. Create `src/proactive.ts`:
   - `detectPythonPackages(command: string): string[]` — regex-based,
     covering: `import X`, `from X import …`, `pip install X`,
     `pip install X==…`, `uv add X`, `uv pip install X`, multi-package
     installs (`pip install X Y Z`), comment exclusion.
2. Create `src/settings.ts`:
   - Read `.pi/settings.json` (or use `ctx.settings` if Pi exposes it).
   - Cache the `pi-skill-search.proactive` flag at first
     `before_agent_start`.
3. Extend `index.ts`:
   - When proactive flag is `true`, register a `pi.on("tool_call", ...)`
     handler.
   - For each `bash` tool call, run `detectPythonPackages` on the
     command string.
   - For each detected package present in `index.entries`, emit a hint
     (via `ctx.ui.notify` if available, otherwise a custom message via
     `pi.sendMessage` if exposed).
   - Debounce: skip if the package was already hinted this session
     (`Set<string>` keyed by package name).
   - Hook is no-op when `index` is undefined.
4. Create `test/proactive.test.ts`:
   - Positive cases: `python -c "import rdkit"`,
     `pip install scanpy==1.9.3`, `uv add scvelo`.
   - Negative cases: `python rdkit.py` (filename, not import),
     `pip install -r requirements.txt`, `# pip install rdkit`.
   - Debounce: same package detected twice → one hint emitted.
   - Setting `false` or unset → hook no-op.
5. Create `test/proactive-integration.test.ts`:
   - Lifecycle test from Phase 7 + proactive enabled. Fire
     `tool_call` events; assert hints emitted.
6. Create `docs/product/proactive-suggestion.md` documenting the hook
   contract, the supported regex patterns, and the opt-in setting.
7. Update story `US-003` status → `implemented` with evidence.
8. Update `docs/TEST_MATRIX.md` row for US-003.

**Deliverables**

- `src/proactive.ts`, `src/settings.ts`.
- `index.ts` extended.
- `test/proactive.test.ts`, `test/proactive-integration.test.ts`.
- `docs/product/proactive-suggestion.md`.
- Story + matrix updates.

**Validation gate**

```text
npx tsx node_modules/vitest/dist/cli.js --run test/proactive*.test.ts → pass
hook is no-op when setting unset (verified by test)
```

---

## Phase 11 — Polish + Release Prep + CI

**Goal**: package ready for `npm publish` when user gives the green light;
CI gates every PR.

**Tasks**

1. README polish (already done at project setup, refresh with usage
   examples now that the extension works).
2. Create `CHANGELOG.md` — entry for `0.1.0`.
3. Bump `package.json` version `0.0.0` → `0.1.0`.
4. Add `repository`, `homepage`, `bugs`, `keywords`, `author`, and
   `license` fields to `package.json`. The `license` field is required
   by npm in addition to the `LICENSE` file (e.g., `"license": "MIT"`).
5. Add `files` field to `package.json` to control what ships. Content
   depends on Phase 0 loader-verification outcome:
   - jiti loads `.ts` from `node_modules`:
     `["index.ts", "src/**/*.ts", "README.md", "LICENSE", "CHANGELOG.md"]`.
   - jiti does not load `.ts`: emit `dist/` via `tsc` and ship
     `["dist/**", "README.md", "LICENSE", "CHANGELOG.md"]`.
6. Add `prepublishOnly` script: run `npm run check && npm test` before
   any publish.
7. Decision `0006-release-process.md`: how versions are cut, who
   publishes, what triggers a major bump, npm scope question revisited.
8. Set up CI (GitHub Actions if the project ends up on GitHub):
   - `.github/workflows/ci.yml` runs on every push and PR:
     - Node 20 (matches Pi's runtime).
     - `npm ci`.
     - `npm run check`.
     - `npm test`.
   - Phase 8 / 8b benches do NOT run in CI by default (cost / flakiness).
     Add a manual workflow_dispatch entry for benches.
9. Final `docs/TEST_MATRIX.md` review — every row `implemented` with
   evidence.
10. Final `docs/HARNESS_BACKLOG.md` review — close items resolved during
    implementation, mark proposed items still open.
11. README updated with: install instructions, usage example
    (one paragraph + code snippet of how to enable in `.pi/settings.json`),
    troubleshooting (e.g., what to do when strip regex drift detected).
12. **Do NOT publish** — per phương án C decision, publish action is
    deferred until user explicitly authorises.

**Deliverables**

- `CHANGELOG.md`.
- `package.json` v0.1.0.
- `docs/decisions/0006-release-process.md`.
- `.github/workflows/ci.yml`.
- README polished.

**Validation gate**

```text
npm run check        → 0 issues
npm test             → all tests pass
npm pack             → tarball produced (do not publish)
CI run on a test PR  → green
```

---

## Cross-Cutting: Fixture Inventory

Single canonical list of fixtures across phases:

| Path | Purpose | Created in | Used by |
|---|---|---|---|
| `test/fixtures/skills-137.json` | Snapshot of `PiSkill[]` from `Source/scientific-agent-skills` | Phase 4 | Phases 4, 5, 6, 8, 9 |
| `test/fixtures/labeled-queries.json` | 25+ query → expected primary + alternates | Phase 5 | Phases 5, 9 |
| `test/fixtures/latency-queries.json` | 1,000 synthetic queries (500 single + 500 multi) | Phase 5 | Phase 5 bench |
| `test/fixtures/classification-coverage.json` | skill name → categories[] from real `classify` run | Phase 9 | Phase 9 |
| `test/evidence/us-001-agent-transcript.json` | Real Pi-session transcript proving agent uses skill-search + read | Phase 8b | Phase 8b evidence |

---

## Cross-Cutting: Test Commands

Mirror Pi-mono pattern: `npx tsx node_modules/vitest/dist/cli.js`. Aliased
in `package.json` scripts:

```json
{
  "scripts": {
    "check": "biome check . && tsc --noEmit",
    "test": "tsx node_modules/vitest/dist/cli.js --run",
    "test:watch": "tsx node_modules/vitest/dist/cli.js",
    "bench:index": "tsx bench/buildIndex.bench.ts",
    "bench:search": "tsx bench/search.bench.ts",
    "bench": "npm run bench:index && npm run bench:search",
    "format": "biome format --write ."
  }
}
```

Add `bench:*` scripts as new bench files appear in later phases. The umbrella
`bench` script chains them. Avoid relying on a single `bench/index.ts` that
must be kept in sync.

---

## Cross-Cutting: Decision Log Anchors

Decisions to be recorded during this plan:

| ID | Title | Phase |
|---|---|---|
| 0005 | Stack choice (TypeScript ESM + vitest + biome + tsc-noEmit) | 0 |
| 0006 | Release process (when to bump major, who publishes) | 11 |

Decisions `0001`–`0003` are harness-level (already shipped). `0004` is
Search over Inject (already shipped from SPEC §3).

---

## Cross-Cutting: Open Questions Tracked

Resolve during the indicated phase:

1. ~~**Pi extension loading from `node_modules`**~~ — **RESOLVED**: jiti
   loads `.ts`, aliases resolve `@earendil-works/pi-coding-agent` to main
   entry. Ship `src/**/*.ts`. Outcome recorded in blockers.
2. **License** — promoted to a Phase 0 blocker. User confirms before
   `LICENSE` file is committed.
3. **Settings access in extension** — does Pi expose `ctx.settings`, or
   must we read `.pi/settings.json` ourselves? Phase 10 task.
4. ~~**`pi.sendMessage` availability**~~ — **RESOLVED**: `sendMessage` IS
   available on `ExtensionAPI` (types.ts:1178). Can send custom messages
   with `deliverAs: "steer" | "followUp" | "nextTurn"`. Also `ui.notify`
   available (types.ts:135). Phase 10 uses `sendMessage` for proactive
   hints.
5. **True E2E provider for Phase 8b** — Pi's faux/test provider vs a real
   LLM key. Phase 8b task #2 picks one based on what Pi exposes; default
   leans toward faux provider for reproducibility.
6. ~~**`@earendil-works/pi-coding-agent` published version vs local
   workspace**~~ — **RESOLVED**: local `Source/pi-mono/packages/coding-agent`
   is at `0.74.1`. If npm published version differs, use `file:` protocol
   in devDep.
7. ~~**`Skill` type not exported**~~ — **RESOLVED** (plan review 2026-05-16):
   Declared locally as `PiSkill`. No upstream change needed.
8. ~~**`formatSkillsForPrompt` not exported**~~ — **RESOLVED**: tests build
   synthetic `<available_skills>` blocks matching the known format.
9. ~~**`buildSystemPrompt` not exported**~~ — **RESOLVED**: integration tests
   use synthetic systemPrompt strings, not the builder function.

---

## Out-of-Plan Items

Per SPEC §13 and phương án C user decision:

- **No `npm publish` action** until user explicitly authorises (post-Phase
  11).
- **No upstream Pi changes** from this project. Items 1–3 in
  `docs/HARNESS_BACKLOG.md` are proposals for `Source/pi-mono`, not
  blocking work for this project.
- **No standalone skill discovery** (bypassing Pi's `loadSkills()`).
- **No `fs.watch` re-indexing**.
- **No embeddings** until skill count ≥ 500.
- **No telemetry / metrics** until `pi-recollect` lands.
