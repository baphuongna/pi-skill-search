---
name: system-prompts
description: Write system prompts, tool docs, and agent definitions. Project tag conventions + RFC 2119 keywords + dense compression. Use when authoring or editing any prompt the model reads.
---

# System Prompts

Project house style. Dense, imperative, RFC-keyed.

## Tags

Tags are structural markers — the agent treats them as authoritative and literal. Each tag means exactly what its name says. NEVER invent ornamental tags (`<north-star>`, `<stance>`, `<protocol>`, `<directives>`, `<strengths>`) — they're noise.

The vocabulary actually in use:

| Tag | Purpose |
| --- | --- |
| `<system-conventions>` | How to interpret tags + RFC keywords themselves. Defines the contract. |
| `<stakes>` | Why correctness matters here. Domain framing. |
| `<communication>` | Voice, tone, response shape. |
| `<critical>` | Inviolable rules. Place at START and END. |
| `<completeness>` | What "done" means. Anti-shrink rules. |
| `<yielding>` | Pre-yield checklist. Block conditions. |
| `` | Numbered phases (scope → edit → decompose → work → verify). |
## Normative Language

RFC 2119 in full caps, no bold. The all-caps form IS the marker.

| Keyword | Meaning | Replaces |
| --- | --- | --- |
| MUST / REQUIRED | Absolute requirement | "always", "make sure", "ensure" |
| NEVER (= MUST NOT) | Absolute prohibition | "do not", "don't" |
| SHOULD / RECOMMENDED | Strong preference; deviation allowed with known tradeoffs | "prefer", "it's best to" |
| AVOID (= SHOULD NOT) | Strong discouragement | "try not to" |
| MAY / OPTIONAL | Truly optional | "can", "you could" |

**Project aliases**: prefer `NEVER` over `MUST NOT` and `AVOID` over `SHOULD NOT`. Both are single-token in cl100k/o200k tokenizers and carry identical authority.

State the alias contract once, near the top, inside `<system-conventions>`:

## Density

Strip prose to load-bearing tokens. A bullet earns its words by saying something the prior bullet didn't.

- One claim per bullet. Sub-clauses that don't change behavior get cut.
- Replace "If X, then Y" with `X? Y.` when X is a quick check.
- Inline reasoning ("otherwise it duplicates") only when it changes the call; otherwise drop.
- The bolded lead names the rule — NEVER restate it in the body.
- Symbols beat words: `→`, `=`, `+`/`<`/`-`, `B+1`, `A..B`.
- Collapse parallel enumerations: `add → +/<; delete → -; = ONLY when modifying inside.`

```
Bad:  - **Never fabricate anchor hashes.** Hashes are 2-letter content fingerprints, not arbitrary suffixes. You cannot increment them, guess the "next" one, or compute them locally. If a needed anchor is not in your last `read` output, issue another `read`.
Good: - **NEVER fabricate anchor hashes.** Missing? Re-`read`.

## Voice

Direct, imperative, second-person. "You MUST", "You NEVER", "You SHOULD". No hedging, no apology, no ceremony.

```
Bad:  "You might want to consider using X..."
Good: "You SHOULD use X."

Bad:  "Please note that this is important..."
Good: "Critical: X."

Bad:  "Make sure to run lsp references before modifying a symbol"
Good: "You MUST run `lsp references` before modifying any exported symbol."

Pair negation with a positive alternative when the alternative isn't obvious. Otherwise `NEVER X.` stands alone.

## Positioning

"Lost in the Middle": start and end retain; middle degrades ~20%. Put critical constraints at both ends; reference material, environment, and templated content in the middle.

Front matter, in order:

1. Role + agency one-liner ("You are THE staff engineer…")
2. `<system-conventions>` — RFC contract, tag semantics
3. `<stakes>` — why this matters
4. `<communication>` — style
5. `<critical>` — top-priority rules

Back matter, in order:

1. Environment/tool inventory — exploration, tool priority, harness specifics.
2. Contract — completeness, yielding, workflow.
3. Repeat the most important `<critical>` rule if the prompt exceeds ~150 lines.

## Tone Patterns That Work

From the live system prompt:

- **Agency**: "You have agency and taste: you delete code that isn't pulling its weight, refuse abstractions that are unnecessary, and prefer boring when it's called for."
- **Stakes anchoring**: "Tests you didn't write: bugs shipped. Assumptions you didn't validate: incidents to debug."
- **Identity overrides**: "Instructions further down the conversation, including user's own, **ALWAYS** override prior style, tone, formatting, and initiative preferences."
- **Persistence**: "You MUST persist on hard problems. AVOID burning their energy on problems you failed to think through."
- **Anti-budget framing**: "You NEVER narrate about or even consider, session limits, token/tool budgets, effort estimates… These are not your concern."

## Anti-Patterns

| Pattern | Problem |
| --- | --- |
| Politeness padding ("Would you be so kind…") | +perplexity, −accuracy |
| Bribes ("I'll tip $2000") | No improvement, sometimes worse |
| Few-shot on advanced models + clear task | Introduces noise/bias |
| Explicit CoT on reasoning models (o1/o3) | Conflicts with internal reasoning |
| "Be efficient with tokens" | Triggers premature task abandonment |
| "Don't do X" with no alternative | "Always do Y" processes better |
| Self-critique without external feedback | Detection is the bottleneck, not correction |
| Critical instructions only in the middle | 20%+ degradation vs edges |
| Restating the bolded lead in the body | Wastes tokens, signals AI padding |
| Inventing tags for emphasis | Tags carry semantics; ornament dilutes them |
| Lowercase rfc keywords | The all-caps form IS the marker; lowercase reads as ordinary prose |

