---
name: vetc-refactoring
description: PROACTIVELY activate khi code smell xuất hiện, cần restructure không thay behavior — extract method/class, rename, replace conditional, strangler fig migration. KHÔNG kết hợp refactoring với feature work. Tests phải pass trước và sau.
---

# VETC Refactoring — Behavior-Preserving Restructure

Cải thiện cấu trúc code KHÔNG thay đổi behavior. Tests xanh → refactor → tests vẫn xanh. Inspired by Karpathy + Fowler refactoring catalog.

## When to Activate

- Code smell: long method, duplicate code, god class, feature envy, shotgun surgery
- Pre-change cleanup: "Make change easy, then make easy change" (Kent Beck)
- Post-ralph deslop pass — cleanup after implementation
- Strangler fig migration — gradually replace legacy component
- Rename signals: unclear names, ambiguous abbreviations
- Replace conditional with polymorphism (many if/else branches)
- Extract method (< 20-line method rule)
- Extract class (class > 200 lines or > 7 public methods)

## Do NOT Activate When

- **No tests exist** → Write tests FIRST (`vetc-tdd`), refactor AFTER
- **Mid-feature work** → Do not mix refactor + feature work. Finish feature, then refactor.
- **Code works + tests pass + readable** → don't refactor for the sake of it
- Red tests (failing) → Fix tests first, then consider refactor
- No user request and no code smell → "if it ain't broke, don't fix it"
- Architecture change needed (not refactor) → use `vetc-ralplan`



## Core Pattern: Red-Green-Refactor

```
RED (failing test, for new feature) — not our domain here
       ↓
GREEN (passing test)
       ↓
REFACTOR (this skill!)  ← structure improvement
       ↓
GREEN (still passing)
       ↓
Commit (atomic: "refactor(wallet): extract balance calculation")
```

## Refactoring Catalog (VETC-adapted)

### Method-level

| Refactoring | When | Example |
|-------------|------|---------|
| **Extract Method** | Method > 20 lines or does 2+ things | `processTransfer()` → extract `validateAmount()` + `debitAccount()` + `creditAccount()` |
| **Inline Method** | Trivial method (1-liner) only called once | Remove `private boolean isValid() { return amount > 0; }` inline |
| **Extract Variable** | Complex expression used multiple times | `BigDecimal fee = amount.multiply(FEE_RATE);` instead of inlining |
| **Inline Variable** | Variable is trivial alias | Remove `Long id = wallet.getId(); repo.find(id);` → `repo.find(wallet.getId())` |
| **Rename** | Unclear name | `process()` → `debitAndNotify()` |

### Class-level

| Refactoring | When | Example |
|-------------|------|---------|
| **Extract Class** | Class > 200 lines OR > 7 public methods OR multiple responsibilities | Split `WalletService` → `BalanceService` + `TransferService` + `NotificationService` |
| **Move Method** | Method uses another class more than own | Move `Money.compare(a, b)` from `WalletService` to `Money` entity |
| **Pull Up Field/Method** | Subclasses share field/method | Move common `@Column(name="created_at")` to `BaseEntity` |
| **Replace Inheritance with Delegation** | Inheritance not true "is-a" | `class OracleRepo extends BaseRepo` → `class OracleRepo { BaseRepo base; }` |

### Conditional logic

| Refactoring | When | Example |
|-------------|------|---------|
| **Replace Conditional with Polymorphism** | Many if/else based on type | `if (type == JE_DEBIT) ... else if (type == JE_CREDIT) ...` → `JournalEntryStrategy` with subclasses |
| **Introduce Null Object** | Null check scattered | `if (wallet == null) return zero` → `WalletEmpty` class returning zero |
| **Replace Magic Number** | `if (amount > 500000)` | `if (amount > OTP_THRESHOLD)` |
| **Decompose Conditional** | Complex condition with comment | Extract condition to `isHighRiskTransaction()` method |

### VETC-specific

| Refactoring | When | Example |
|-------------|------|---------|
| **Encapsulate Oracle sequence** | Multiple places call sequence directly | Create `SequenceGenerator` service with cached next-values |
| **Extract Feign client** | Inline RestTemplate/HTTP calls | Replace with typed Feign interface + `@FeignClient` |
| **Parameterize SQL** | String concat in native query | Replace `"WHERE id = " + id` with `"WHERE id = :id"` + setParameter |
| **Centralize PII masking** | Logger calls with CCCD/phone | Extract `PiiMasker.mask(cccd)` helper, use consistently |
| **Introduce Cache-Aside** | Repeated expensive queries | Wrap with Redis `@Cacheable` on service method |

### Strangler Fig (gradual legacy replacement)

When legacy component (monolithic `WalletServiceLegacy`) needs replacement:

```
Phase 1: Build new service in parallel (WalletService)
Phase 2: Route 5% traffic via feature flag
Phase 3: Monitor errors, increase to 50% if OK
Phase 4: 100% traffic to new
Phase 5: Delete legacy
```
