# US-003 Proactive Suggestion Hook

## Status

planned

## Lane

normal (notifications only, no blocking — 0 risk flags)

## Product Contract

Extend `pi-skill-search` (same npm package, per decision `0004` follow-up and
`SPEC.md` §10.4) with a `tool_call` hook that:

1. Watches `bash` tool calls.
2. Detects Python package imports in the bash command (e.g.,
   `python -c "import rdkit"`, `pip install scanpy`).
3. If a detected package matches an indexed skill name, surfaces a hint to
   the agent suggesting it call `skill-search` for that package before
   proceeding.
4. **Off by default.** Enabled by setting `pi-skill-search.proactive: true`
   in `.pi/settings.json`.

## Relevant Product Docs

- `SPEC.md` §11 E02-S01 (story overview).
- `docs/decisions/0004-search-over-inject.md` follow-up.
- `docs/product/proactive-suggestion.md` — to be created in this story.

## Acceptance Criteria

- With the setting unset or `false`, the extension behaves identically to
  US-001 + US-002 (no extra notifications, no extra LLM tokens).
- With the setting `true` and an indexed skill name detected in a bash
  command, exactly one hint is surfaced per unique package per session
  (debounced — repeated imports of the same package do not spam).
- The hint mentions the skill name and the path; the agent decides whether
  to call `skill-search` and `read`.
- The hook never blocks the bash tool call — it only annotates / hints.
- If `index` is unavailable (e.g., before the first `before_agent_start`
  delivers `Skill[]`), the hook is a no-op.
- Detection works for at least these patterns:
  - `import <pkg>` and `from <pkg> import …` inside `python -c "…"`.
  - `pip install <pkg>` (single package, ignoring version specifiers).
  - `uv pip install <pkg>` and `uv add <pkg>`.
  - Future patterns can be added as new test cases in US-003 evolution.

## Design Notes

- **Files**: extend `index.ts` with the `tool_call` handler. Add
  `src/proactive.ts` for package-detection regex and matching logic. Add
  `src/settings.ts` if reading `.pi/settings.json` is not already factored
  out.
- **Commands**: none.
- **Queries**: none.
- **API**: subscribes to `tool_call` event (verified `types.ts:772`).
- **Tables**: none. In-memory `Set<string>` of seen package names per
  session for debounce.
- **Domain rules**:
  - Detection is heuristic; false-positives are acceptable because the
    output is a hint, not a forced action.
  - No mutation of the bash command or its arguments.
- **Settings access**: read once at first `before_agent_start` (cache), use
  `ctx.settings` if the Pi extension API exposes it; otherwise read
  `.pi/settings.json` directly.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Package-detection regex against fixture commands: positives (`python -c "import rdkit"`, `pip install scanpy==1.9`, `uv add scvelo`) and negatives (`python rdkit.py` is a filename, `pip install -r req.txt`, `# pip install rdkit` comments). |
| Integration | Hook fires only when setting `true`. Hook is no-op when index undefined. Debounce: same package detected twice yields one hint. Mock `bash` call carries through unmodified. |
| E2E | Real Pi session with the setting on: agent runs a bash command importing `rdkit`, hint appears, agent then calls `skill-search` for rdkit (transcript captured as evidence). |
| Platform | Same as US-001. |
| Performance | Hook adds ≤ 1 ms per `tool_call` event (detection is regex). |
| Release | Confirm hook is no-op in default-config installs (no setting). |

## Harness Delta

- Adds `docs/product/proactive-suggestion.md`.
- Updates `docs/TEST_MATRIX.md` row for this story.
- May identify additional package managers worth supporting; record in
  `docs/HARNESS_BACKLOG.md` if not addressed in this story.

## Evidence

(none yet — story is `planned`, depends on US-001)
