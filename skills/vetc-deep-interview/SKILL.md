---
name: vetc-deep-interview
description: Kích hoạt khi requirement còn mơ hồ, chưa rõ scope/actor/edge cases. Socratic clarification với ambiguity scoring. Output ra specs/interviews/{slug}.md rồi handoff vetc-ralplan hoặc vetc-analyze-ba.
---

# VETC Deep Interview — Socratic Clarification

Làm rõ yêu cầu trước khi plan hoặc implement. Tránh rework từ misaligned implementation.



## When to Activate

- User mô tả tính năng ngắn gọn, chưa rõ scope ("thêm chức năng X", "fix vấn đề Y")
- Requirement còn ambiguous — thiếu actor, business rules, edge cases, acceptance criteria
- Cần validate hiểu biết với BA/PO trước khi commit vào implementation
- Trước khi dùng `vetc-ralplan` hoặc `vetc-analyze-ba`
- User nói: "hỏi tôi về requirement", "làm rõ trước", "deep interview"

## Red Flags — Stop and Re-Evaluate

These thoughts mean you are about to bypass this skill incorrectly:

| Thought | Reality |
|---------|---------|
| "This feature is simple, no need for clarification" | "Simple" features have the worst rework rates. |
| "I can guess what they want" | Your guess is wrong. Ask. |
| "The user seems impatient, skip to coding" | Rework takes 10x longer than clarification. |
| "I've seen this pattern before in VETC" | Similar ≠ same. E-Wallet vs ACS vs eKYC differ critically. |
| "The spec will become clear during implementation" | It won't. It will become a mess. |
| "One question is enough" | One question gives one answer. You need the full picture. |

## Do NOT activate when

- Đã có `raw-ba-requirements.md` rõ ràng → dùng `vetc-analyze-ba`
- Đã có Structured Spec → dùng `vetc-ralplan` hoặc `vetc-planner`
- User cung cấp file path / function name cụ thể → implement ngay

## Recommended Pipeline

```
vetc-deep-interview → vetc-ralplan → vetc-analyze-ba (hoặc vetc-java-patterns)
```

## Ambiguity Dimensions (VETC-adapted)

| Dimension | Weight (New) | Weight (Change) | Focus |
|-----------|-------------|-----------------|-------|
| Intent | 0.25 | 0.25 | Tại sao cần tính năng này? Business goal? |
| Outcome | 0.20 | 0.20 | End state mong đợi là gì? |
| Scope | 0.20 | 0.20 | Phạm vi: module nào, role nào, flow nào? |
| Business Rules | 0.15 | 0.15 | Ràng buộc nghiệp vụ (amount limits, timing, roles) |
| Success Criteria | 0.10 | 0.10 | Làm sao biết là xong? Test case nào? |
| Integrations | 0.10 | 0.10 | ACS, Bank GW, eKYC, RabbitMQ ảnh hưởng gì? |

**Ambiguity score** = `1 - weighted_sum_of_clarity_scores`

Threshold: `<= 0.20` (Standard) | `<= 0.30` (Quick) | `<= 0.15` (Deep)

## Ambiguity Taxonomy (Spec-Kit adapted)

10+ category taxonomy để scan ambiguity có hệ thống:

| # | Category | Probing Questions | VETC Examples |
|---|----------|-------------------|---------------|
| 1 | Functional Scope | Tính năng làm gì? Không làm gì? | Nạp tiền qua QR: chỉ top-up hay cả thanh toán? |
| 2 | Domain & Data Model | Entity nào? Relationship? | Transaction có link Wallet không? Journal entry loại gì? |
| 3 | Interaction & UX | User thấy gì? Click gì? | Confirm screen trước hay sau scan QR? |
| 4 | Non-Functional Quality | Performance? Availability? | 100 concurrent users? 99.9% uptime? |
| 5 | Integration | External systems? Protocols? | Bank GW đồng bộ hay async? Retry policy? |
| 6 | Edge Cases & Error Handling | Lỗi thì sao? Recovery? | QR expired → refresh hay tạo mới? |
| 7 | Constraints & Limits | Amount? Frequency? Timing? | Min/max top-up? Daily limit? |
| 8 | Security & Auth | Role? Permission? Data sensitivity? | Agent top-up hộ customer được không? |
| 9 | Terminology & Concepts | Term đồng nghĩa? Ambiguous? | "Balance" = available hay including frozen? |

## Workflow

### Phase 0 — Preflight

1. Parse feature slug từ input (kebab-case)
2. Kiểm tra `specs/interviews/{slug}-*.md` — nếu có, load context và resume
3. Tạo context snapshot:
   ```
   specs/interviews/{slug}-{YYYYMMDD}.md
   ├── Task statement
   ├── Probable intent hypothesis
   ├── Known facts
   ├── Open questions
   └── VETC integrations likely involved
   ```
4. Thông báo: ambiguity hiện tại, mode (Quick/Standard/Deep), max rounds

### Phase 1 — Socratic Interview Loop

**Quy tắc:**
- Hỏi **1 câu** mỗi round — không batch
- Ưu tiên Intent → Scope → Business Rules → Success Criteria → Integrations
- Sau mỗi câu trả lời: pressure test (counterexample, hidden assumption, tradeoff)
- Research codebase trước khi hỏi user về internals

**Round format:**
