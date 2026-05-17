---
name: trace
description: Evidence-driven tracing lane that orchestrates competing tracer hypotheses in Claude built-in team mode
---

# Trace Skill

Use this skill for ambiguous, causal, evidence-heavy questions where the goal is to explain **why** an observed result happened, not to jump directly into fixing or rewriting code.

This is the orchestration layer on top of the built-in `tracer` agent. The goal is to make tracing feel like a reusable OMC operating lane: restate the observation, generate competing explanations, gather evidence in parallel, rank the explanations, and propose the next probe that would collapse uncertainty fastest.

## Good entry cases

Use `/oh-my-claudecode:trace` when the problem is:

- ambiguous
- causal
- evidence-heavy
- best answered by exploring competing explanations in parallel

Examples:
- runtime bugs and regressions
- performance / latency / resource behavior
- architecture / premortem / postmortem analysis
- scientific or experimental result tracing
- config / routing / orchestration behavior explanation
- “given this output, trace back the likely causes”

## Core tracing contract

Always preserve these distinctions:

1. **Observation** -- what was actually observed
2. **Hypotheses** -- competing explanations
3. **Evidence For** -- what supports each explanation
4. **Evidence Against / Gaps** -- what contradicts it or is still missing
5. **Current Best Explanation** -- the leading explanation right now
6. **Critical Unknown** -- the missing fact keeping the top explanations apart
7. **Discriminating Probe** -- the highest-value next step to collapse uncertainty

Do **not** collapse into:
- a generic fix-it coding loop
- a generic debugger summary
- a raw dump of worker output
- fake certainty when evidence is incomplete

## Evidence strength hierarchy

Treat evidence as ranked, not flat.

From strongest to weakest:

1. **Controlled reproductions / direct experiments / uniquely discriminating artifacts**
2. **Primary source artifacts with tight provenance** (trace events, logs, metrics, benchmark outputs, configs, git history, file:line behavior)
3. **Multiple independent sources converging on the same explanation**
4. **Single-source code-path or behavioral inference**
5. **Weak circumstantial clues** (timing, naming, stack order, resemblance to prior bugs)
6. **Intuition / analogy / speculation**

Explicitly down-rank hypotheses that depend mostly on lower tiers when stronger contradictory evidence exists.

## Strong falsification / disconfirmation rules

Every serious `/trace` run must try to falsify its own favorite explanation.

For each top hypothesis:

- collect evidence **for** it
- collect evidence **against** it
- state what distinctive prediction it makes
- state what observation would be hard to reconcile with it
- identify the cheapest probe that would discriminate it from the next-best alternative

Down-rank a hypothesis when:

- direct evidence contradicts it

## Team-mode orchestration shape

Use **Claude built-in team mode** for `/trace`.

The lead should:

1. Restate the observed result or “why” question precisely
2. Extract the tracing target
3. Generate multiple deliberately different candidate hypotheses
4. Spawn **3 tracer lanes by default** in team mode
5. Assign one tracer worker per lane
6. Instruct each tracer worker to gather evidence **for** and **against** its lane
7. Run a **rebuttal round** between the leading hypothesis and the strongest remaining alternative
8. Detect whether the top lanes genuinely differ or actually converge on the same root cause
9. Merge findings into a ranked synthesis with an explicit critical unknown and discriminating probe

Important: workers should pursue deliberately different explanations, not the same explanation in parallel.

## Default hypothesis lanes for v1

Unless the prompt strongly suggests a better partition, use these 3 default lanes:

1. **Code-path / implementation cause**
2. **Config / environment / orchestration cause**
3. **Measurement / artifact / assumption mismatch cause** — covers verification-method defects, not just system defects. Examples: the verification query reuses a single dimensional key across distinct entities, tenants, streams, or groups; the comparison filter shape does not match the schema grain; or the catalog or column name was assumed portable across runtimes without enumeration. This includes multi-entity premise/key-assumption mismatches.

For lane 3, cross-entity discrepancies need a premise audit before escalation: enumerate entity dimensions and check whether a zero-row or mismatch result came from applying one key across multiple entities rather than from a system defect; the result may be a verification-methodology defect.

These defaults are intentionally broad so the first slice works across bug, performance, architecture, and experiment tracing.

## Mandatory cross-check lenses

After the initial evidence pass, pressure-test the leaders with these lenses when relevant:

- **Systems lens** -- queues, retries, backpressure, feedback loops, upstream/downstream dependencies, boundary failures, coordination effects
- **Premortem lens** -- assume the current best explanation is incomplete or wrong; what failure mode would embarrass the trace later?
- **Science lens** -- controls, confounders, measurement bias, alternative variables, falsifiable predictions

These lenses are not filler. Use them when they can surface a missed explanation, hidden dependency, or weak inference.


<!-- condensed from source -->

