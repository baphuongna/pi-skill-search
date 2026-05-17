---
name: vetc-sdlc
description: PROACTIVELY activate khi user bắt đầu tính năng mới, hỏi "bắt đầu từ đâu", hoặc cần routing đến đúng SDLC path. Entry point cho toàn bộ workflow từ spec đến deploy.
---

# VETC SDLC — Level 5 Workflow

Điều phối toàn bộ quy trình phát triển Level 5 của VETC E-Wallet.



## When to Activate

- User đề cập tính năng mới, requirement mới
- User hỏi "bắt đầu từ đâu", "làm thế nào", "flow như thế nào"
- Bắt đầu sprint hoặc ticket mới
- User không biết dùng skill/agent nào

## Do NOT Activate When

- User chỉ hỏi câu hỏi đơn giản, không liên quan phát triển tính năng
- Đang chỉ đọc code / explore codebase, không có intent implement
- Debug one-off issue cụ thể (dùng `vetc-runbook` hoặc `vetc-build-resolver`)

## Pre-Execution Gate

**VETC SDLC chặn vague execution requests** và redirect đến planning trước:

| Vague (→ ralplan/deep-interview) | Cụ thể (→ execute trực tiếp) |
|----------------------------------|------------------------------|
| "thêm chức năng transfer" | "Implement POST /wallet/transfer theo spec task T3" |
| "fix lỗi" | "Fix NullPointerException WalletService.java:45" |
| "làm tính năng nạp tiền" | Có file path / task breakdown / issue number |

**Bypass gate:** prefix `force:` hoặc `!`

## The VETC Level 5 Workflow

### Path A — Full BA Pipeline (có tài liệu BA)

```
┌──────────────────────────────────────────────────────────────────────────┐
│              VETC SDLC — Level 5 Full BA Pipeline                        │
├────────────┬──────────────────────────┬────────────────────────────────  │
│ Phase      │ Skill                    │ Output                           │
├────────────┼──────────────────────────┼──────────────────────────────────┤
│ 0. Scan    │ vetc-analyze-codebase    │ codebase-spec.md + data-model.md │
│ 1. PM      │ vetc-thinking-pm         │ raw-ba-requirements.md (chuẩn)   │
│ 2. BA      │ vetc-analyze-ba (1-3)    │ 01-ba-analysis + 02-clarify      │
│ 3. Spec    │ vetc-analyze-ba (3)      │ 03-feature-spec.md (SOURCE)      │
│ 4. Design  │ vetc-analyze-ba (4-5)    │ 04-technical + 05-api-design     │
│ 5. Plan    │ vetc-analyze-ba (6-6b)   │ 06-task-breakdown + tasks/       │
│ 6. Code    │ vetc-analyze-ba (7)      │ 07-implement-ledger + code       │

### Path B — Quick Implementation (đã có spec rõ)

```
┌──────────────────────────────────────────────────────────────────┐
│              VETC SDLC — Quick Path                              │
├──────────┬────────────────────┬──────────────────────────────────┤
│ Phase    │ Skill / Agent      │ Output                           │
├──────────┼────────────────────┼──────────────────────────────────┤
│ 1. Spec  │ vetc-spec-driven   │ Structured spec + edge cases     │
│ 2. Design│ vetc-api-design    │ ERD + API contract + flow        │
│ 3. Plan  │ vetc-planner agent │ Task list với file paths         │
│ 4a. BE   │ vetc-java-patterns │ Spring Boot implementation       │
│ 4b. FE   │ vetc-frontend-pat..│ React/TS implementation         │
│ 5. Test  │ vetc-tdd           │ JUnit + Integration tests        │
│ 6. Review│ java/ts-reviewer   │ Review report + blockers         │

## Routing Logic

Khi nhận yêu cầu, routing theo context:

| Signal | → Skill/Agent |
|--------|-------------|
| "mới vào project", "cần bản đồ codebase" | → `vetc-analyze-codebase` |
| Requirement mơ hồ, cần clarify trước khi plan | → `vetc-deep-interview` |
| BA gửi file Word/Jira/text, cần chuẩn hóa | → `vetc-thinking-pm` |
| Có spec, cần plan + Architect+Critic review | → `vetc-ralplan` |
| Có approved plan, cần implement đến hoàn thành | → `vetc-ralph` |
| Có `raw-ba-requirements.md`, cần implement 13 bước | → `vetc-analyze-ba` |
| "tính năng mới" (quick path, không có BA doc) | → `vetc-spec-driven` |
| Có spec, cần thiết kế DB/API | → `vetc-api-design` |
| Có design, cần task list | → `vetc-planner` agent |

## Senior Engineer Test (từ Karpathy)

Trước khi bắt đầu implementation, hỏi:

> "Một senior engineer review code này có hỏi 'TẠI SAO lại làm vậy?' không?"

Nếu câu trả lời là "yes" → cần justify trong spec/plan. Nếu không justify được → đừng làm.

**Complexity Gate:**
