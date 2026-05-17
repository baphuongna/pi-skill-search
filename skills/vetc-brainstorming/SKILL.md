---
name: vetc-brainstorming
description: PROACTIVELY activate khi user cần khám phá ý tưởng trước khi spec — open-ended exploration, trade-off analysis, viable options, không phải clarification. Pre-spec phase. Dùng TRƯỚC vetc-spec-driven hoặc vetc-deep-interview.
---

# VETC Brainstorming — Pre-Spec Exploration

Khám phá không gian giải pháp trước khi commit vào spec. Generate options, explore trade-offs, find hidden opportunities. Inspired by superpowers `brainstorming` skill.

## When to Activate

- User muốn "explore ý tưởng", "cho tôi vài options", "có cách khác không?"
- Problem chưa đủ định hình để spec — cần explore solution space
- Trade-off analysis giữa nhiều approaches khả thi
- Pre-feasibility: "có khả thi không?", "ballpark effort?"
- Stakeholder hỏi "nên làm gì tiếp theo?" (roadmap decision)
- Trước cả `vetc-deep-interview` khi requirement chưa form

## Do NOT Activate When

- User đã có requirement rõ → dùng `vetc-spec-driven` hoặc `vetc-deep-interview`
- Đang trong implementation phase → skill này làm mất focus
- Chỉ cần 1 answer cụ thể → trả lời trực tiếp, không brainstorm
- Bug fix / debugging → dùng `vetc-systematic-debugging`
- Review feedback đã rõ → dùng `vetc-receiving-review`

## Core Pattern: Divergent → Convergent

```
[Problem statement]
       ↓
DIVERGENT (expand)
  - Generate 5-8 options (fair, not straw-man)
  - Consider: dùng existing, build new, buy, hybrid, punt
  - Include unusual options (AI-assist, low-tech fallback, manual)
       ↓
ANALYZE (understand)
  - Each option: effort, risk, strategic fit, user impact
  - Surface hidden tradeoffs
  - Find unasked questions
       ↓

## Workflow

### Step 1 — Frame the Problem

Không hỏi requirement — hỏi motivation (from GSD Dream Extraction):

- "Điều gì thúc đẩy câu hỏi này?" (motivation)
- "Thành công trông như thế nào?" (outcome)
- "Cái gì đang block user hiện tại?" (pain)

Output: 1 paragraph problem statement.

### Step 2 — Divergent Thinking (Generate Options)

Aim for **5-8 options**. Types to cover:

| Option Type | Example |
|-------------|---------|
| **Do nothing** | Keep status quo, measure actual pain |
| **Existing tool** | Use Spring Actuator for health check instead of custom |
| **Build minimal** | MVP version covering 60% cases |
| **Build full** | Complete version covering 95% cases |
| **Buy / Integrate** | Third-party OTP service (Twilio) vs self-hosted |
| **Hybrid** | Self-host core, third-party for edge cases |
| **AI-assisted** | Let LLM handle classification/routing |
| **Defer / Punt** | Wait for v2, ship without this |
| **Simplify requirement** | Challenge: do we really need X, or can we drop it? |

### Step 3 — Analyze Each Option

Per option, surface:

| Dimension | Questions |
|-----------|-----------|
| **Effort** | Dev hours? Testing hours? Migration cost? |
| **Risk** | What could go wrong? Probability × Impact |
| **User impact** | Does user notice? Is change positive? |
| **Strategic fit** | Align with VETC Ewallet vision? Fintech compliance? |
| **Reversibility** | Can we back out? Cost of reversal? |
| **Dependencies** | Blocks on other teams? External systems? |
| **Hidden cost** | Operational overhead? Support burden? Training? |

Output matrix:

### Step 4 — Convergent Thinking (Narrow Down)

Apply **VETC-DR** (Drivers + Recommendation):

**Drivers (top 3)** - what matters most for THIS decision:
1. {Driver 1, e.g. compliance deadline}
2. {Driver 2, e.g. engineering bandwidth}
3. {Driver 3, e.g. user experience quality}

**Recommend top 2-3** options with explicit rationale:

```markdown
## Recommended: Twilio Integration

**Why**: Addresses compliance deadline (Driver 1), minimal eng bandwidth (Driver 2), faster OTP delivery improves UX (Driver 3).

**Trade-offs acknowledged**:
- Vendor lock-in (mitigated: abstract through OtpProvider interface)
- Monthly cost ~$500/month (acceptable within ops budget)

## Runner-up: Hybrid

**Why**: Better long-term architecture, graceful degradation.
**Why not top choice**: Effort XL exceeds compliance deadline. Can retrofit later.

## Explicitly Rejected: Self-hosted OTP

**Why rejected**: Effort L + new infra risk + distraction from core features. LOW strategic fit.
```

<!-- condensed from source -->

