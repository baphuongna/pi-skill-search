---
name: vetc-change-proposal
description: PROACTIVELY activate khi spec đã APPROVED nhưng cần thay đổi — compliance update, new edge case, scope adjustment. Tạo delta spec (OpenSpec-style) thay vì sửa trực tiếp. Lifecycle DRAFT → PROPOSED → APPROVED → APPLIED → ARCHIVED.
---

# VETC Change Proposal — OpenSpec-Style Delta Management

Quản lý spec changes có cấu trúc. Spec đã APPROVED KHÔNG được sửa trực tiếp — tạo change proposal với impact analysis, review, và archive.

## When to Activate

- Spec status = APPROVED hoặc IMPLEMENTING, cần thay đổi
- User: "sửa spec", "thêm requirement", "loại requirement X"
- Compliance update (SBV, NHNN, internal policy)
- New edge case discovered during implementation
- External system contract changed (Bank GW update, ACS API v2)
- Feature scope adjustment mid-development

## Do NOT Activate When

- Spec ở DRAFT status → sửa spec trực tiếp
- Bug fix không thay đổi requirements → không cần change proposal
- Typo / formatting fix → sửa trực tiếp
- Implementation detail clarification (không thay behavior) → sửa plan.md, không cần change proposal

## Core Pattern: Delta Spec Lifecycle

```
[Spec APPROVED]
       ↓
  CREATE PROPOSAL (DRAFT)
       ↓
  IMPACT ANALYSIS
       ↓
  REVIEW (architect + critic)
       ↓
  [PROPOSAL APPROVED]
       ↓
  IMPLEMENT CHANGES (vetc-ralph)
       ↓

## Workflow

### Step 1 — Classify Change

| Change Type | When | Example |
|-------------|------|---------|
| **ADDED** | New requirement/section | "Add OTP verification for > 500K" |
| **MODIFIED** | Change existing requirement | "Change timeout from 5min to 15min" |
| **REMOVED** | Drop requirement | "Remove QR refresh button (moved to separate feature)" |

**Impact level** quyết định rigor:

| Level | Tasks affected | Rigor |
|-------|----------------|-------|
| LOW | 0-1 task, no rework | Quick proposal, inline review |
| MEDIUM | 2-5 tasks, some rework | Full proposal + architect review |
| HIGH | 5+ tasks, significant rework | Full proposal + Planner+Architect+Critic consensus |
| CRITICAL | Fundamental scope shift | Pause implementation, re-spec with `vetc-deep-interview` |

### Step 2 — Create Proposal Directory

```
specs/{NNN}-{slug}/changes/
├── 001-add-otp-verification/
│   ├── proposal.md       ← From templates/change-proposal-template.md
│   └── delta.md          ← Section-by-section diff
├── 002-adjust-timeout/
│   ├── proposal.md
│   └── delta.md
└── archive.md            ← Applied changes summary
```

Numbering: sequential (001, 002, ...).

### Step 3 — Fill Proposal Template

Use `templates/change-proposal-template.md`. Required sections:

1. **Why** — Motivation, external driver (compliance, user feedback, tech debt)
2. **What Changed** — Section-level changes table (Before / After)
3. **Impact Analysis** — Tasks affected, data model changes, API contract, security, performance
4. **Risk Assessment** — Probability × Impact table with mitigation
5. **Acceptance Criteria** — How to verify change is correctly applied
6. **Review Sign-offs** — Spec Author / Planner / Architect / Critic / Security / PO

### Step 4 — Create Delta.md

Section-by-section diff format:

```markdown
# Delta: {Change Title}

## §4 Happy Path — MODIFIED

**Before**:
1. Customer scans QR
2. System validates QR
3. Customer confirms amount
4. Transaction processed

**After**:
1. Customer scans QR
2. System validates QR
3. Customer confirms amount
4. **(NEW)** If amount > 500K: system requests OTP
5. **(NEW)** Customer enters OTP (60s timeout)
6. **(NEW)** System validates OTP

## §5 Edge Cases — ADDED

**New EC-04**: OTP timeout
- **Trigger**: User doesn't enter OTP within 60s
- **Expected**: Show "OTP expired", allow resend once

**New EC-05**: OTP invalid
- **Trigger**: User enters wrong OTP 3 times
