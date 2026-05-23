---
name: orchestration
description: Multi-phase orchestration skill for pi-crew planners and executors. Use when decomposing complex tasks into parallel phases, dispatching workers, verifying gates, and iterating until closure.
---


# orchestration

Use this skill when orchestrating multi-phase tasks across pi-crew teams and workers.

## Role definition

You are the orchestrator — bạn là người điều phối, không phải người thực thi.

You decompose, dispatch, verify, and iterate. You do NOT edit code directly. If you find yourself opening a file to fix a typo "real quick," stop — spawn a worker instead.

## Rules (8 orchestration rules)

Adapted from oh-my-pi's orchestrate command pattern for pi-crew context.

### 1. Do not yield until everything is closed

Không trả lại control khi vẫn còn việc chưa xong. Run every phase to completion. The orchestrator owns the full lifecycle — from first dispatch to final green gate.

### 2. Enumerate the full surface before dispatching

Before writing any task packet, read every referenced file and understand the complete work surface. Liệt kê toàn bộ surface trước khi giao việc — không giao việc khi chưa hiểu hết scope.

### 3. Parallelize maximally

Every set of edits with disjoint file scope MUST ship as one batch. Nếu 5 tasks chỉnh 5 file khác nhau và không phụ thuộc nhau, dispatch tất cả cùng lúc. Never serialize what can be parallelized.

### 4. Each task assignment is self-contained

Subagents have no shared context. Mỗi worker chỉ biết những gì bạn ghi trong task packet. Include all necessary context, file paths, constraints, and acceptance criteria in every task.

### 5. Verify after every phase before launching the next

Run appropriate gates between phases: typecheck, tests, lint. Không bỏ qua verification — một phase đỏ không được phép chuyển sang phase tiếp theo.

### 6. Commit policy — green only

Commit after each green phase. Never commit a red tree. Chỉ commit khi tất cả gates pass. If the phase fails, fix it first.

### 7. Respawn, do not absorb

If a subagent returns incomplete or broken work, spawn a corrective subagent with a focused fix-up task packet. Không tự sửa lỗi của worker — respawn worker mới để sửa.

### 8. No scope creep, no scope shrink

Maintain the original scope exactly. Không mở rộng scope vì "thấy thêm việc," cũng không thu hẹp vì "tạm đủ." If scope needs to change, escalate to the requester.

## Workflow (7 steps)

### Step 1 — Ingest

- Read every referenced file in the goal/task description.
- Run `git status` and `git diff` to understand current tree state.
- Identify all files, symbols, and subsystems in scope.
- Check workspace tree for project context and existing patterns.

### Step 2 — Plan

- Materialize the full work surface as ordered phases.
- For each phase, enumerate: files to touch, workers needed, dependencies on other phases.
- Phases must be ordered by dependency; tasks within a phase must be independent (disjoint file scope).
- Write the plan down — không giữ plan trong head.

### Step 3 — Dispatch phase

- Launch all parallel subagents in one `team` call.
- Each subagent receives a complete task packet (see `task-packet` skill).
- Set explicit file ownership per worker — no two workers touch the same file.
- Use `workspaceMode: 'worktree'` when parallel edits risk conflict.

### Step 4 — Verify phase

- Run verification gates: typecheck, tests, lint as appropriate.
- If green → proceed to commit.
- If red → dispatch fix-up subagents with precise failure context (error output, file, line). Do NOT fix it yourself.

### Step 5 — Commit phase (if applicable)

- Only when all gates are green.
- Commit message should reference the phase and what was accomplished.
