---
name: vetc-ralph
description: PROACTIVELY activate khi đã có approved plan từ vetc-ralplan và cần implement đến HOÀN THÀNH. Persistence loop không stop cho đến khi build pass + tests pass + coverage đạt + không OWASP HIGH.
---

# VETC Ralph — Persistence Loop

Implement và không dừng cho đến khi task thực sự xong: build pass, test pass, coverage đạt, security clean.

## When to Activate

- Đã có approved plan (từ `vetc-ralplan` hoặc `06-task-breakdown.md`)
- Muốn AI tự implement từng task, verify sau mỗi task, không cần confirm mỗi bước nhỏ
- Task đủ rõ để execute (có file path, task breakdown, acceptance criteria)
- User nói: "ralph", "cứ làm đến xong", "đừng dừng", "finish this", "keep going"

## Do NOT activate when

- Plan chưa có / chưa approved → dùng `vetc-ralplan` trước
- Requirement còn mơ hồ → dùng `vetc-deep-interview` trước
- User muốn manual control từng bước → dùng `vetc-analyze-ba` (có gates)
- Chỉ cần implement 1 file đơn giản → implement trực tiếp

## Do NOT Activate When

- Task quá nhỏ, chỉ cần thay đổi < 3 files (implement trực tiếp)
- Chỉ cần code review, không implement (dùng reviewer agents)
- User chưa confirm plan — chưa có approved task breakdown

## Bypass

Prefix `force:` để bypass gate: `force: ralph implement XxxService`

## Ralph Loop

```
[Pre-context Intake]
    ↓
[Task Breakdown] (từ plan đã approved)
    ↓
┌─────────────────────────────────────────────────┐
│  RALPH WAVE EXECUTION                           │
│                                                 │
│  Wave 1: [T1, T2, T3] ← independent, PARALLEL  │
│    Each task gets fresh focused context          │
│    Build + Test + Coverage per task              │
│                                                 │
│  Wave 2: [T4, T5] ← depends on Wave 1          │

## Phase 0 — Pre-context Intake (bắt buộc)

Trước khi bắt đầu loop:

1. **Tạo Story Packet** cho mỗi task (từ `templates/story-packet.md`):
   - Lite lane: skip story packet, trực tiếp implement
   - Standard lane: tạo story packet với status, lane, acceptance criteria, validation plan
   - Full lane: tạo high-risk story folder (`templates/high-risk-story/`) với overview + execplan + design + validation
2. Load hoặc tạo context snapshot:

1. Load hoặc tạo context snapshot:
   ```
   specs/features/{feature}/ralph-context.md
   ├── Task statement
   ├── Approved plan path

## Wave Execution

Tasks được group thành waves dựa trên dependencies:

**Wave grouping rules:**
- Tasks KHÔNG phụ thuộc nhau → cùng wave (parallel)
- Tasks phụ thuộc task ở wave trước → wave tiếp theo (sequential)
- Mỗi wave chạy độc lập, kết quả được verify trước khi sang wave tiếp

```
Wave 1: [Entity] [Repository] [DTO]          ← independent, PARALLEL
Wave 2: [Service]                             ← depends on Wave 1
Wave 3: [Controller]                          ← depends on Wave 2
Wave 4: [Unit Tests] [Integration Tests]      ← depends on Wave 3, PARALLEL
```

## Task Format

See: `./references/task-format.md`

## Per-Task Implementation Loop

See: `./references/per-task-loop.md` (7 bước: Build → Test → Coverage → Security → Health Check → Context → Progress Update)

### Per-Task Test Matrix Update

Sau mỗi task complete, cập nhật `docs/TEST_MATRIX.md` (tạo từ `templates/test-matrix.md` nếu chưa có):

1. Thêm/update row cho task với task ID + spec section
2. Set Status = "in_progress" khi bắt đầu task
3. Sau build pass → fill Build column = yes
4. Sau test pass → fill Unit/Integration columns = yes
5. Sau security scan → fill Security column = yes
6. Task DONE → set Status = "implemented", fill Evidence

## Parallel Execution

Task **độc lập** → run parallel:
```
Tốt: Entity + Repository + DTO (không phụ thuộc nhau)
Tốt: Test viết song song với Service implementation
Xấu: Service trước Controller (Controller phụ thuộc Service)
```

