---
name: vetc-sast
description: PROACTIVELY activate trước mỗi release/PR merge để chạy static application security testing — Trivy (container/deps), OWASP Dep-Check (CVE), SonarQube (code smells + security), Semgrep (custom rules). Không edit code — chỉ report + triage.
---

# VETC SAST — Static Application Security Testing

Automated scan CVE, dependency vulnerabilities, code-level security issues, container image risks TRƯỚC khi merge/release. Triage findings: critical/high → block, medium/low → track.

## When to Activate

- PR merge candidate — final security gate
- Pre-release (release candidate tag) — full SAST sweep
- Dependency update (renovate/dependabot PR) — verify no new CVEs
- Container image build — scan Docker layers
- After `vetc-security` review — automated SAST complements manual review
- Quarterly audit — full baseline scan

## Do NOT Activate When

- Local dev iteration — SAST too slow for tight loop (use IDE linters)
- Documentation-only PR — no code/deps changed
- Hotfix in emergency — note as debt, scan within 24h
- Private/internal tool with no external exposure — lower priority

## Tools & Coverage Matrix

| Tool | Target | Runs in | Fail threshold |
|------|--------|---------|----------------|
| **OWASP Dep-Check** | Maven/npm deps | CI (PR) | CVE CVSS ≥ 7.0 |
| **Trivy** | Docker image, IaC | CI (release) | CRITICAL, HIGH |
| **SonarQube** | Java/TS source | CI (merge main) | Security Hotspots = 0 new |
| **Semgrep** | Custom VETC rules | CI (PR) | ERROR severity = 0 |
| **Secret scan** | Git history | pre-commit + CI | Any match |
| **npm audit** | Node packages | CI (PR on FE) | HIGH, CRITICAL |

## Workflow

### Step 1 — Identify Scope

Read git diff to identify scan targets:
- `pom.xml` / `package.json` changed → dep scan
- `Dockerfile` / IaC changed → container/IaC scan
- `.java` / `.ts` changed → code scan
- New file added → secret scan (full)

### Step 2 — Run Scans (Parallel)

```bash
# 1. OWASP Dep-Check (Maven)
mvn -q dependency-check:check -DfailBuildOnCVSS=7 -Dformat=HTML -DnvdApiKey=$NVD_API_KEY

# 2. Trivy (Docker image)
trivy image --severity CRITICAL,HIGH --exit-code 1 \
  --format json -o trivy-report.json \
  vetc/wallet-service:${VERSION}

# 3. Trivy (filesystem - IaC)
trivy fs --scanners vuln,misconfig,secret --severity CRITICAL,HIGH .

# 4. SonarQube scan (post-build)
mvn -q sonar:sonar \
  -Dsonar.host.url=$SONAR_URL \
  -Dsonar.projectKey=vetc-wallet \
  -Dsonar.login=$SONAR_TOKEN

# 5. Semgrep custom rules
semgrep --config=.semgrep/vetc-rules.yml --error .

# 6. Secret scan (gitleaks)
gitleaks detect --source . --no-git --exit-code 1
```

### Step 3 — Aggregate & Triage

For each finding, classify:

| Level | Action |
|-------|--------|
| **CRITICAL** (CVSS 9.0-10) | BLOCK merge. Fix/upgrade immediately or isolate usage. |
| **HIGH** (CVSS 7.0-8.9) | BLOCK merge. Fix in same PR or separate hotfix PR. |
| **MEDIUM** (CVSS 4.0-6.9) | Track in backlog. Fix within sprint. Do not block merge unless payment/auth. |
| **LOW** (CVSS 0.1-3.9) | Track in backlog. Fix opportunistically. |
| **INFO** (hardening recommendation) | Note in tech-debt file. |

VETC-specific escalation (force to HIGH regardless of CVSS):
- Any finding in `auth-service`, `payment-gateway`, `wallet-service` core
- SQL injection in native query (even if param)

### Step 4 — Create Triage Report

Location: `security/sast-reports/{YYYY-MM-DD}-{branch}.md`

```markdown
# SAST Report - feature/smart-otp - 2026-04-17

## Summary
| Tool | Total | Critical | High | Medium | Low |
|------|-------|----------|------|--------|-----|
| OWASP Dep-Check | 3 | 0 | 1 | 2 | 0 |
| Trivy Image | 8 | 0 | 0 | 5 | 3 |
| SonarQube | 15 | 0 | 2 | 8 | 5 |
| Semgrep | 1 | 0 | 1 | 0 | 0 |

## Critical/High Findings

### 1. [HIGH] CVE-2024-12345 — jackson-databind 2.13.0
**File**: `pom.xml:45`
**Description**: Deserialization vulnerability in jackson-databind < 2.15.2
**Fix**: Upgrade to 2.15.2+
**Owner**: backend-lead
**Due**: Before merge

### 2. [HIGH] Semgrep — SQL injection in NativeQueryBuilder
**File**: `wallet-service/src/main/java/vn/vetc/wallet/repo/TransactionRepo.java:87`
**Description**: String concatenation in `WHERE account_no = '" + accountNo + "'"`
**Fix**: Use `setParameter("accountNo", accountNo)`

<!-- condensed from source -->
```
