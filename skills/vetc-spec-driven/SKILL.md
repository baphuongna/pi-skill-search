---
name: vetc-spec-driven
description: PROACTIVELY activate khi user mô tả tính năng nhưng chưa có spec, hoặc requirement còn mơ hồ. Biến yêu cầu thành Structured Spec với edge cases, acceptance criteria, success criteria. Dùng trước vetc-api-design.
---

# VETC Spec-Driven Development

Spec rõ ràng → AI sinh code đúng ngay lần đầu. **Code serves specs, not the other way.**

## When to Activate

- User mô tả tính năng bằng tiếng Việt hoặc tiếng Anh, chưa có spec
- Requirement còn mơ hồ, chưa có edge case
- Trước khi dùng `vetc-api-design` hoặc `vetc-planner`
- Khi cần validate logic với BA/PO trước khi code

## Do NOT Activate When

- Requirement đã rất rõ ràng, có spec chi tiết → dùng `vetc-planner` trực tiếp
- Bug fix đơn giản, không cần spec → dùng `vetc-systematic-debugging`
- Chỉ refactor code, không thêm feature mới
- Đang implement code theo spec đã approved → dùng `vetc-java-patterns` hoặc `vetc-frontend-patterns`
- Task quá nhỏ (< 1 giờ) → code trực tiếp, không cần spec

## Feature Directory Convention

Mỗi feature có thư mục riêng để persist artifacts:

```
specs/{NNN}-{slug}/
├── spec.md           ← Structured Spec (output của skill này)
├── api-design.md     ← từ vetc-api-design
├── plan.md           ← từ vetc-planner
├── tasks.md          ← task list chi tiết
├── state.md          ← feature state tracking (lifecycle)
├── checklists/       ← từ vetc-spec-quality
│   ├── ux.md
│   ├── security.md
│   └── api.md

## Spec Lifecycle (từ OpenSpec)

Specs có lifecycle rõ ràng — không phải static document:

| Phase | Status | Description |
|-------|--------|-------------|
| DRAFT | `spec.md` mới tạo | Chưa review, có thể thay đổi tự do |
| PROPOSED | Spec đã được clarify | Đã qua deep-interview hoặc socratic clarification |
| APPROVED | Plan đã được ralplan approve | Locked — changes cần delta spec |
| IMPLEMENTING | Ralph đang implement | Spec là source of truth, code follows |
| APPLIED | Implementation done + verified | Spec merged vào codebase-spec |
| ARCHIVED | Feature shipped | Delta changes merged, spec đóng |

**State transitions:**
```

# State: {Feature Name}
## Lifecycle Phase: DRAFT
## Last Updated: [date]
## Changes: [list of delta changes applied]
```

## Delta Spec Convention

See: `./(see docs)`

## How It Works

### Step 0 — Risk Checklist (bắt buộc)

Trước khi bắt đầu spec, chạy risk checklist để xác định lane:

| Flag | Touches |
|------|---------|
| Auth | JWT, Smart OTP, session, refresh token |
| Authorization | Role, permission, wallet ownership |
| Data model | Oracle DDL, JPA entity, migration |
| Audit/security | Audit log, CCCD, balance |
| External systems | Bank GW, eKYC provider, payment gateway |
| Public contracts | REST API shape, ResultResp |
| Cross-module | >1 domain changes |
| Existing behavior | Code đã test/covered |
| Weak proof | Khu vực chưa có test |

### Step 1 — Socratic Clarification

Hỏi tối đa 5 câu tập trung:
- **Actor**: ai thực hiện? (customer, agent, admin, system, external service)
- **Happy path**: luồng chính là gì?
- **Failure modes**: điều gì xảy ra khi thất bại? (timeout, duplicate, insufficient balance)
- **Business constraints**: giới hạn tiền? thời gian? role? frequency?
- **Integrations**: hệ thống nào liên quan? (ACS, Bank GW, eKYC, ...)

### Step 2 — Structured Spec Output

Ghi vào `specs/{NNN}-{slug}/spec.md`. See template: `./(see docs)`

## [NEEDS CLARIFICATION] Rules

1. **Max 3 items** — không hơn. Mọi thứ khác → Assumptions (informed guess).
2. **Priority order**: scope > security > UX > technical.
3. **Format**: câu hỏi + options table + recommended option với reasoning.
4. **Resolution**: user chọn option → update spec, move to Assumptions hoặc Accepted.

```markdown
- [NEEDS CLARIFICATION-01] (scope): Timeout QR payment bao lâu?
  → Options:
    A) 5 minutes (chuẩn VNPAY) — Recommended: phổ biến nhất
    B) 15 minutes (thân thiện hơn)


