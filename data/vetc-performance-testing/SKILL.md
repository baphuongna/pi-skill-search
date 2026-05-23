---
name: vetc-performance-testing
description: PROACTIVELY activate khi cần load/performance test cho API mới, regression test sau optimization, hoặc capacity planning. k6/JMeter integration, SLA thresholds, VETC-specific scenarios (transfer/reconcile/OTP).
---

# VETC Performance Testing — Load & Stress Validation

Viết và chạy performance tests cho VETC APIs với k6 (default) hoặc JMeter. Đảm bảo p95/p99 latency, throughput, error rate đạt SLA trước production.

## When to Activate

- API mới cần load test trước go-live (SLA validation)
- Regression test sau performance optimization
- Capacity planning — xác định breakpoint (max RPS, CPU/memory ceiling)
- Suspect hot path issue — transfer/reconcile/eKYC endpoints
- Pre-release smoke performance check
- Baseline vs release comparison (p95 shift > 20% → investigate)

## Do NOT Activate When

- Code chưa merge — không load test on dev branch (noise)
- Không có staging environment — performance test trên prod = bad idea
- Không có rõ SLA target — đo gì để so sánh?
- Unit/integration test thất bại — fix correctness trước performance

## Core Concepts

### SLA Thresholds (VETC default)

| Tier | Endpoint Type | p95 Target | p99 Target | Error Rate |
|------|---------------|-----------|-----------|------------|
| **Tier 0 (critical)** | Payment/Transfer | < 300ms | < 800ms | < 0.1% |
| **Tier 1 (core)** | Balance/OTP/KYC | < 500ms | < 1500ms | < 0.5% |
| **Tier 2 (support)** | Report/Query | < 1500ms | < 3000ms | < 1% |
| **Batch** | Reconcile/Settlement | < 30min/batch | N/A | < 0.5% |

### Load Profiles

- **Smoke**: 1 VU × 1 minute — sanity check
- **Average**: 50 VU × 15 minutes — typical load
- **Stress**: ramp 0 → 500 VU × 30 minutes — find breakpoint
- **Spike**: 10 → 200 VU × 30s, hold 3 min, drop back — burst handling
- **Soak**: 100 VU × 2 hours — memory leak / connection pool exhaustion

## k6 Template Structure

```
perf-tests/
├── config/
│   ├── env.dev.json
│   ├── env.staging.json
│   └── thresholds.js
├── scenarios/
│   ├── transfer-smoke.js
│   ├── transfer-load.js
│   ├── reconcile-batch.js
│   └── otp-spike.js
├── helpers/
│   ├── auth.js           (Keycloak token fetcher)

## Core k6 Template — Transfer Load Test

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { getToken } from '../helpers/auth.js';
import { randomTransferRequest } from '../helpers/data-generator.js';

// Custom metrics
const transferSuccessRate = new Rate('transfer_success');
const transferDuration = new Trend('transfer_duration', true);

export const options = {
  scenarios: {

## Helpers — Auth & Data Generator

```javascript
// helpers/auth.js
import http from 'k6/http';
export function getToken(username, password) {
  const res = http.post(
    `${__ENV.KEYCLOAK_URL}/realms/vetc/protocol/openid-connect/token`,
    {
      grant_type: 'password',
      client_id: 'vetc-perf-test',
      username: username,
      password: password,
    }
  );

## Workflow

### Step 1 — Define SLA

```
Endpoint: POST /wallet/v1/transfer
Target SLA:
  - p95 < 300ms (Tier 0)
  - p99 < 800ms
  - Error rate < 0.1%


