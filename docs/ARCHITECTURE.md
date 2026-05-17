# Architecture

## Stack

- **Language**: TypeScript ESM (`"type": "module"`)
- **Runtime**: Node.js 20+ (Pi extension loaded via jiti)
- **Test runner**: vitest (invoked via `tsx node_modules/vitest/dist/cli.js --run`)
- **Linter/formatter**: biome (tabs, indent 3, line width 120)
- **Type-check**: `tsc --noEmit` (no build step — jiti loads `.ts` directly)

## Pi Extension Loading Model

Pi's extension loader (`loader.ts`) uses jiti to resolve extension modules.
Extensions are loaded from `node_modules` or local paths. jiti transpiles
`.ts` on the fly, so extensions ship as `.ts` source.

The loader aliases `@earendil-works/pi-coding-agent` to the main package
entry point. Extensions can only import symbols re-exported from that entry.

### Available Exports (verified v0.74.0)

From `@earendil-works/pi-coding-agent`:
- Event types: `BeforeAgentStartEvent`, `BeforeAgentStartEventResult`,
  `AgentStartEvent`, `AgentEndEvent`, `ToolCallEvent`, `BashToolCallEvent`,
  `SessionStartEvent`, etc.
- API: `ExtensionAPI`, `defineTool`
- Options: `BuildSystemPromptOptions`

### NOT Exported (must use workarounds)

- `Skill` type → declared locally as `PiSkill`
- `formatSkillsForPrompt` → tests use synthetic `<available_skills>` blocks
- `loadSkills` → fixture generator uses `js-yaml` directly
- `buildSystemPrompt` → tests use synthetic system prompt strings

## Module Structure

```
pi-skill-search/
  index.ts          — Extension entry point (default export)
  src/
    types.ts        — Domain types (PiSkill, SkillEntry, SkillIndex, etc.)
    text.ts         — Tokenization (tokenize per SPEC §5.3)
    indexer.ts      — Index builder (buildIndex per SPEC §6.4)
    search.ts       — Search algorithm (search per SPEC §5.1)
    categories.ts   — Category classifier (classify per SPEC §6.1-6.2)
    synonyms.ts     — Synonym dictionary (expandQuery per SPEC §5.2)
    format.ts       — Output formatters (summary, tool description, results)
    strip.ts        — Strip regex for <available_skills> block
  test/
    text.test.ts
    synonyms.test.ts
    classify.test.ts
    indexer.test.ts
    search.test.ts
    format.test.ts
    strip.test.ts
    lifecycle.test.ts
    integration.test.ts
    failure-isolation.test.ts
    fixtures/
      skills-137.json
      labeled-queries.json
      latency-queries.json
      classification-coverage.json
  bench/
    buildIndex.bench.ts
    search.bench.ts
  scripts/
    build-skills-fixture.ts
    measure-tokens.ts
```

## Extension Flow

```
Pi session starts
  → Extension module loaded by jiti
  → index.ts default export called with ExtensionAPI

before_agent_start event
  → ensureIndex(event.systemPromptOptions.skills)
    → Filter disableModelInvocation === true
    → Fingerprint check (sorted filePath join)
    → If changed: buildIndex(skills)
  → Register skill-search tool (first time only)
  → Strip <available_skills> from systemPrompt
  → Append category summary
  → Return { systemPrompt: stripped + summary }

skill-search tool call
  → Validate query (1-500 chars)
  → Clamp limit [1, 20]
  → search(index, query, limit)
  → Return formatted results
```

## Zero Runtime Dependencies

The extension has zero npm runtime dependencies beyond the Pi peer dep.
All heavy lifting (tiktoken, tinybench, js-yaml) is dev-only.
