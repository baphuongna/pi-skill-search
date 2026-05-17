---
name: vetc-tdd
description: PROACTIVELY activate khi viết test cho service/controller/component mới, fix regression, hoặc khi cần tăng coverage. JUnit + Mockito + WireMock + RestAssured. Target 80%+ coverage.
---

# VETC Test-Driven Development

Viết test trước implementation. Test từ Spec → code đúng ngay lần đầu.

<HARD-GATE>

## THE IRON LAW

**NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

This is not a suggestion. This is not "best practice." This is the LAW.

1. You MUST write a failing test before ANY production code.
2. The test MUST fail for the RIGHT reason (not a compile error).
3. You MUST see the test FAIL before writing implementation.
4. ONLY THEN write the MINIMAL code to make it pass.

</HARD-GATE>

## When to Activate

- Viết test cho service, controller, hoặc component mới
- Fix regression — thêm test trước khi sửa bug
- Code review yêu cầu thêm test
- Cần boost coverage

## Do NOT Activate When

- Spike/prototype code (chưa cần test) → nhưng phải add tests trước khi merge
- Config files, documentation changes → không cần unit test
- Hotfix khẩn cấp (fix trước, add test ngay sau) → nhưng PHẢI add test trong cùng PR
- Chỉ sửa styling/CSS, không affect logic

## Rationalization Prevention

See: `./references/rationalizations.md` (11 common TDD rationalizations and why they're wrong)

## Good vs Bad Test Patterns

<Good>
```java
// GOOD: Test name describes behavior, not implementation
@Test
public void givenInsufficientBalance_whenTransfer_thenThrowWithCorrectErrorCode() {
    // Arrange
    Wallet wallet = Wallet.builder().balance(BigDecimal.ZERO).build();
    when(walletRepo.findByUserId(USER_ID)).thenReturn(Optional.of(wallet));

    // Act & Assert
    assertThatThrownBy(() -> service.transfer(transferRequest))
        .isInstanceOf(CustomizeException.class)
        .hasFieldOrPropertyWithValue("errorCode", "INSUFFICIENT_BALANCE");

## Testing Anti-Patterns

| Anti-Pattern | Why It's Bad | Fix |
|-------------|-------------|-----|
| Testing private methods | Breaks on refactor | Test through public API |
| Mocking what you own | Couples test to impl | Use real instances or fakes |
| `verify(mock).call()` everywhere | Over-specified mocks | Only verify interactions that matter |
| `Thread.sleep()` in tests | Flaky, slow | Use `awaitility` or `assertEventually` |
| Ignoring test failures | False confidence | Fix the test, fix the code, or delete the test |
| Snapshot testing everything | Brittle, meaningless | Snapshot only stable output (contracts) |

## VETC Test Infrastructure

```
Backend:
  JUnit 4 hoặc 5 (detect từ pom.xml)
  Mockito — mock dependencies
  Spring Boot Test — integration slice
  RestAssured — HTTP testing
  WireMock — mock external services (port 8488)
  AssertJ — fluent assertions

Frontend:
  Jest + React Testing Library
  @testing-library/jest-dom
  User-event — simulate interactions
```

## Goal Transformation (từ Karpathy)

Trước khi bắt đầu TDD, biến task mơ hồ thành verifiable goals:

| Imperative Task | Verifiable Goal |
|----------------|-----------------|
| "Add validation" | "Write tests cho invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test reproduces the bug, then make it pass" |
| "Add error handling" | "Write tests cho mỗi error scenario trong spec, then handle" |
| "Refactor X" | "Tests hiện tại vẫn pass sau khi refactor" |
| "Improve performance" | "Benchmark trước/sau: Xms → Yms, tests vẫn pass" |

**Multi-step Verification Plan** (cho mỗi task):
```
1. [Step] → verify: [check]

## TDD Workflow

```
RED   → Write failing test (từ Spec acceptance criteria)
         SEE IT FAIL — confirm failure reason is correct
GREEN → Write MINIMAL implementation để pass test
         No gold-plating. No "might need later."
REFACTOR → Clean up, verify coverage ≥ 80%
           Run ALL tests after refactor. Every time.
```

<!-- condensed from source -->

