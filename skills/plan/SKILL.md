---
name: plan
description: Strategic planning with optional interview workflow
---

- User wants autonomous end-to-end execution -- use `autopilot` instead
- User wants to start coding immediately with a clear task -- use `ralph` or delegate to executor
- User asks a simple question that can be answered directly -- just answer it
- Task is a single focused fix with obvious scope -- use an execution skill instead of running it from this planning module

Jumping into code without understanding requirements leads to rework, scope creep, and missed edge cases. Plan provides structured requirements gathering, expert analysis, and quality-gated plans so that execution starts from a solid foundation. The consensus mode adds multi-perspective validation for high-stakes projects.

- Auto-detect interview vs direct mode based on request specificity
- Ask one question at a time during interviews -- never batch multiple questions
- Gather codebase facts via `explore` agent before asking the user about them
- Plans must meet quality standards: 80%+ claims cite file/line, 90%+ criteria are testable
- Consensus mode runs fully automated by default; add `--interactive` to enable user prompts at draft review and final approval steps
- Consensus mode uses RALPLAN-DR short mode by default; switch to deliberate mode with `--deliberate` or when the request explicitly signals high risk (auth/security, data migration, destructive/irreversible changes, production incident, compliance/PII, public API breakage)
- **Planning/execution boundary:** planning modes inspect context and produce plans/specs/proposals only. They MUST mark artifacts as `pending approval` unless the user has explicitly opted into execution in the current turn or via the structured approval UI. Before explicit execution approval, planning modes MUST NOT run mutation-oriented shell commands, edit source files, commit, push, open PRs, invoke execution skills, or delegate implementation tasks.

### Mode Selection

| Mode | Trigger | Behavior |
|------|---------|----------|
| Interview | Default for broad requests | Interactive requirements gathering |
| Direct | `--direct`, or detailed request | Skip interview, generate plan directly |
| Consensus | `--consensus`, "ralplan" | Planner -> Architect -> Critic loop until agreement with RALPLAN-DR structured deliberation (short by default, `--deliberate` for high-risk); add `--interactive` for user prompts at draft and approval steps |
| Review | `--review`, "review this plan" | Critic evaluation of existing plan |

### Interview Mode (broad/vague requests)

1. **Classify the request**: Broad (vague verbs, no specific files, touches 3+ areas) triggers interview mode
2. **Ask one focused question** using `AskUserQuestion` for preferences, scope, and constraints
3. **Gather codebase facts first**: Before asking "what patterns does your code use?", spawn an `explore` agent to find out, then ask informed follow-up questions
4. **Build on answers**: Each question builds on the previous answer
5. **Consult Analyst** (Opus) for hidden requirements, edge cases, and risks
6. **Create plan** when the user signals readiness: "create the plan", "I'm ready", "make it a work plan"

### Direct Mode (detailed requests)

1. **Quick Analysis**: Optional brief Analyst consultation
2. **Create plan**: Generate comprehensive work plan immediately
3. **Review** (optional): Critic review if requested

### Consensus Mode (`--consensus` / "ralplan")

**RALPLAN-DR modes**: **Short** (default, bounded structure) and **Deliberate** (for `--deliberate` or explicit high-risk requests). Both modes keep the same Planner -> Architect -> Critic sequence and the same `AskUserQuestion` gates.

**Provider overrides (supported when the provider CLI is installed):**
- `--architect codex` — replace the Claude Architect pass with `omc ask codex --agent-prompt architect "..."` for implementation-heavy architecture review
- `--critic codex` — replace the Claude Critic pass with `omc ask codex --agent-prompt critic "..."` for an external review pass before execution
- If the requested provider is unavailable, briefly note that and continue with the default Claude Architect/Critic step for that stage

**State lifecycle**: The persistent-mode stop hook uses `ralplan-state.json` to enforce continuation during the consensus loop. The skill **MUST** manage this state:
- **On entry**: Call `state_write(mode="ralplan", active=true, session_id=<current_session_id>)` before step 1
- **On handoff to execution** (approval → ralph/team): Call `state_write(mode="ralplan", active=false, session_id=<current_session_id>)`. Do NOT use `state_clear` here — `state_clear` writes a 30-second cancel signal that disables stop-hook enforcement for ALL modes, leaving the newly launched execution mode unprotected.
- **On true terminal exit** (rejection, non-interactive plan output, error/abort): Call `state_clear(mode="ralplan", session_id=<current_session_id>)` — no execution mode follows, so the cancel signal window is harmless.
- Do NOT clear during intermediate steps like Critic approval or max-iteration presentation, as the user may still select "Request changes".

Without cleanup, the stop hook blocks all subsequent stops with `[RALPLAN - CONSENSUS PLANNING]` reinforcement messages even after the consensus workflow has finished. Always pass `session_id` to avoid clearing other concurrent sessions' state.

1. **Planner** creates initial plan and a compact **RALPLAN-DR summary** before any Architect review. The summary **MUST** include:
   - **Principles** (3-5)
   - **Decision Drivers** (top 3)

