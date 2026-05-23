---
name: using-vetc
description: VETC bootstrap — auto-detect and invoke VETC skills based on task context. Always active at session start.
---

# Using VETC Dev Kit

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 10% chance a VETC skill might apply to what you are doing, invoke it via Skill tool. VETC skills contain domain-specific patterns, PASS/FAIL code examples, and VETC conventions that prevent bugs.

IF A VETC SKILL APPLIES TO YOUR TASK, YOU MUST USE IT.
</EXTREMELY-IMPORTANT>

## Instruction Priority

1. **User's explicit instructions** (CLAUDE.md, AGENTS.md, direct requests) — highest
2. **VETC skills** — override default behavior where they conflict
3. **Default system prompt** — lowest

## How to Access VETC Skills

Use the `Skill` tool. When invoked, skill content loads directly — follow it.

## Skill Activation Guide

| User Intent | Skill to Invoke |
|-------------|----------------|
| New feature, any kind | `vetc-sdlc` (SDLC router) |
| Requirement unclear/mo ho | `vetc-deep-interview` |
| Quick spec from requirement | `vetc-spec-driven` |
| Co spec, can plan | `vetc-ralplan` or `vetc-plan` |
| Co approved plan, implement | `vetc-ralph` |
| Java/Spring Boot code | `vetc-java-patterns` |
| React/TypeScript code | `vetc-frontend-patterns` |
| Write tests | `vetc-tdd` |
| Review code | `vetc-review` |
| Security review | `vetc-security` |
| Debug bug/error | `vetc-systematic-debugging` |

## The Rule

**Invoke relevant VETC skills BEFORE any response or action.** Even 10% chance = invoke to check. If invoked skill doesn't apply, skip it.

## Decision Flow

```
User message → Check VETC skills? → Yes → Invoke Skill → Follow skill → Respond
                                → No → Respond normally
```

## Red Flags — Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "This is too simple to need a skill" | Simple things breed complex bugs. Check skills. |
| "I know what to do" | Skills evolve. Invoke current version. |
| "Let me just code first" | Skill check comes BEFORE action. |
| "The skill is overkill" | Prevention beats debugging. Use it. |
| "Just a quick question" | Questions are tasks. Check for skills. |
| "I remember this skill" | Skills get updated. Read current version. |
| "This doesn't count as a task" | Any action = task. Check for skills. |
| "I'll do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "The user didn't ask for a skill" | Skills activate PROACTIVELY based on context, not just on request. |

## Skill Priority

When multiple skills could apply:

1. **Process skills first** (sdlc, debugging, spec-driven, deep-interview) — determine HOW to approach
2. **Planning skills second** (ralplan, planner) — create the plan
3. **Implementation skills third** (java-patterns, frontend-patterns, tdd) — guide execution
4. **Verification skills last** (verify, security, review) — validate results

## SDLC Routing

Most tasks start with `vetc-sdlc` which routes to the correct path:

- **Path A** — Full BA Pipeline (co tai lieu BA)
- **Path B** — Quick Path (requirement ro, no BA doc)
- **Path C** — Consensus Planning (need clarify + plan review)

## User Instructions Override

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip skills. Skills guide the HOW.



