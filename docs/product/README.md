# Product Docs

This directory is intentionally **mostly empty** in Harness v0. Per the
harness rule (and `docs/decisions/0002-post-spec-product-lifecycle.md`),
product domain files are created when the story that owns them begins
implementation, not pre-emptively from the spec.

## Why Empty

`SPEC.md` at the project root is the input snapshot. It contains the
following Candidate Product Docs (per `SPEC.md` Candidate Product Docs
table):

| Future File | Purpose | Source Sections | Created By |
| --- | --- | --- | --- |
| `skill-search.md` | Tool contract, search algorithm | `SPEC.md` §4–§5 | Story US-001 |
| `category-rules.md` | Classification rules + synonym dictionary | `SPEC.md` §5.2, §6 | Story US-002 |
| `proactive-suggestion.md` | `tool_call` hook contract | `SPEC.md` §11 E02-S01 | Story US-003 |

Each file is created during the story that derives it. Until then, agents
should read `SPEC.md` directly.

## Update Rule

When behavior changes after a product doc exists:

1. Update the affected file in `docs/product/`.
2. Update or create the relevant story packet under `docs/stories/`.
3. Update `docs/TEST_MATRIX.md`.
4. Record a decision under `docs/decisions/` if the change affects
   architecture, scope, risk, or a previously settled product rule.

Do **not** edit `SPEC.md` for ongoing changes. `SPEC.md` is the input
snapshot used for the first decomposition; product docs, stories, and
decisions are the living surface (per harness decision `0002`).
