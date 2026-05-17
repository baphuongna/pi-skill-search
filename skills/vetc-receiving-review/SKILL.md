---
name: vetc-receiving-review
description: PROACTIVELY activate khi nhận code review feedback từ human reviewer, sau khi vetc-java-reviewer hoặc vetc-typescript-reviewer report findings, hoặc khi cần process review comments. Hướng dẫn cách nhận review đúng — không đồng ý mù quáng.
---

# VETC Receiving Code Review — How to Handle Feedback Correctly

Nhận code review đúng cách. Không đồng ý performative. Verify trước khi implement. Push back khi cần.

## When to Activate

- Nhận review feedback từ human (PR comments, direct feedback)
- Sau khi `vetc-java-reviewer` hoặc `vetc-typescript-reviewer` report findings
- Sau khi `vetc-security-reviewer` report security issues
- User nói: "review xong rồi", "fix theo feedback", "xử lý review comments"

## Do NOT Activate When

- Đang viết code mới (không phải xử lý feedback) → dùng skill phù hợp
- Review feedback chỉ là style/formatting nhỏ → fix trực tiếp
- Chưa có review findings nào → chưa cần skill này
- Đang làm code review cho người khác → dùng `vetc-review` command

## Forbidden Responses

These responses indicate you are NOT properly processing feedback:

| Forbidden Response | Why It's Forbidden |
|-------------------|-------------------|
| "You're absolutely right!" | Performative agreement without understanding |
| "Good catch! Fixed." | Did you actually verify the fix addresses the root issue? |
| "Makes sense, changed." | "Makes sense" ≠ "I verified this is correct" |
| "Done!" without explanation | What did you change? Why? Does it work? |
| Implementing every suggestion blindly | Not all suggestions are correct or necessary |
| "I'll add that feature too" | Scope creep. Address the review, don't expand it. |

## Review Processing Workflow

### Step 1: Classify Each Finding

From reviewer output, classify each finding:

| Category | Action | Examples |
|----------|--------|---------|
| **Bug/Defect** | Fix immediately | Logic error, wrong condition, missing null check |
| **Security Issue** | Fix immediately, highest priority | SQL injection, sensitive data in log, missing auth check |
| **Design Problem** | Discuss before fixing | Wrong abstraction, missing error handling pattern |
| **Style/Naming** | Fix if trivial, discuss if contentious | Variable naming, method naming |
| **Suggestion** | Evaluate with YAGNI check | "What if we add...", "Could also handle..." |
| **Question** | Answer with evidence | "Why this approach?" — show alternatives considered |

### Step 2: YAGNI Check

For each suggestion, ask:

```
Does this suggestion:
1. Fix a REAL problem that exists NOW?     → Implement
2. Prevent a LIKELY problem?               → Consider
3. Handle a HYPOTHETICAL future scenario?   → Skip (YAGNI)
4. Add complexity without clear benefit?    → Push back
```

### Step 3: Verify Before Implementing

Before implementing any feedback:

1. **Read the finding carefully** — understand the reviewer's reasoning
2. **Check the code** — is the reviewer's observation accurate?
3. **Consider alternatives** — is the suggested fix the best approach?
4. **Check for ripple effects** — will this fix break something else?

### Step 4: Implement or Push Back

#### When to Implement

- Finding is factually correct
- The fix is straightforward
- No design tradeoffs involved

Format your response:
```markdown
**Finding:** {quote the finding}
**Analysis:** {why it's correct}
**Fix:** {what you changed}
**Verification:** {test that confirms the fix}
```

## Source-Specific Handling

### Human Reviewer Feedback

- Prioritize: Critical bugs > Security > Design > Style > Suggestions
- Ask clarifying questions if the feedback is ambiguous
- Don't assume the reviewer knows the full context — explain your reasoning

### VETC Reviewer Agent Output

Agent reviewers (`vetc-java-reviewer`, `vetc-typescript-reviewer`, `vetc-security-reviewer`) produce structured findings:

```markdown
## Finding: [CRITICAL|HIGH|MEDIUM|LOW] {title}
**File:** {path}:{line}
**Issue:** {description}
**Suggestion:** {how to fix}
```

<!-- condensed from source -->

