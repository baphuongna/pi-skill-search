# Agent Operating Guide

This repository is in **implementation phase**. Phases 0–10 are complete
with 106 passing tests across 12 test files.
application source folders, package scripts, CI, or tests until a story
(starting with E01-S01) explicitly moves the project into implementation.

## Communication

- Respond in **Vietnamese** by default (per workspace `AGENTS.md`).
- Code identifiers and technical terms: English.
- Comments: Vietnamese for business logic, English for technical.

## Source Of Truth

Read in this order:

1. `README.md` — project status.
2. `SPEC.md` — input specification (token-cost evidence, search algorithm,
   extension architecture, validation shape). This is the canonical input for
   the first buildout. Do not edit `SPEC.md` for ongoing change requests; use
   product docs, stories, and decisions instead (per `docs/decisions/0002`).
3. `PLAN.md` — phased implementation roadmap. Tells you which phase the
   project is in and what the next concrete tasks are. Update phase status
   and validation-gate evidence as you progress; do not re-architect the
   plan without recording a decision.
4. `docs/HARNESS.md` — human-agent operating model.
5. `docs/FEATURE_INTAKE.md` — turn any prompt into work classification.
6. `docs/product/` — current product contracts (empty until `PLAN.md` Phase
   8 / 9 / 10 derive them).
7. `docs/ARCHITECTURE.md` — architecture discovery and boundary rules. The
   Pi extension architecture is described in `SPEC.md` §7; record stack
   decisions under `docs/decisions/` when they change.
8. `docs/stories/` — story packets and backlog.
9. `docs/TEST_MATRIX.md` — proof status.
10. `docs/decisions/` — durable decisions. Project decisions start at `0004`
    (numbers `0001`–`0003` are reserved for harness-level decisions
    inherited from `harness-experimental` v0).

## Project-Specific Rules

- **Spec is input, not living plan.** Per harness decision `0002`, ongoing
  behavior changes update `docs/product/`, story packets, and decisions —
  not `SPEC.md`. `SPEC.md` is the snapshot used for the first decomposition.
- **Read upstream Pi code before changing assumptions.** The spec cites
  specific line numbers in `Source/pi-mono/packages/coding-agent/src/core/`
  (e.g., `extensions/types.ts`, `system-prompt.ts`, `agent-session.ts`,
  `skills.ts`). Verify these are still accurate when picking up a story.
- **Extension API floor is `@earendil-works/pi-coding-agent >=0.74.1`** — the
  spec assumes `BeforeAgentStartEvent.systemPromptOptions.skills`. An
  implementation story may lower the floor after testing earlier versions.
- **No upstream Pi changes from this project.** If a feature needs a Pi-side
  change (e.g., persistent system message, registerTool description update,
  skill-injection opt-out flag), record it in `docs/HARNESS_BACKLOG.md` as a
  proposal and route the work through `Source/pi-mono` instead.

## Task Loop

For every task:

1. Classify the request with `docs/FEATURE_INTAKE.md`.
2. Identify input type: spec slice, change request, new initiative,
   maintenance request, or harness improvement.
3. Locate the affected product docs and story files.
4. Check `docs/TEST_MATRIX.md` for existing proof and gaps.
5. Work only inside the selected lane: tiny, normal, or high-risk.
6. Before finishing, ask:
   - Did product truth change? Update `docs/product/`.
   - Did validation expectations change? Update story file and
     `docs/TEST_MATRIX.md`.
   - Did architecture rules change? Update `docs/ARCHITECTURE.md` or add a
     decision.
   - Did we discover a recurring failure pattern or upstream Pi gap? Add to
     `docs/HARNESS_BACKLOG.md`.
   - Did the next agent need a clearer instruction? Update this file.
7. Update routine harness files directly, or add a proposal to
   `docs/HARNESS_BACKLOG.md` when the change is structural.

## Harness Change Policy

Agents may update directly:

- Story status and evidence rows.
- `docs/TEST_MATRIX.md` rows.
- Links from story packets to product docs.
- Validation notes and reports.
- Small clarifications tied to the current task.

Agents should ask for human confirmation before:

- Changing architecture direction.
- Removing validation requirements (e.g., lowering precision@1 / recall@5
  thresholds in `SPEC.md` §9).
- Changing the source-of-truth hierarchy.
- Changing risk classification rules.
- Editing `SPEC.md` (it is a frozen input snapshot — see harness decision
  `0002` and project decision `0004`).

## Done Definition

A task is done only when:

- The requested change is completed or the blocker is documented.
- Relevant docs, stories, and test matrix entries remain current.
- Validation commands were run when they exist.
- Missing harness capabilities were added to `docs/HARNESS_BACKLOG.md`.
- The final response says what changed (and, in Vietnamese, the user-visible
  summary).
