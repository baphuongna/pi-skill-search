# Harness Backlog

Use this file when an agent discovers a missing harness capability or an
upstream Pi gap that affects this project, but should not change the
operating model immediately.

## Template

```md
## Missing Harness Capability

### Title

Short name.

### Discovered While

Task or story that exposed the gap.

### Current Pain

What was hard, repeated, ambiguous, or unsafe?

### Suggested Improvement

What should be added or changed?

### Risk

Tiny, normal, or high-risk.

### Status

proposed | accepted | implemented | rejected
```

## Items

### 1. Pi: skill-injection opt-out flag

#### Discovered While

Spec review for `pi-skill-search`, ahead of US-001.

#### Current Pain

Pi's `formatSkillsForPrompt()` (`Source/pi-mono/packages/coding-agent/src/core/skills.ts:340-366`)
is called unconditionally inside `buildSystemPrompt()` whenever
`selectedTools` includes `read` and `skills.length > 0`. The extension has
to **regex-strip** the rendered `<available_skills>` block from
`event.systemPrompt` every turn (see `SPEC.md` §7.3 strip regex). If Pi
ever changes the lead-in sentence, the strip becomes a no-op and the
extension silently regresses to additive token cost.

#### Suggested Improvement

Add an extension-visible opt-out, e.g.:

- A `BuildSystemPromptOptions.disableSkillInjection?: boolean` flag,
  honored inside `buildSystemPrompt`; OR
- A new event-handler return field
  `BeforeAgentStartEventResult.suppressSkills?: boolean`.

Either avoids the brittle string-strip approach.

#### Risk

Normal — small contract addition in `pi-mono`, no behavior change for
existing extensions that do not opt out.

#### Status

proposed (not blocking US-001 — strip regex is the workaround)

---

### 2. Pi: persistent system-message API

#### Discovered While

Spec review §10.1 — open decision on category-summary injection method.

#### Current Pain

`BeforeAgentStartEventResult` only exposes `systemPrompt?: string`, so the
category summary (~150–250 tokens) must be re-sent on **every** turn.
There is no API for "set this once and Pi will reuse it for the session".
Cost is `(summary + tool) × N turns` instead of `(summary + tool) × 1`.

For `pi-skill-search` this still beats inject-all by ~98%, so it is not
blocking. Other extensions that inject larger persistent context
(rule packs, persona prompts, etc.) face the same multiplicative cost.

#### Suggested Improvement

Add a session-scoped context API on `ExtensionAPI`, e.g.:

```ts
pi.setSessionContext(key: string, value: string): void;
pi.removeSessionContext(key: string): void;
```

Pi would inject all set contexts into the system prompt assembly (probably
through `BuildSystemPromptOptions`) and only rebuild the prompt when a
context entry changes.

#### Risk

Normal — additive API, no breaking change.

#### Status

proposed (not blocking — per-turn injection is acceptable for v1)

---

### 3. Pi: `pi.updateToolDescription(name, description)` API

#### Discovered While

Spec review §7.3 — known limitation on stale tool description after
mid-session skill changes.

#### Current Pain

`pi.registerTool(...)` cannot be called twice with the same `name`
(re-registration errors), and there is no `updateToolDescription`. As a
result, when `ensureIndex` rebuilds the index because the user added a new
skill mid-session via `pi reload`, the **internal index is fresh**, but
the **templated tool description the LLM sees is stale** (still rendered
from the first turn's category list).

In practice this is acceptable because the description is a coarse hint,
not a live index. But for skill collections that grow dramatically during
a session, the description can mislead the agent.

#### Suggested Improvement

Add `pi.updateToolDescription(name: string, description: string): void`
that mutates only the description field of an already-registered tool,
without changing the schema or handler.

#### Risk

Tiny — narrow API addition, no semantic change to existing tools.

#### Status

proposed (deferred to E03; current behavior documented as a known
limitation in `SPEC.md` §7.3)

---

### 4. Workspace: project decision numbering convention

#### Discovered While

Creating `docs/decisions/0004-search-over-inject.md` for this project.

#### Current Pain

Harness-experimental ships three decisions (`0001`–`0003`) that document
the *harness itself*. Each new project that installs the harness inherits
them. The original `SPEC.md` proposed `0001-search-over-inject.md` for
the project decision, which collides with the inherited harness
`0001-harness-first-development.md`.

The collision was resolved by renumbering the project decision to `0004`
and noting the renumber in `SPEC.md` §3. This is fine for one project,
but every future harness consumer will face the same first-collision.

#### Suggested Improvement

Either:

- The harness installer renames its own decisions to a `harness/` subfolder
  (e.g., `docs/decisions/harness/0001-harness-first-development.md`) and
  reserves the top-level `docs/decisions/0001..0099` for the consuming
  project; OR
- The harness installer leaves a note in `docs/decisions/README.md`
  recommending project decisions start at `0004`.

#### Risk

Tiny — pure documentation/structure change in the harness repo.

#### Status

proposed (not blocking this project — convention recorded in this project's
`AGENTS.md` and `README.md`)

---
### 4. Pi: export `Skill`, `formatSkillsForPrompt`, `buildSystemPrompt` from public API

#### Discovered While
Plan review for `pi-skill-search` (2026-05-16). Verified against
`Source/pi-mono/packages/coding-agent/src/core/index.ts`.

#### Current Pain
The following symbols are NOT exported from `@earendil-works/pi-coding-agent`:
- `Skill` type (defined in `skills.ts:75`)
- `formatSkillsForPrompt` (defined in `skills.ts:340`)
- `loadSkills` (defined in `skills.ts:405`)
- `buildSystemPrompt` (defined in `system-prompt.ts:28`)

Package `exports` only exposes `"."` and `"./hooks"` — no deep imports.

Extensions that need to inspect or test against Pi skill rendering must
re-implement the format locally or construct synthetic test data.

#### Suggested Improvement
Add these symbols to the public exports in `core/index.ts`:
```ts
export { formatSkillsForPrompt, loadSkills, type Skill } from "./skills.js";
export { buildSystemPrompt } from "./system-prompt.js";
```

Note: `BuildSystemPromptOptions` IS already exported.

#### Risk
Tiny — already public-adjacent (used in extension event types).

#### Status
proposed (not blocking — `pi-skill-search` works around with local types
and synthetic fixtures)
