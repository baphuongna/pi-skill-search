# US-002 Category Rules Tuning

## Status

planned

## Lane

normal (configuration / validation only — 0 risk flags, but depends on US-001 implementation)

## Product Contract

Tune the 14-rule classifier in `SPEC.md` §6.1 against the 137-skill
`scientific-agent-skills` corpus so that:

1. Every skill in the seed corpus is classified into ≥ 1 category (no
   `"Other"`).
2. The rendered category summary stays under the 250-token hard cap from
   `SPEC.md` §10.3 / §6.3, ideally ≤ 200 tokens for headroom.
3. The category-membership counts in the production summary match a real
   `classify` run, not the hand-curated illustrative numbers in
   `SPEC.md` §4.5.

## Relevant Product Docs

- `SPEC.md` §6 (rules + classification logic + summary generation).
- `docs/product/skill-search.md` (created in US-001).
- `docs/product/category-rules.md` — to be created in this story
  (classification rules + synonym dictionary, per `SPEC.md` Candidate Product
  Docs table).

## Acceptance Criteria

- Running `classify` over the 137 `scientific-agent-skills` skills produces
  zero `"Other"` assignments.
- A coverage report (skill-name → categories[]) is committed to
  `test/fixtures/classification-coverage.json` and asserted by an integration
  test.
- The rendered category summary measured with `tiktoken` (`cl100k_base`) is
  ≤ 200 tokens at full `maxExamples`. If not, `maxExamples` is reduced per
  category until the cap is met (per the §6.3 truncation loop).
- Category-membership counts shown to the agent reflect the real
  `classify` output.
- The `metabolism` regression test from US-001 still passes (synonyms in
  `SPEC.md` §5.2 must not regress while editing the synonym table).
- Substring-match false positives surfaced during this tuning are either:
  (a) fixed by tightening the keyword (e.g., trailing space), or
  (b) accepted with a note in `docs/product/category-rules.md` explaining
  why the over-broad rule is harmless.

## Design Notes

- **Inputs**: classifier output for each of the 137 skills + summary token
  count.
- **Outputs**:
  - `docs/product/category-rules.md` documenting the final rules.
  - Adjustments to `src/categories.ts::CATEGORY_RULES` (keywords or
    `maxExamples`).
  - Updated synonym dictionary if the tuning surfaces missing terms.
- **No code changes outside `categories.ts` and `synonyms.ts`** unless the
  cap-truncation loop in `format.ts` itself needs adjustment.
- **Domain rules**: rules are ordered by the declaration order in
  `CATEGORY_RULES`; reordering is allowed and changes the example-query
  selection (`SPEC.md` §4.4 ties broken by declaration order).

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Coverage assertion: every seed-corpus skill has ≥ 1 category. Token-cap assertion: summary ≤ 200 tokens at full `maxExamples`, ≤ 250 after truncation. |
| Integration | Classifier coverage fixture committed and asserted (`test/fixtures/classification-coverage.json`). End-to-end summary rendering uses real `Skill[]` from a fixture mimicking Pi's loader output. |
| E2E | Visual inspection of the rendered summary in a real Pi session — categories make sense, examples are recognisable, no obvious mis-classifications. Captured in story evidence. |
| Platform | Same as US-001. |
| Performance | Re-measure `Δtokens` from US-001 to confirm tuning did not push above 600 total. |
| Release | None. |

## Harness Delta

- Adds `docs/product/category-rules.md`.
- Updates `docs/TEST_MATRIX.md` row for this story.
- May surface additional `docs/HARNESS_BACKLOG.md` items if the tuning
  reveals systematic skill-description quality issues (out of scope to fix
  upstream).

## Evidence

(none yet — story is `planned`, depends on US-001)
