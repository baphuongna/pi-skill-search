---
name: vetc-pr-response
description: PROACTIVELY activate khi nhận review comments trên PR — classify từng comment (fix/defer/reject), craft response thoughtfully, không agree mù quáng. Pair với vetc-receiving-review cho quy trình nhận phê bình.
---

# VETC PR Response — Thoughtful Review Handling

Khi reviewer để lại comments trên PR, không rush fix-all. Classify từng comment trước: fix ngay, defer sang issue mới, hay respectfully reject với lý do.

## When to Activate

- PR có review comments cần process
- Multiple reviewers disagree — cần cân nhắc
- Reviewer blocking PR — cần hoặc fix hoặc justify
- Long review thread — cần sắp xếp + respond có cấu trúc
- After `vetc-receiving-review` — áp dụng nguyên tắc vào thực hành

## Do NOT Activate When

- No comments yet — không có gì để respond
- Single typo fix comment — just fix and push
- Self-review comments — rewrite before requesting review

## Classification Matrix

Mỗi comment classify thành 1 trong 5 loại:

| Loại | Khi nào | Action | Response Template |
|------|---------|--------|-------------------|
| **FIX-NOW** | Correct, critical, in scope | Fix in this PR | "Good catch, fixed in {commit-sha}" |
| **FIX-IN-FOLLOWUP** | Correct but scope-creep | Log issue, fix later | "Valid — created VETC-999 for follow-up" |
| **DEFER** | Valid but low priority | Add to tech-debt | "Noted — added to tech-debt/issues/TD-42" |
| **DISCUSS** | Unclear intent, ambiguous | Ask back | "Can you elaborate on {specific part}? I want to ensure I understand before changing." |
| **REJECT** | Disagree with evidence | Politely push back | "I disagree because {data/pattern/evidence}. Happy to discuss further." |

## Core Principles

### 1. Never Agree Blindly

If comment is unclear → ask. If you disagree → push back respectfully. Agreeing just to close PR = bad engineering. Code should be right, not popular.

### 2. Separate Signal from Noise

- **Nitpicks** (formatting, naming preference) → evaluate: does it improve readability?
- **Style** (subjective) → defer to team style guide; if unwritten, ask for vote
- **Correctness** (bug, edge case, security) → always address
- **Architecture** (major refactor suggestion) → usually FIX-IN-FOLLOWUP, not this PR

### 3. Scope Discipline

This PR = this feature. Drive-by refactor suggestions → separate PR. Politely decline:

> "Agreed this could be improved — but it's out of scope for VETC-123 (Smart OTP).
>  I've created VETC-999 to track the refactor. Can we keep this PR focused?"

### 4. Evidence Over Authority

When reviewer says "just do X" without reasoning, ask why. Senior title ≠ automatic correctness.

> "Can you share the pattern/doc this is based on? I implemented based on {reference}
>  and want to make sure we're aligned on the reasoning."

### 5. Batch Small Fixes

Don't push 20 commits each addressing 1 nit. Batch into 1-2 commits:
- `fix(review): address nits in WalletController`
- `refactor(review): rename per feedback`

## Workflow

### Step 1 — Read ALL Comments First

Before replying to any, read entire review thread. Understand big picture — maybe comments conflict, or reviewer has overarching concern.

### Step 2 — Classify Each Comment

Create local checklist (not committed):

```markdown
# PR #123 Review Triage

## Reviewer: @alice (2026-04-17)

### Comment 1: Line 45 - "Extract this to private method"
Classification: FIX-NOW
Reason: Method is 30 lines, extraction improves readability

### Comment 2: Line 78 - "Why not use Stream.reduce?"
Classification: REJECT
Reason: Stream.reduce on 1M elements = slower than for-loop (benchmarked)
Response: "Good question — I benchmarked both. For-loop is 3x faster at our scale.
           Saved benchmark results in `bench/loop-vs-reduce.md`"

### Comment 3: Line 120 - "Consider caching this"
Classification: FIX-IN-FOLLOWUP
Reason: Valid perf improvement but requires Redis setup config change
Response: "Great idea — out of scope for this PR. Created VETC-999."

### Comment 4: Line 200 - "Missing null check"
Classification: FIX-NOW
Reason: Real bug, caught before production

### Comment 5: "General: prefer functional style"
Classification: DISCUSS
Response: "Can you point to specific lines? Happy to refactor toward the team's style."
```

