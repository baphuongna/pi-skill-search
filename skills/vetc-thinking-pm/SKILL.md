---
name: vetc-thinking-pm
description: PROACTIVELY activate khi BA gửi file Word/PDF/Jira/BRD cần chuẩn hóa, hoặc khi có tài liệu đối tác cần tích hợp. Biến tài liệu đa dạng thành raw-ba-requirements.md chuẩn. Dùng trước vetc-analyze-ba.
---

# VETC Thinking Like Product Manager

Chuẩn hóa mọi loại tài liệu BA thành `raw-ba-requirements.md` — format chuẩn, sẵn sàng cho `vetc-analyze-ba`.

## When to Activate

- BA gửi file Word/PDF/text/Jira, cần chuẩn hóa trước khi phân tích
- Có tài liệu đối tác (partner API docs, sequence diagrams) cần tích hợp với yêu cầu nội bộ
- Cần làm rõ scope, phân biệt "đối tác làm gì" vs "hệ thống VETC sẽ làm gì"
- User paste text requirement trực tiếp vào chat (không có file)
- Trước khi chạy `vetc-analyze-ba`

## Do NOT Activate When

- Requirement đã rõ ràng, có spec chi tiết → dùng `vetc-analyze-ba` hoặc `vetc-spec-driven`
- Chỉ implement theo spec sẵn có → dùng `vetc-java-patterns` hoặc `vetc-frontend-patterns`
- Bug fix không cần phân tích requirement
- Code review, không phải requirement analysis

## Thứ tự dùng

```
1. vetc-analyze-codebase   (1 lần cho project — tạo codebase-spec.md)
2. vetc-thinking-pm        (chuẩn hóa input BA)  ← skill này
3. vetc-analyze-ba         (phân tích + implement 13 bước)
```

## Cấu trúc thư mục

```
design/thinking/{feature-name}/
├── source/      ← user bỏ file vào đây (Word, PDF, YAML, text...)
├── converted/   ← AI đọc từ đây (chạy convert-file source/ để tạo)
│   ├── partner_*.md    ← tài liệu đối tác (API spec, sequence flow)
│   └── internal_*.md   ← tài liệu nội bộ (requirements, notes)
└── raw-ba-requirements.md  ← OUTPUT
```

**Quy ước đặt tên:**
- `partner_{mô-tả}.ext` — tài liệu từ đối tác/third party
- `internal_{mô-tả}.ext` — tài liệu nội bộ VETC

## Workflow (5 Phases)

### Phase 0 — Chuẩn bị

**Mode A — File-based (có Word/PDF):**
1. Parse feature name từ command argument (kebab-case)
2. Kiểm tra `design/thinking/{feature}/converted/` tồn tại
3. List files trong converted/, phân loại `partner_*` vs `internal_*`
4. Nếu `converted/` chưa có → hướng dẫn convert:
   - Dùng pandoc: `pandoc source/spec.docx -o converted/internal_spec.md`
   - Hoặc dùng công cụ convert khác, đặt output vào `converted/`

**Mode B — Direct Text (không có file):**
1. User paste text requirement trực tiếp → skip Phase 0-1 file scanning
2. Coi toàn bộ text là `internal_*` source
3. Tiếp tục từ Phase 2 (Phân tích)

### Phase 1 — Thu thập
- Đọc file `.md`, `.txt` từ `converted/` (gắn nhãn Partner/Internal theo prefix)
- Parse `.yaml/.yml` (OpenAPI) → paths, schemas; phân biệt API đối tác vs API dự kiến nội bộ
- Parse `.puml` (PlantUML) và `.mmd/.mermaid` → actors, flows
- Gộp nội dung, gắn mỗi phần với Source (`converted/{file}:{line_range}`)

### Phase 2 — Phân tích
- Tách REQ, BR, AC, UC từ mọi nguồn
- Mỗi mục phải có Source — KHÔNG đoán, KHÔNG suy diễn không có nguồn
- Ánh xạ REQ ↔ AC ↔ UC
- Phân loại delta: ADDED / MODIFIED / REMOVED
- Xác định GAPs — thiếu thông tin, mâu thuẫn, mơ hồ
- Từ `internal_*`: rút ra "góc nhìn hệ thống VETC sẽ làm" (product deliverables, system responsibilities)
- Từ `partner_*`: suy ra API/luồng dự kiến hệ thống ta sẽ build

### Phase 3 — Chuẩn hóa (OpenSpec + spec-kit schema)
Điền vào template `../../templates/raw-ba-requirements-template.md`:

| Section | Schema nguồn | Nội dung |
|---------|-------------|---------|
| 0. Execution Log | — | Ghi lại từng Phase đã làm |
| 1. Context | OpenSpec | Why, What Changes, Impact |
| 1b. System View | Internal | Hệ thống VETC sẽ làm gì, out of scope |
| 2. Capabilities | OpenSpec | New/Modified capabilities |
| 3. User Stories | spec-kit | Priority P1/P2/P3, Given/When/Then |
| 4. Requirements | Cả hai | REQ với delta ADDED/MODIFIED/REMOVED |
| 5. Business Rules | Cả hai | BR với Source |
| 6. Scenarios | OpenSpec | WHEN/THEN format |
| 7. Acceptance Criteria | Cả hai | AC map REQ/UC |
| 8. Data/API | API draft | Partner APIs + Planned Internal APIs |

### Phase 4 — Validation
- Checklist: User stories có Priority + Given/When/Then?
- Mọi AC map tới REQ/UC?
- Error scenarios đã liệt kê?
- Mọi mục có Source?

### Phase 5 — Output & Handoff
1. Ghi `design/thinking/{feature}/raw-ba-requirements.md` (bao gồm Execution Log)
2. Dừng → chờ user review
3. Sau user confirm → hỏi: "Sẵn sàng move sang `specs/features/{feature}/`?"
4. Dừng → chờ confirm
5. Khi user confirm → copy file (đề xuất lệnh trước khi thực thi)

## Anti-Hallucination Rules (BẮT BUỘC)
