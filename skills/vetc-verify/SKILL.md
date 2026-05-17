---
name: vetc-verify
description: PROACTIVELY verify feature hoàn thành — build, test, coverage, security, API contract. Dùng sau vetc-ralph hoặc sau khi implement xong, trước khi ship.
---

# VETC Verify — End-to-End Verification

Verify toàn diện sau khi implement. Không edit code — chỉ report pass/fail.



## When to Activate

- Sau khi implement xong (manual hoặc vetc-ralph)
- Trước khi mở PR hoặc merge
- Sau deslop pass, cần final check
- User nói: "verify", "kiểm tra", "chạy full check"

## Do NOT Activate When

- Đang implement code (chưa đến phase verify) → dùng implementation skills
- Build đang fail → fix build trước với `vetc-build-resolver`
- Chỉ cần code review, không cần full verification pipeline → dùng `vetc-review`
- Đang debug lỗi cụ thể → dùng `vetc-systematic-debugging`

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "The build was fine yesterday" | Yesterday is not now. Run it again. |
| "I only changed a comment, no need to verify" | Verify is cheap. Regressions are expensive. |
| "Coverage is probably still above 80%" | "Probably" is not evidence. Run the coverage report. |
| "The CI will catch it" | CI catches it AFTER merge. You catch it BEFORE. |
| "I ran the tests locally already" | Were they ALL the tests? Was it a clean build? |
| "Security scan takes too long" | A vulnerability in production takes longer. |
| "The API contract hasn't changed" | Prove it. Compare the actual response with the spec. |

## Common Verification Failures

| Failure Pattern | Root Cause | Prevention |
|----------------|------------|------------|
| Tests pass locally, fail in CI | Dirty build, missing `mvn clean` | Always verify with clean build |
| Coverage drops silently | New code without tests | Check coverage after every change |
| Security scan finds what you missed | You didn't scan yourself | Run security quick scan before PR |
| API contract drift | Spec not updated with code changes | Compare actual response with spec |
| Debug statements left in code | Forgot to clean up | Gate 6 catches these |

## Verification Pipeline

### Gate 0 — Cross-Artifact Consistency (Optional)

Chỉ chạy khi có spec files trong `specs/{NNN}-{slug}/`. READ-ONLY analysis — không edit.

**6 Detection Passes:**

| Pass | What It Detects | Severity Range |
|------|-----------------|----------------|
| Duplication | Same requirement stated in multiple places | MEDIUM |
| Ambiguity | Vague or unclear requirements | HIGH |
| Underspecification | Missing details, incomplete requirements | HIGH |
| Principle Alignment | Violations of core principles (security-first, spec-first) | CRITICAL |
| Coverage Gaps | Requirements without tasks, tasks without requirements | CRITICAL |
| Inconsistency | Contradictions between spec, plan, tasks | CRITICAL |


## Artifact Consistency
| Pass | Findings | Max Severity |
|------|----------|--------------|
| Duplication | 0 | — |
| Ambiguity | 1 | HIGH |
| Underspecification | 2 | HIGH |
| Principle Alignment | 0 | — |
| Coverage Gaps | 1 | CRITICAL |
| Inconsistency | 0 | — |
| **Total** | **4** | **CRITICAL** |
```

### Gate 1 — Build

```bash
# Backend
mvn clean compile -q

# Frontend
npm run build
```

**Result**: PASS (0 errors) / FAIL (list errors)

### Gate 2 — Tests

```bash
# Backend — targeted
mvn test -Dtest=XxxServiceImplTest -q

# Backend — full module
mvn test -pl <module> -q

# Frontend

