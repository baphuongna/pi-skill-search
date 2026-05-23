---
name: vetc-analyze-ba
description: PROACTIVELY activate khi đã có raw-ba-requirements.md hoặc BA doc đã chuẩn hóa. 13-step gated pipeline từ BA Analysis → Spec → Design → API → Tasks → Code → Security → Test → Verify → Perf.
---

# VETC Analyze BA — 13-Step BA→Code Pipeline

Nhận `raw-ba-requirements.md`, chuyển thành code production-ready theo 13 bước có gate review.

## When to Activate

- Đã có `specs/features/{feature}/raw-ba-requirements.md`
- Muốn implement tính năng từ tài liệu BA theo quy trình đầy đủ
- Dùng sau `vetc-thinking-pm` (đã chuẩn hóa BA input)

## Do NOT Activate When

- Chưa có BA document (dùng `vetc-thinking-pm` hoặc `vetc-deep-interview` trước)
- Chỉ cần code review, không implement từ BA spec
- Requirement đã crystal clear, không cần 13-step pipeline (dùng quick path)

## Thứ tự dùng

```
vetc-analyze-codebase → vetc-thinking-pm → vetc-analyze-ba  ← skill này
```

## Pre-conditions

- `specs/features/{feature}/raw-ba-requirements.md` phải tồn tại
- `docs/architecture/codebase-spec.md` phải tồn tại (Phase 4 yêu cầu) — nếu chưa có → chạy `vetc-analyze-codebase` trước

## Modes

| Mode | Phases | Dùng khi |
|------|--------|---------|
| `--parse-only` | 1-2 | Chỉ phân tích + làm rõ |
| `--design-only` | 1-5 | Phân tích đến API design, không code |
| `--continue` | Tiếp từ chỗ dở | Mở session mới, tiếp tục |
| (default) | 1-13 | Full pipeline |

## Cấu trúc output

specs/features/{feature}/
├── 00-anti-hallucination.md  ← Tạo đầu tiên (Bước 0), update sau Phase 3
├── 00-run-ledger.md          ← Timeline (tạo Phase 1, cập nhật mỗi phase)
├── 00-local-memory-context.md← Mirror context + lessons-learned
├── memory/                   ← Phase 3b — context snapshot
│   └── {feature}.md
├── raw-ba-requirements.md    ← INPUT
├── 01-ba-analysis.md         ← Phase 1
├── 02-clarify-questions.md   ← Phase 2
├── 03-feature-spec.md        ← Phase 3 (SOURCE OF TRUTH)
├── 04-technical-design.md    ← Phase 4
├── 05-api-design.md          ← Phase 5

## 13 Phases

### Phase 1 — PARSE → `01-ba-analysis.md`
Đọc `raw-ba-requirements.md`, tách: Requirements, Business Rules, Data, Edge Cases, NFRs, GAPs.

**Auto-sizing sau Phase 1:**
| Size | Endpoints | Tables mới | Mode |
|------|-----------|-----------|------|
| XS | 1 | 0 | Redirect → quick feature |
| S | 2-3 | 0-1 | LITE |
| M | 4-7 | 1-3 | STANDARD |
| L/XL | 8+ | 3+ | FULL |

⏸️ DỪNG → chờ user review + confirm size/mode.

### Phase 2 — CLARIFY → `02-clarify-questions.md`
Từ GAPs → danh sách câu hỏi cho BA (chức năng, nghiệp vụ, dữ liệu, edge cases) + assumptions.
⏸️ DỪNG → chờ BA trả lời → update file → confirm.

### Phase 3 — STRUCTURE → `03-feature-spec.md` (SOURCE OF TRUTH)
Chuyển analysis + clarify → Feature Spec với:
- User Stories, Requirements, Business Rules
- API Contract sketch (VETC format)
- Data Model (table, columns, indexes)
- State Flow (nếu có)
- Error Scenarios
- Acceptance Criteria
- Design Decisions & Constraints

**Sau Phase 3 (BẮT BUỘC):** Cập nhật `00-anti-hallucination.md` + tạo `specs/features/{feature}/memory/{feature}.md` (context snapshot).

⏸️ DỪNG → chờ review.

### Phase 4 — DESIGN → `04-technical-design.md`
**Gate bắt buộc:** phải có `docs/architecture/codebase-spec.md`.
- Detect architecture từ codebase-spec (LAYERED / HEXAGONAL)
- File changes: new files + modified files (với full path theo architecture)
- DB migration SQL (Flyway format)
- Sequence flow
- Implementation order: DB → Entity → Repository → DTO → Service → Controller → Tests

⏸️ DỪNG → chờ confirm.

### Phase 5 — API DESIGN → `05-api-design.md` (VETC format)
Thiết kế API theo chuẩn VETC (từ `../../shared/api-design.md`):
- API Index table
- Per-API: 15 fields + Headers + Query Params + Request/Response Body + Error Codes + curl example
- Response format: `{ code, message, data, meta_data: { request_id, page, size, total, total_pages } }`
- Error codes: `200`, `400xxx`, `401xxx`, `403xxx`, `404xxx`, `409xxx`, `500xxx`
- PII fields: mask trong response

⏸️ DỪNG → chờ confirm per-API.

### Phase 6 — TASK BREAKDOWN → `06-task-breakdown.md`
**⚠️ KHÔNG có file này → TUYỆT ĐỐI KHÔNG implement.**
- Tách theo `04-technical-design.md`
- Mỗi task: scope (files), boundary, rule check, dependency, risk & impact table

⏸️ DỪNG → chờ review.


