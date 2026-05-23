---
name: vetc-runbook
description: PROACTIVELY activate khi debug incident, runtime error, hoặc production issue. Investigation flow, common error patterns cho VETC stack, structured report output.
---

# VETC Runbook — Incident & Debug Guide

Runbook cho common issues trong VETC E-Wallet system.

## When to Activate

- Runtime error trong production hoặc staging
- Incident cần investigation
- Debug issue không rõ root cause
- Performance degradation
- User nói: "debug", "investigate", "runbook", "troubleshoot"

## Do NOT Activate When

- Tạo tính năng mới, không phải debug/investigate (dùng SDLC skills)
- Chỉ cần code review (dùng reviewer agents)
- Issue chỉ xảy ra 1 lần, không cần structured investigation

## Investigation Flow

```
1. Triage → Phân loại severity
2. Gather → Thu thập logs, traces, data
3. Hypothesize → Đưa ra hypotheses (top 3)
4. Test → Verify từng hypothesis
5. Fix → Apply minimal fix
6. Verify → Confirm fix resolves issue
7. Report → Structured post-mortem
```

## Common Error Patterns

### Category 1 — Database Issues

| Symptom | Likely Cause | Investigation |
|---------|-------------|---------------|
| `ORA-00001: unique constraint` | Duplicate insert | Check idempotency key, sequence value |
| `ORA-02291: integrity constraint` | FK reference missing | Check parent record exists |
| `ORA-12899: value too large` | Column overflow | Check string length vs column size |
| Slow query | Missing index / bad plan | `EXPLAIN PLAN FOR <query>` |
| Deadlock | Lock ordering | Check `@Transactional` scope |

### Category 2 — External Service Issues

| Symptom | Likely Cause | Investigation |
|---------|-------------|---------------|
| ACS timeout | Network / ACS down | Check Feign timeout config, ACS health |
| Bank GW 500 | Invalid request format | Compare request with spec, check encoding |
| eKYC rejection | Invalid image / session expired | Check image quality, session timeout |
| RabbitMQ message stuck | Consumer error / queue full | Check consumer logs, queue depth |

### Category 3 — Authentication Issues

| Symptom | Likely Cause | Investigation |
|---------|-------------|---------------|
| 401 Unauthorized | Token expired / invalid | Check JWT expiry, issuer, audience |
| 403 Forbidden | Role mismatch | Check user role vs required role |
| OTP verify fail | OTP expired / wrong attempt | Check OTP generation time, attempt count |

### Category 4 — Frontend Issues

| Symptom | Likely Cause | Investigation |
|---------|-------------|---------------|
| White screen | JS error / route missing | Check browser console, network tab |
| API 404 | Wrong URL / base URL | Check Axios config, API path |
| State not updating | Stale closure / wrong selector | Check Redux devtools, useEffect deps |

## Report Format

```markdown
# Incident Report: [Title]
**Date**: [date]
**Severity**: P1 / P2 / P3
**Status**: INVESTIGATING / FIXED / MONITORING

## Timeline
- [HH:MM] Symptom detected
- [HH:MM] Investigation started
- [HH:MM] Root cause identified
- [HH:MM] Fix applied
- [HH:MM] Verified

## Root Cause
[1-2 câu]

## Fix
[What was changed, file:line]

## Prevention
[What to add to prevent recurrence]

## Lessons Learned
[Key takeaway]
```

## Gotchas

1. **Fix symptoms not root cause** → 500 error do ACS timeout, nhưng root cause là network config. Luôn trace đến root.

2. **Logging quá nhiều** → Log flood che mất signal. Tìm theo correlation ID hoặc timestamp cụ thể.

3. **Assume external service OK** → Luôn verify external service health trước khi investigate internal logic.

4. **Skip reproduction** → Luôn reproduce locally trước khi fix. "Fix" mà không reproduce = blind fix.

5. **Not checking recent deployments** → Kiểm tra `git log --oneline -10` xem có deploy nào gần đây gây vấn đề.

## References

- Architecture profiles: `../../shared/architecture-profiles.md`



