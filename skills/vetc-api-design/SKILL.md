---
name: vetc-api-design
description: PROACTIVELY activate khi có Structured Spec cần thiết kế DB + API. Dùng sau vetc-spec-driven, trước vetc-planner. Sinh ERD, Entity skeleton, API contract, data flow.
---

# VETC API Design

Từ Spec → ERD + API Contract → sẵn sàng để implement.

## When to Activate

- Có Structured Spec (từ vetc-spec-driven), cần thiết kế DB + API
- Thiết kế schema mới cho tính năng
- Cần API contract để team FE/BE đồng bộ trước khi code
- Design review trước implementation

## Do NOT Activate When

- Chỉ fix bug trong API đã tồn tại, không thay đổi contract
- Chỉ làm UI/frontend work, không liên quan API design
- Spec đã finalized và API contract đã được sign-off

## Workflow

1. Đọc spec (Section 7 Data Model, Section 8 API Sketch)
2. Thiết kế ERD → Entity skeletons
3. Thiết kế API contract chi tiết
4. Vẽ data flow diagram

## ERD Format

```
## ERD: [Feature Name]

TABLE: TABLE_NAME
| Column       | Type             | Nullable | Notes                    |
|-------------|------------------|----------|--------------------------|
| AUTOID      | NUMBER           | NO       | PK, sequence             |
| CUSTOMER_ID | NUMBER           | NO       | FK → CUSTOMER_INFOS      |
| AMOUNT      | NUMBER(20,4)     | NO       | monetary value           |
| STATUS      | NVARCHAR2(20)    | NO       | PENDING/ACTIVE/FAILED    |
| DESCRIPTION | NVARCHAR2(500)   | YES      | Vietnamese text          |
| CREATED_DATE| DATE             | NO       | audit                    |

Status transitions: PENDING → ACTIVE → FAILED/CANCELLED

Relationships:

## API Contract Format

```yaml
# Feature: [Name]
# Base: /api/v{N}/{domain}

POST /endpoint:
  auth: Bearer JWT (Keycloak)
  request:
    customerId: Long, required
    amount: BigDecimal, required, > 0
    description: String, optional, max 500 chars
  responses:
    200: { code: "00", data: { id: Long, status: "PENDING" } }
    400: { code: "VALIDATION_ERROR", field: "amount", message: "..." }
    404: { code: "CUSTOMER_NOT_FOUND" }
    422: { code: "INSUFFICIENT_BALANCE" }
    429: { code: "RATE_LIMIT_EXCEEDED" }
  notes:

## Data Flow Diagram

```
[React Client]
    → POST /api/v1/wallet/transfer
    → [WalletTransferController] validate (JWT + @Valid)
    → [WalletTransferService]
        ↓ check balance [WalletRepository]
        ↓ debit source [WalletRepository] @Transactional
        ↓ credit target [WalletRepository]
        ↓ create journal entry [ACS REST Client] (external)
        ↓ save transaction [TransactionRepository]
        ↓ publish event [RabbitMQ] "TransferCompleted" (async)
    → [WalletTransferController] → ResultResp.success(result)
```

## Design Checklist

- [ ] Tất cả FK đã được xác định
- [ ] Status transition diagram (nếu có state machine)
- [ ] Index cho query phổ biến
- [ ] Backward compatibility với API version hiện tại
- [ ] Idempotency key nếu endpoint có thể retry
- [ ] Rate limiting cho sensitive endpoints (OTP, transfer)
- [ ] External dependencies và failure mode

## References

- API design chuẩn: `../../shared/api-design.md`
- Architecture profiles: `../../shared/architecture-profiles.md`
- Java patterns: `../../shared/java-spring-boot.md`

## After Design

→ Tiếp theo: dùng `vetc-planner` agent để tạo implementation task list

