---
name: vetc-iterative-retrieval
description: PROACTIVELY activate khi subagent cần progressive context refinement — khi kết quả ban đầu không đủ thông tin, cần tìm kiếm sâu hơn. 4-phase DISPATCH→EVALUATE→REFINE→LOOP pattern cho high-quality context retrieval.
---

# VETC Iterative Retrieval

Structured pattern cho progressive context refinement trong subagents. Thay vì tìm kiếm 1 lần và chấp nhận kết quả, iterative retrieval cho phép refine queries dựa trên kết quả trước.

## When to Activate

- Subagent trả về kết quả surface-level, cần deep-dive
- Research task cần cross-reference multiple sources
- Code search trả về quá nhiều hoặc quá ít kết quả
- Cần verify thông tin từ nhiều góc độ
- Agent nhận được kết quả nhưng relevance thấp

## Do NOT Activate When

- Single search đã trả về kết quả chính xác → không cần iterative loop
- Đã biết chính xác file/function cần xem → đọc trực tiếp
- Task không liên quan research/explore (code implementation, bug fix)
- Timeline gấp, không có thời gian cho multi-pass retrieval

## Core Pattern: DISPATCH → EVALUATE → REFINE → LOOP

### Phase 1: DISPATCH

Gửi initial query đến data source (code search, web search, file read).

```
Input: { query, sources, context }
Output: { rawResults, metadata }
```

**Rules:**
- Query phải specific, include context về WHY cần thông tin
- Chỉ định sources rõ ràng: `codebase`, `web`, `docs`, `memory`
- Include rejection criteria: kết quả nào KHÔNG chấp nhận được

### Phase 2: EVALUATE

Đánh giá relevance của kết quả từ Phase 1.

```
Scoring:
  1.0  = Exactly what needed, complete answer
  0.7+ = Good match, partial answer, need minor bổ sung
  0.4+ = Related but tangential, need to narrow focus
  <0.4 = Not relevant, need completely different query
```

**Evaluation Criteria:**
- [ ] Kết quả trả lời trực tiếp câu hỏi?
- [ ] Code examples (nếu cần) present và runnable?

### Phase 3: REFINE

Nếu EVALUATE score < 0.7, refine query.

**Refinement Strategies:**

| Strategy | Khi nào dùng | Ví dụ |
|----------|-------------|-------|
| **Narrow** | Quá nhiều kết quả | "Spring Boot 3.2 JWT filter" → "Spring Boot 3.2 JwtAuthenticationFilter OncePerRequestFilter" |
| **Broaden** | Quá ít kết quả | "Oracle NVARCHAR2 @Nationalized VETC" → "Oracle NVARCHAR2 Hibernate annotation" |
| **Reframe** | Sai góc nhìn | "How to fix Feign 503" → "Feign client circuit breaker configuration" |
| **Decompose** | Query quá complex | "Implement payment reconciliation" → "1) Batch processing pattern 2) Mismatch detection 3) Settlement logic" |
| **Cross-ref** | Cần verify | Tìm trong codebase X, verify bằng docs Y |

### Phase 4: LOOP

Quay lại Phase 1 với refined query.

**Rules:**
- **Max 3 cycles** — sau 3 lần vẫn score < 0.7 → accept best result + flag gaps
- Mỗi cycle PHẢI thay đổi query — KHÔNG retry identical query
- Mỗi cycle ghi nhận: what changed, why, expected improvement

## Anti-Patterns (KHÔNG LÀM)

| Anti-Pattern | Tại sao sai | Thay thế |
|-------------|-------------|----------|
| Infinite loop | Waste tokens, no progress | Max 3 cycles |
| Same query retry | Won't produce different result | REFINE before re-dispatch |
| Accept first result blindly | Miss better answers | Always EVALUATE |
| Over-refine | Chase perfection | 0.7+ is good enough |
| Skip evaluation | Don't know if results help | Score every result |

## Agent Integration

### Khi spawn subagent cho research

```markdown
## Task
{mô tả task}

## Retrieval Protocol
Use iterative retrieval (max 3 cycles):
1. DISPATCH: search with specific query
2. EVALUATE: score results 0-1 (need 0.7+)
3. REFINE: adjust query if < 0.7
4. LOOP: retry with refined query

## Rejection Criteria
- Generic advice without VETC context
- Outdated patterns (pre-2024)
- No code examples for implementation tasks
- Only theoretical without practical application
```

