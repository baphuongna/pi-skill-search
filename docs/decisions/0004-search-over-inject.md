# 0004 Search Over Inject

Date: 2026-05-15

## Status

Accepted

## Context

Pi's `formatSkillsForPrompt()` (`Source/pi-mono/packages/coding-agent/src/core/skills.ts:340-366`)
injects every loaded skill's name + description into the system prompt as an
`<available_skills>` block, and Pi re-sends that prompt on every agent turn.

For the 137-skill `scientific-agent-skills` corpus this costs **23,589 tokens**
of system prompt per turn (chars / 3.5 estimator), or **11.8% of the 200K
context window**. At 50 turns on Sonnet 4 that is **$3.54 per session** in
input tokens used purely on skill descriptions, and the prompt growth triggers
compaction ~15% sooner.

The pattern is sustainable for the 10–30 skill range Pi was originally
designed for (~2,000 tokens). It breaks down at 137+ skills:

| Skills | Inject-all tokens | % of 200K context |
| --- | --- | --- |
| 137 | 23,589 | 11.8% |
| 500 | 86,091 | 43% |
| 1,000 | 172,182 | 86% |

In addition, 61/137 skills mention other skill names in their descriptions
(e.g., `datamol` says "wrapper around RDKit"), which means injecting all
descriptions also degrades agent decision quality: 85–93% of inject-all
candidates are false positives per query.

## Decision

Replace inject-all with two layers, both delivered through a Pi extension
(`pi-skill-search`):

1. **Category summary** — a ~150-token markdown block listing the
   domains/categories present in the user's skill set, injected into the
   system prompt every turn via `before_agent_start`.
2. **`skill-search` tool** — an on-demand tool (~166-token definition) the
   agent calls when it actually needs a skill. Returns the top-N matches with
   name, description, and `filePath`. Agent uses Pi's standard `read` tool to
   load the full SKILL.md.

The extension MUST also strip Pi's auto-injected `<available_skills>` block
from the system prompt every turn, since Pi exposes no opt-out flag for
`formatSkillsForPrompt()`. Failure to strip yields *higher* total tokens than
the unmodified baseline (`Pi inject (≈23,589) + summary (≈150) + tool def
(≈166) ≈ 23,905`), so the strip is non-negotiable.

Verified extension API surface (Pi v0.74.0):

- `BeforeAgentStartEvent.systemPromptOptions.skills: Skill[]` —
  source for the index without re-scanning or re-parsing
  (`packages/coding-agent/src/core/extensions/types.ts:625-633`).
- `BeforeAgentStartEventResult.systemPrompt?: string` — only available
  mutation channel (types.ts:1009).
- No persistent system-message API exists — cost model is
  `(summary + tool) × N turns`, not set-once.

## Alternatives Considered

1. **Keep inject-all, raise context-window pricing tolerance.** Rejected:
   linear growth makes 500-skill collections occupy 43% of context and 1,000
   skills occupy 86%. Dead end.
2. **TF-IDF index instead of keyword + name boost.** Rejected: benchmarked at
   ~90% correctness vs 93% for keyword, with no significant speed advantage
   on a 137-skill corpus (`SPEC.md` §5.6).
3. **Sentence-transformer / embedding search.** Rejected for v1: ~95% quality
   estimated, but requires ~400 MB torch dependency and ~50× slower at this
   scale. Revisit at 500+ skills.
4. **Auto-inject only the skills relevant to project imports.** Rejected: too
   speculative without measurement of false-positive rate, and overlaps with
   the proposed E02 proactive-suggestion hook anyway.
5. **Patch Pi upstream to add a skill-injection opt-out flag.** Deferred: the
   extension can strip the block at the `before_agent_start` boundary today;
   an opt-out flag is recorded in `docs/HARNESS_BACKLOG.md` as an upstream
   improvement, but the extension does not block on it.

## Consequences

Positive:

- Startup tokens drop from 23,589 to ≤ 600 for the seed corpus (≥ 97%
  reduction; `SPEC.md` §9 acceptance bar).
- Cost per session at 50 turns drops from $3.54 to ≤ $0.05.
- Search tool cost is constant w.r.t. skill count, so 500- and 1,000-skill
  collections become viable.
- Agent reasoning improves because it works with a top-N filtered view
  instead of 137 candidates with 85–93% noise.

Tradeoffs:

- Agent must explicitly call `skill-search` to discover specific skills (one
  extra LLM round-trip per discovery). The category summary mitigates this by
  letting the agent know which domains exist.
- The strip-regex anchors on Pi's lead-in sentence wording. If Pi changes the
  wording, the strip becomes a no-op and behavior degrades to additive
  (worse than baseline). Mitigated by a regression test in `SPEC.md` §9.
- Tool description is rendered once at first `before_agent_start` and cannot
  be updated mid-session (Pi has no `updateToolDescription` API). Acceptable
  because the description is a coarse hint, not a live index.
- Cost is per-turn, not one-time. `(summary + tool) × N turns` is still ~98%
  cheaper than `inject-all × N turns`, but the "set once" mental model from
  early drafts does not apply.

## Follow-Up

- Story `E01-S01` implements the indexer, search, category summary, and
  strip-regex.
- Story `E01-S02` tunes category rules against the seed corpus and measures
  real summary token count with `tiktoken`.
- Story `E02-S01` adds the proactive `tool_call` hook (opt-in via
  `pi-skill-search.proactive: true`).
- `docs/HARNESS_BACKLOG.md` carries upstream Pi improvements that would let
  this extension simplify (opt-out flag, persistent system message,
  `updateToolDescription`).
- Re-evaluate keyword-vs-embedding choice at 500+ skills.
