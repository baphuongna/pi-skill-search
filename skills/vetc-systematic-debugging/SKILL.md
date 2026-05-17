---
name: vetc-systematic-debugging
description: PROACTIVELY activate khi gặp bug, runtime error, build failure, hoặc unexpected behavior. 4-phase root cause analysis — KHÔNG fix trước khi có root cause. "3+ fixes failed = architectural problem."
---

# VETC Systematic Debugging — 4-Phase Root Cause Analysis

Debug có hệ thống. Không guess-and-check. Tìm root cause TRƯỚC khi fix.



## When to Activate

- Runtime error, exception, stack trace
- Build failure (compile, test, package)
- Unexpected behavior (wrong data, wrong response, wrong state)
- Performance degradation
- User reports: "không work", "lỗi", "sai data"
- Sau khi `vetc-build-resolver` diagnose nhưng cần deeper analysis

## Do NOT Activate When

- Build error đơn giản (missing import, syntax error) → dùng `vetc-build-resolver`
- Bug đã biết root cause, chỉ cần fix → implement trực tiếp
- Lỗi chỉ cần đọc error message là hiểu → không cần 4-phase process
- Task không liên quan debugging (implementation, refactoring, review)

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "I know what the bug is, let me just fix it" | You think you know. Prove it with evidence. |
| "Let me try this fix and see if it works" | That's guessing, not debugging. Investigate first. |
| "The error message tells me everything" | Error messages describe symptoms, not root causes. |
| "I'll add a try-catch to handle it" | Hiding the error ≠ fixing the error. |
| "It works on my machine" | Then something in the environment differs. Find what. |
| "This is probably a timing issue" | "Probably" is not a root cause. Reproduce it reliably. |
| "Let me restart the service" | Restarting masks the symptom. The bug will return. |
| "The tests are flaky, ignore them" | Flaky tests reveal real race conditions. Fix them. |

## Phase 1: Root Cause Investigation

**Goal:** Understand WHAT happened and WHERE.

### Step 1.1 — Reproduce

- Reproduce the error reliably (not "sometimes")
- Note exact steps to trigger
- Check: does it reproduce in dev? staging? only prod?

```bash
# Reproduce backend error
mvn test -Dtest=XxxServiceImplTest#testSpecificCase -q

# Reproduce frontend error
npm test -- --testPathPattern=XxxComponent

# Check recent changes
git log --oneline -20
git diff HEAD~5 --stat
```

### Step 1.2 — Read the Error

- Full stack trace, not just first line
- Error message → error code → HTTP status
- Which layer threw it? (Controller / Service / Repository / External)

```
Error: NullPointerException
  at WalletServiceImpl.transfer(WalletServiceImpl.java:145)  ← HERE
  at WalletController.handleTransfer(WalletController.java:67)
  at sun.reflect.NativeMethodAccessorImpl.invoke0(Native)
```

