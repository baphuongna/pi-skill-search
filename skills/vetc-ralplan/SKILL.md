---
name: vetc-ralplan
description: PROACTIVELY activate khi có spec rõ nhưng cần review plan trước khi code, hoặc sau vetc-deep-interview. Planner + Architect + Critic consensus review. Đảm bảo plan được review từ nhiều góc.
---

# VETC Ralplan — Consensus Planning

Review và approve plan trước khi implement. Planner + Architect + Critic đồng thuận → implementation bắt đầu.

## When to Activate

- Có spec hoặc requirement rõ, cần plan trước khi code
- Task phức tạp: nhiều module, nhiều layer (Controller/Service/Repository/FE)
- Thay đổi ảnh hưởng Oracle schema, ACS integration, security
- Sau `vetc-deep-interview` — có spec, cần plan
- User nói: "lên kế hoạch trước", "review plan", "ralplan", "plan trước khi làm"

## Do NOT activate when

- Đã có `06-task-breakdown.md` rõ ràng → implement ngay với `vetc-analyze-ba`
- Task nhỏ (1 file, 1 function) → dùng `vetc-planner` agent hoặc implement trực tiếp
- User muốn quick path → `vetc-spec-driven` → `vetc-api-design` → `vetc-planner`

## Implementation Readiness Gate (từ BMAD)

Trước khi approve plan, verify TẤT CẢ artifacts đã aligned:

| Check | What to Verify | Block? |
|-------|---------------|--------|
| Spec completeness | All user scenarios (US-*) covered? Edge cases identified? | YES if CRITICAL gap |
| API design aligned | Plan references correct endpoints from api-design.md? | YES if mismatch |
| Data model consistent | Entity fields match spec requirements? | YES if conflict |
| Security accounted | PII handling specified? Auth requirements listed? | YES if missing |
| Test plan exists | Unit + integration scope defined per task? | WARN if missing |
| Non-goals explicit | "X nằm ngoài scope" documented? | WARN if vague |

**Readiness verdict:**
- `READY` — all checks pass, proceed to consensus planning
- `CONDITIONAL` — WARN items need acknowledgment before proceeding
- `NOT READY` — block, return to spec/design phase to fill gaps

## Pre-Execution Gate

**Ralplan chặn các requests vague trước khi vào implementation:**

| Tín hiệu PASS (đủ cụ thể) | Tín hiệu cần ralplan |
|---------------------------|---------------------|
| "Fix NullPointerException trong WalletService.java:45" | "Fix lỗi transfer" |
| "Implement API POST /wallet/transfer theo spec" | "Thêm chức năng transfer" |
| "Task list: 1. Entity 2. Repository 3. Service 4. Controller" | "Làm tính năng nạp tiền" |
| Có file path, function name, issue number cụ thể | Không có anchor cụ thể |

**Bypass gate:** prefix `force:` hoặc `!` trước prompt.

## Consensus Planning Workflow

### Step 1 — Planner: Draft Plan

Tạo Implementation Plan gồm:

```markdown
# PLAN: {Feature Name}

## Summary (1 câu)

## VETC-DR Analysis
### Principles (3-5)
- [P1] Spec-First: không code khi chưa có spec
- [P2] Oracle-Safe: parameterized queries only
- [P3] Security: không log PII, JWT validate đúng
- ...

### Decision Drivers (top 3)
- [D1] ...
- [D2] ...
- [D3] ...

### Viable Options (>= 2)
| Option | Pros | Cons | Risk |
|--------|------|------|------|
| A | ... | ... | ... |
| B | ... | ... | ... |

### Recommended Option
[Option X] — vì [reason aligned với Drivers]

## Implementation Plan

### Phase 1: Database Layer
- [ ] SQL Migration: CREATE TABLE / ALTER TABLE
- [ ] JPA Entity: `src/.../entity/Xxx.java`
- [ ] Repository: `src/.../repository/XxxRepository.java`

### Phase 2: Business Layer
- [ ] Service interface: `XxxService.java`
- [ ] Implementation: `XxxServiceImpl.java` (với @Transactional)

### Phase 3: API Layer
- [ ] Controller: `XxxController.java` (extends ControllerBase)
- [ ] DTOs: `XxxRequest.java`, `XxxResponse.java`

### Phase 4: Tests
- [ ] Unit: `XxxServiceImplTest.java`
- [ ] Integration: `XxxControllerTest.java`

### Phase 5: Frontend (nếu có)
- [ ] API module: `src/api/xxxApi.ts`
- [ ] Component/Page

## Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Oracle sequence gap | LOW | LOW | allocationSize=1 |
| ACS timeout | MEDIUM | HIGH | try-catch + ErrorCode |
| ... | | | |

## Acceptance Criteria

<!-- condensed from source -->

