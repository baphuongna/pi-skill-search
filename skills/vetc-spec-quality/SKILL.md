---
name: vetc-spec-quality
description: PROACTIVELY activate sau khi tạo spec — validate spec quality như "Unit Tests for English". Kiểm tra Completeness, Clarity, Consistency, Measurability, Coverage. Dùng sau vetc-spec-driven hoặc vetc-deep-interview, trước vetc-planner.
---

# VETC Spec Quality — "Unit Tests for Requirements"

Checklists test **REQUIREMENTS QUALITY**, NOT implementation. Giống unit tests nhưng cho English text.

## When to Activate

- Sau khi `vetc-spec-driven` hoặc `vetc-deep-interview` tạo spec
- Trước khi `vetc-planner` tạo implementation plan
- Khi review spec từ BA/PO
- User nói: "check spec", "validate requirements", "spec quality"
- Trước `/vetc-ship` — spec quality gate

## Do NOT activate when

- Chưa có spec file → dùng `vetc-spec-driven` trước
- Đang implement code → dùng `vetc-verify` thay
- Chỉ cần syntax/formatting → manual review đủ

## Core Concept

```
WRONG:  "Verify button clicks work correctly"     ← tests implementation
RIGHT:  "Are click requirements defined?"          ← tests requirements quality

WRONG:  "Test API returns 200"                     ← tests code behavior
RIGHT:  "Is API success criteria specified?"       ← tests spec completeness
```

## 5 Quality Dimensions

| Dimension | What It Tests | Threshold |
|-----------|---------------|-----------|
| **Completeness** | Có thiếu thông tin quan trọng không? | ≥80% items addressed |
| **Clarity** | Có ambiguity hoặc vague language không? | No unresolved ambiguity |
| **Consistency** | Có mâu thuẫn giữa các sections không? | 0 contradictions |
| **Measurability** | Success criteria có measurable không? | All criteria measurable |
| **Coverage** | Mọi aspect của feature được cover chưa? | ≥80% traceability |

## Checklist Categories

### Category 1: Functional Completeness

```markdown
## CHK-101: Actor Identification
- [ ] Are ALL actors identified? [Spec §2]
- [ ] Is each actor's role clear? [Spec §2]
- [ ] Are actor permissions defined? [Spec §2]

## CHK-102: Happy Path Coverage
- [ ] Is the primary flow described step-by-step? [Spec §4]
- [ ] Does each step have a clear actor and action? [Spec §4]
- [ ] Are preconditions stated? [Spec §4]

## CHK-103: Edge Case Coverage
- [ ] Are error scenarios listed? [Spec §5]
- [ ] Is each edge case tied to a trigger + expected behavior? [Spec §5]
- [ ] Are timeout/retry scenarios covered? [Spec §5]

## CHK-104: Scope Boundaries
- [ ] Is in-scope explicitly listed? [Spec §2]
- [ ] Is out-of-scope explicitly listed? [Spec §2]
- [ ] Are non-goals stated? [Spec §2]
```

### Category 2: Clarity & Precision

```markdown
## CHK-201: Language Precision
- [ ] Are there vague words ("fast", "good", "simple", "easy")? [Spec §all]
- [ ] Are all terms defined or commonly understood? [Spec §all]
- [ ] Are ambiguous requirements marked [NEEDS CLARIFICATION]? [Spec §12]

## CHK-202: Measurable Success Criteria
- [ ] Are success criteria measurable (not subjective)? [Spec §6]
- [ ] Are criteria technology-agnostic? [Spec §6]
- [ ] Are criteria user-focused (not developer-focused)? [Spec §6]

## CHK-203: Acceptance Criteria Quality
- [ ] Are Gherkin scenarios complete (Given/When/Then)? [Spec §7]
- [ ] Does each scenario test ONE behavior? [Spec §7]
- [ ] Are negative scenarios included? [Spec §7]
```

### Category 3: Consistency

```markdown
## CHK-301: Internal Consistency
- [ ] Do edge cases align with happy path? [Spec §4 vs §5]
- [ ] Do acceptance criteria match user scenarios? [Spec §3 vs §7]
- [ ] Do data model hints match API contract sketch? [Spec §9 vs §10]

## CHK-302: VETC Domain Consistency
- [ ] Are VETC integrations correctly referenced? [Spec §10]
- [ ] Do business rules match VETC constraints? [Spec §5]
- [ ] Are sensitive data handling rules consistent? [Spec §5, §8]
```

### Category 4: Security & Compliance

```markdown
## CHK-401: Security Requirements
- [ ] Are authentication requirements stated? [Spec §2, §10]
- [ ] Are authorization rules defined per actor? [Spec §2]
- [ ] Is sensitive data identified and handling specified? [Spec §5, §9]
- [ ] Are PII fields listed with masking rules? [Spec §9]

## CHK-402: VETC-Specific Security
- [ ] Is OTP handling specified (if applicable)? [Spec §4, §5]
- [ ] Are amount limits defined? [Spec §5, §7]
- [ ] Are transaction idempotency requirements stated? [Spec §4]
- [ ] Is audit logging requirement stated? [Spec §14]
```
