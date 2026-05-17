---
name: vetc-docgen
description: PROACTIVELY activate khi implement xong API mới và trước khi merge — sinh Swagger/OpenAPI annotations, update CHANGELOG, generate technical note từ spec + code diff. Đảm bảo docs luôn đồng bộ với implementation.
---

# VETC DocGen — Keep Docs in Sync with Code

Sau khi implement xong, tự động sinh Swagger annotations, CHANGELOG entry, technical notes từ spec + code diff. Không để docs drift khỏi implementation.

## When to Activate

- API mới implement xong, chuẩn bị merge — cần Swagger docs
- Breaking change / API contract thay đổi — CHANGELOG entry
- Release chuẩn bị cut — generate release notes từ commits
- Onboarding doc cho service mới — technical overview
- Post-implementation documentation catch-up

## Do NOT Activate When

- Code chưa implement xong — docs sẽ lệch
- Pure refactor không thay signature — no new API doc needed
- Internal helper class — không cần javadoc đầy đủ
- Spec chưa approved — doc content sẽ thay đổi

## Scope of DocGen

### 1. Swagger / OpenAPI Annotations

For Spring Boot Controllers:

```java
@RestController
@RequestMapping("/wallet/v1")
@Tag(name = "Wallet", description = "Wallet transfer and balance operations")
public class WalletController {

    @Operation(
        summary = "Transfer money between wallets",
        description = "Debit source wallet and credit target wallet atomically. " +
                      "Requires Smart OTP for amounts > 500,000 VND.",
        responses = {

## [1.2.0] - 2026-04-17

### Added
- `POST /wallet/v1/transfer` — atomic transfer between wallets with idempotency (VETC-123)
- Smart OTP integration for transfers > 500K VND (VETC-128)

### Changed
- `POST /wallet/v1/balance` response now includes `availableBalance` field (VETC-135)
  - **Breaking for consumers** relying on exact field list — add `availableBalance` handler

### Fixed
- Race condition in `ReconcileService.matchTransactions()` when duplicate keys (VETC-142)

### Security
- Upgraded Spring Boot 3.2.0 → 3.2.4 (CVE-2024-XXXX patched)

### Deprecated
- `POST /wallet/v1/transfer-simple` — will be removed in 2.0.0. Use `/transfer` with `skipOtp=false`.
```

### 3. Technical Note (from Spec + Diff)

When implementing non-trivial feature, generate:

```markdown
# Technical Note: Smart OTP for High-Value Transfers

**Feature**: VETC-128
**Author**: {dev}
**Date**: 2026-04-17
**Status**: Implemented

## Context
Transfer > 500K VND requires 2FA. Previous impl used SMS OTP (cost + delay).
New: Smart OTP via app push (free, <2s delivery).

## Implementation Summary
- New `SmartOtpService` generates TOTP seed on device registration
- Transfer endpoint validates OTP via Redis-stored challenge
- Fallback to SMS if Smart OTP unavailable (device offline > 5min)

## Key Files
- `wallet-service/src/main/java/vn/vetc/wallet/service/SmartOtpService.java` (new)
- `wallet-service/src/main/java/vn/vetc/wallet/controller/WalletController.java` (modified)
- `infra-service/src/main/java/vn/vetc/infra/OtpConfig.java` (modified)

## API Changes
| Endpoint | Change | Breaking? |
|----------|--------|-----------|
| POST /wallet/v1/transfer | Added `otpType: SMART\|SMS` | No (default: SMART) |
| POST /otp/v1/verify | Added `challengeId` field | No |

## Database Changes
- New table: `WALLET_OTP_CHALLENGE` (Redis-backed, TTL 300s)
- No schema migration needed

## Rollout Plan
1. Feature flag `vetc.feature.smart-otp.enabled=false` in prod
2. Enable for 5% users (A/B test)
3. Monitor error rate, OTP delivery success
4. Full rollout after 48h stable

## Rollback
- Disable feature flag → falls back to SMS OTP
- No schema rollback needed
```

