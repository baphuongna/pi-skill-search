# 0005 — Stack Choice

## Decision

Use TypeScript ESM + vitest + biome + tsc-noEmit for pi-skill-search.

## Rationale

Mirrors the Pi ecosystem (pi-mono) for consistency. Key factors:

1. **TypeScript ESM** — Pi extensions use `"type": "module"`. jiti in Pi's
   extension loader resolves `.ts` source files, so no build step needed
   at install time. Ship `src/**/*.ts` directly.

2. **vitest** — Compatible with TypeScript ESM, fast, good mocking support
   (`vi.mock` + `vi.hoisted`). Run via `npx tsx node_modules/vitest/dist/cli.js --run`.

3. **biome** — Formatting + linting in one tool. Config: tabs, indent 3,
   line width 120 (same as pi-mono).

4. **tsc --noEmit** — Type-check only, no emit. Extension runs as `.ts`
   through jiti.

5. **js-yaml** — Dev-only, used in fixture generation script to parse
   YAML frontmatter from SKILL.md files.

## Consequences

- No build step at install time — jiti handles `.ts` loading.
- No ESLint, no Prettier — biome handles both.
- `tiktoken` used for token measurement tests (dev only).
- `tinybench` used for latency benchmarks (dev only).

## Public API Constraints

The following symbols are **NOT** exported from `@earendil-works/pi-coding-agent`:
- `Skill` type — declared locally as `PiSkill`
- `formatSkillsForPrompt` — internal
- `loadSkills` — internal
- `buildSystemPrompt` — internal

Tests use synthetic fixtures instead of importing these internals.

## Date

2026-05-16
