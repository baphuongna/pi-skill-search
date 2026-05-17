---
name: vetc-reconcile-patterns
description: PROACTIVELY activate khi implement reconciliation job, debug reconcile logic (mismatch, duplicate, missing), hoặc thêm nguồn đối soát mới. SourceProcessor, distributed locking, idempotency patterns.
---

# VETC Reconciliation Patterns

Patterns cho hệ thống đối soát VETC E-Wallet.

## When to Activate

- Implement reconciliation job hoặc processor mới
- Debug reconcile logic (mismatch, duplicate, missing)
- Thêm nguồn dữ liệu mới vào reconcile pipeline
- Review reconcile code

## Do NOT Activate When

- Làm tính năng không liên quan reconciliation (wallet, eKYC, commission, etc.)
- Chỉ làm frontend cho reconcile UI (dùng `vetc-frontend-patterns`)
- Chỉ viết unit test đơn giản, không cần reconcile domain knowledge

## Core Architecture

```
ReconcileScheduler (Quartz/Spring @Scheduled)
    ↓
ReconcileOrchestrator
    ├── SourceProcessorChain (Chain of Responsibility)
    │     ├── BankGwSourceProcessor
    │     ├── WalletSourceProcessor
    │     └── ACSSourceProcessor
    ↓
ReconcileEngine
    ├── MatchingStrategy (1:1, 1:N, N:M)
    ├── DiffCalculator
    └── ReconcileReportBuilder

## SourceProcessor Pattern

```java
public interface SourceProcessor {
    boolean canHandle(ReconcileContext context);
    List<ReconcileRecord> extract(ReconcileContext context);
}

// Chain implementation
@Service
@Slf4j
public class BankGwSourceProcessor implements SourceProcessor {
    @Override
    public boolean canHandle(ReconcileContext context) {
        return ReconcileType.BANK_GW.equals(context.getType());

## Distributed Locking (Redisson)

```java
// Ngăn duplicate job khi deploy nhiều instance
@Service
public class ReconcileOrchestratorImpl {

    @Autowired
    private RedissonClient redissonClient;

    public void runReconcile(ReconcileContext ctx) {
        String lockKey = "vetc:reconcile:" + ctx.getType() + ":" + ctx.getDateKey();
        RLock lock = redissonClient.getLock(lockKey);

        boolean acquired = false;

## Idempotency Pattern

```java
// Kiểm tra đã process chưa trước khi xử lý
public void processRecord(ReconcileRecord record) {
    String idempotencyKey = "vetc:recon:" + record.getTransactionRef();
    boolean isNew = redisTemplate.opsForValue()
        .setIfAbsent(idempotencyKey, "1", 24, TimeUnit.HOURS);
    
    if (!isNew) {
        log.debug("Already processed: {}", record.getTransactionRef());
        return;
    }
    // Process record...
}
```

## Matching Strategies

```java
public enum MatchResult {
    MATCHED,        // Khớp hoàn toàn
    AMOUNT_MISMATCH,// Ref khớp, amount khác
    NOT_FOUND,      // Có trong source, không có trong wallet
    DUPLICATE,      // Xuất hiện nhiều lần
    SETTLED_LATE    // Transaction đã settle sau cutoff
}
```

## Common Reconcile Issues

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Duplicate record | Idempotency key thiếu hoặc sai | Thêm idempotency check |
| Amount mismatch | Fee/VAT tính khác | Align fee calculation |
| Missing transaction | Timezone mismatch (UTC vs +07) | Normalize về UTC trước compare |
| Race condition | Multiple instances chạy cùng lúc | Redisson distributed lock |
| Memory spike | Load toàn bộ data vào RAM | Page-based processing |

## Coverage Targets

```
ReconcileEngine:        ≥ 85% (mandatory — core matching logic)
SourceProcessor (mỗi): ≥ 80% (mandatory)
ReconcileReportBuilder: ≥ 75% (recommended)
