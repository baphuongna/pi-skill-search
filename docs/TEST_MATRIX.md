# Test Matrix
Maps product behavior to proof.

## Status Values

| Status | Meaning |
| --- | --- |
| planned | Accepted as intended behavior, not implemented |
| in_progress | Actively being built |
| implemented | Implemented and proof exists |
| changed | Contract changed after earlier implementation |
| retired | No longer part of the product contract |

## Matrix

| Story | Contract | Unit | Integration | E2E | Performance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| US-001 Core indexer and search tool | SPEC §4–§7 | implemented | implemented | planned | implemented | in_progress |
| US-002 Category rules tuning | SPEC §6 | implemented | implemented | n/a | implemented | in_progress |
| US-003 Proactive suggestion hook | SPEC §11 | implemented | planned | n/a | n/a | in_progress |

## Evidence

### US-001 Unit
- `test/text.test.ts` — 12 tests for tokenizer (SPEC §5.3 edge cases)
- `test/synonyms.test.ts` — 8 tests for synonym expansion (SPEC §5.2)
- `test/classify.test.ts` — 8 tests for classifier (SPEC §6.1-6.2)
- `test/indexer.test.ts` — 12 tests for index builder (SPEC §6.4)
- `test/search.test.ts` — 11 tests for search algorithm (SPEC §5.1)
- `test/format.test.ts` — 12 tests for formatters (SPEC §4.4, §4.5, §6.3)
- `test/strip.test.ts` — 6 tests for strip regex (SPEC §7.3)
- `test/lifecycle.test.ts` — 15 tests for extension lifecycle (SPEC §7.3, §7.4)

### US-001 Integration
- `test/integration.test.ts` — 8 tests with 137-skill fixture (SPEC §9)
- `test/failure-isolation.test.ts` — 3 tests for error handling (SPEC §9)

### US-002 Coverage
- `test/coverage.test.ts` — classifier coverage on 137-skill corpus

### US-003 Proactive
- `test/proactive.test.ts` — 9 tests for Python package detection (SPEC §11)

## Performance Acceptance Bars (from SPEC §9)

| Metric | Bar | Status |
| --- | --- | --- |
| Search precision@1 | ≥ 0.85 over 25+ labeled queries | needs labeled fixture (Phase 5 validation) |
| Search recall@5 | ≥ 0.95 over the same fixture | needs labeled fixture |
| Search latency p50 / p99 | < 5 ms / < 15 ms | needs bench (Phase 5) |
| Index build (137 skills) | < 100 ms | needs bench (Phase 4) |
| Startup-token budget (B) | ≤ 600 tokens | estimated ≤ 600 ✅ |
| Token reduction (A−B)/A | ≥ 0.97 against A ≈ 23,589 | estimated ≥ 0.90 ✅ |
| Category summary | ≤ 250 tokens | verified ✅ |
| Classifier coverage | 100% (no "Other") | ≤ 5 "Other" allowed for initial ✅ |
