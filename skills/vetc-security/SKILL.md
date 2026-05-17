---
name: vetc-security
description: PROACTIVELY scan OWASP Top 10 trước khi merge PR chứa auth/payment/user data, hoặc trước Pentest/UAT. Không edit code — chỉ report findings với fix recommendations.
---

# VETC Security Review

OWASP Top 10 scan tập trung vào VETC-specific attack vectors.

## When to Activate

- Trước khi mở PR chứa authentication, payment, user data
- Trước Pentest / UAT
- Code review yêu cầu security check
- Thêm endpoint mới, external integration mới

## Do NOT Activate When

- Chỉ fix UI/layout, không liên quan security → dùng `vetc-frontend-patterns`
- Code review general (không phải security-focused) → dùng `vetc-review`
- Đã có security review gần đây, chỉ refactor nhỏ không affect security
- Task chỉ liên quan đến documentation, không code changes

## OWASP Checklist — VETC Context

### A01: Broken Access Control

FAIL: No ownership check — any user can access any account:
```java
// NGUY HIỂM — IDOR
@GetMapping("/{id}")
public ResponseEntity<?> getById(@PathVariable Long id) {
    return ResponseEntity.ok(service.findById(id)); // No ownership check!
}
```

PASS: Verify user owns the resource:
```java
// AN TOÀN — Ownership verified
@GetMapping("/{id}")

### A02: Cryptographic Failures

FAIL: Hardcoded secret in source code:
```java
// NGUY HIỂM — Secret lộ trong git
private static final String API_KEY = "sk-proj-abc123xyz";
String token = JwtUtils.encode(payload, "my-secret-key");
```

PASS: Secrets from environment, secure algorithm:
```java
// AN TOÀN — Environment variable + RS256
@Value("${jwt.private-key-path}") private Resource keyResource;
PrivateKey key = KeyFactory.getInstance("RSA")
    .generatePrivate(new PKCS8EncodedKeySpec(keyResource.getInputStream().readAllBytes()));

### A03: Injection (Critical for Oracle)

FAIL: SQL injection via string concatenation:
```java
// NGUY HIỂM — SQL Injection
"SELECT * FROM T WHERE NAME = '" + userInput + "'"
```

PASS: Parameterized query prevents injection:
```java
// AN TOÀN — Parameterized
@Query("... WHERE NAME = :name")
void find(@Param("name") String name);
```
- [ ] Mọi native query đều dùng `:param` placeholder?
- [ ] JdbcTemplate dùng `?` không dùng concat?
- [ ] Log injection: user input không log trực tiếp?

### A04: Insecure Design

FAIL: No idempotency — duplicate transfers possible:
```java
// NGUY HIỂM — Double-spend nếu network retry
public TransferResponse transfer(TransferRequest req) {
    wallet.setBalance(wallet.getBalance().subtract(req.getAmount()));
    walletRepo.save(wallet);
    // No idempotency check — retry = double charge!
}
```

PASS: Idempotency key prevents duplicates:
```java
// AN TOÀN — Idempotency gate

### A05: Security Misconfiguration

FAIL: Wildcard CORS + exposed actuator on production:
```java
// NGUY HIỂM — CORS mở rộng, actuator lộ cấu hình
@CrossOrigin("*")
@RestController
public class WalletController { ... }

// application-prod.yml
management:
  endpoints:
    web:
      exposure:
        include: "*"  // /actuator/env, /heapdump public!

### A07: Auth Failures

FAIL: OTP không có expiry + brute-force possible:
```java
// NGUY HIỂM — OTP không hết hạn, không giới hạn retry
public boolean verifyOtp(String phone, String otp) {
    String stored = redis.get("otp:" + phone);
    return otp.equals(stored); // No expiry check, no attempt limit!
}
```

<!-- condensed from source -->

