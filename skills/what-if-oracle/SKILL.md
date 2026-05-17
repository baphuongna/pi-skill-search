---
name: what-if-oracle
description: Run structured What-If scenario analysis with multi-branch possibility exploration. Use this skill when the user asks speculative questions like "what if...", "what would happen if...", "what are the possibilities", "explore scenarios", "scenario analysis", "possibility space", "what could go wrong", "best case / worst case", "risk analysis", "contingency planning", "strategic options", or any question about uncertain futures. Also trigger when the user faces a fork-in-the-road decision, wants to stress-test an idea, or needs to think through consequences before committing.
---

# What-If Oracle — Possibility Space Explorer

A structured system for exploring uncertain futures through rigorous multi-branch scenario analysis. Instead of one prediction, the Oracle maps the full **possibility space** — branching timelines where each path has its own logic, probability, and consequences.

Based on the What-If Statement paradigm: the idea that speculative questions ("What if X?") are not idle daydreaming but a **fundamental computing operation** — the mind's way of simulating futures before committing resources to one.

Published research: [The What-If Statement (DOI: 10.5281/zenodo.18736841)](https://doi.org/10.5281/zenodo.18736841) | [IDNA Consolidation v2 (DOI: 10.5281/zenodo.18807387)](https://doi.org/10.5281/zenodo.18807387)

## Core Principle: 0·IF·1

Every scenario analysis has three elements:

- **0** — The unexpressed state (what hasn't happened yet, the potential)
- **1** — The expressed state (what IS, the current reality)
- **IF** — The conditional bond (the decision, event, or change that transforms 0 into 1)

The quality of the analysis depends on the precision of the IF. A vague "what if things go wrong?" produces vague results. A precise "what if our primary supplier raises prices 30% in Q3?" produces actionable intelligence.

## How to Run the Oracle

### Phase 1 — Frame the Question

Take the user's What-If question and sharpen it:

**Decompose into components:**

- **The Variable:** What specific thing changes? (one variable per analysis)
- **The Magnitude:** By how much? (quantify if possible)
- **The Timeframe:** Over what period?
- **The Context:** What's the current state before the change?

**If the question is vague, sharpen it:**

- "What if AI takes over?" → "What if 40% of current knowledge-work tasks are automated by AI within 3 years in [specific industry]?"
- "What if we fail?" → "What if monthly revenue stays below $5K for 6 consecutive months starting now?"

Present the sharpened question to the user for confirmation before proceeding.

### Phase 2 — Map the Possibility Space

Generate **4-6 scenario branches** using this framework:

| Branch             | Definition                                                                   | Purpose                                            |
| ------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| **Ω Best Case**    | Everything goes right. Key assumptions all validate. Lucky breaks occur.     | Define the ceiling — what's the maximum upside?    |
| **α Likely Case**  | Most probable path given current evidence. No major surprises.               | Anchor expectations in reality                     |
| **Δ Worst Case**   | Key assumptions fail. Two things go wrong simultaneously.                    | Define the floor — what's the maximum downside?    |
| **Ψ Wild Card**    | An unexpected variable enters that nobody is tracking. Black swan territory. | Stress-test for the unimaginable                   |
| **Φ Contrarian**   | The opposite of the consensus view turns out to be true.                     | Challenge groupthink and reveal hidden assumptions |
| **∞ Second Order** | The first-order effects trigger cascading consequences nobody predicted.     | Map the ripple effects                             |

### Phase 3 — Analyze Each Branch

For each scenario branch, provide:

```
╔══════════════════════════════════════════════╗
║  BRANCH: [Ω/α/Δ/Ψ/Φ/∞] — [Branch Name]    ║
╠══════════════════════════════════════════════╣
║  Probability: [X%]                           ║
║  Timeframe: [When this could materialize]    ║
║  Confidence: [HIGH/MEDIUM/LOW]               ║
╠══════════════════════════════════════════════╣
║  NARRATIVE:                                  ║
║  [2-3 sentences describing how this          ║
║   scenario unfolds step by step]             ║

### Phase 4 — Synthesis

After analyzing all branches, provide:

**Probability Distribution:**

```
Ω Best Case ····· [██████░░░░] 15%
α Likely Case ··· [████████░░] 45%
Δ Worst Case ···· [██████░░░░] 20%
Ψ Wild Card ····· [███░░░░░░░]  8%
Φ Contrarian ···· [████░░░░░░]  7%
∞ Second Order ·· [███░░░░░░░]  5%
