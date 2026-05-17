---
name: vetc-continuous-learning
description: PROACTIVELY extract reusable patterns từ sessions — khi phát hiện recurring bug, project-specific workaround, hoặc debugging technique hiệu quả. Instinct-based learning v2 với confidence scoring, project scoping, và automatic promotion.
---

# VETC Continuous Learning v2

Instinct-based learning system: observe → detect → create/update → evolve. Biến session knowledge thành atomic "instincts" với confidence scoring.

## When to Activate

- Phát hiện recurring bug pattern (xuất hiện 2+ lần)
- Tìm workaround cho framework issue
- Discover VETC domain-specific pattern đáng nhớ
- Debugging technique hiệu quả cần reuse
- Configuration pattern phức tạp đã giải quyết
- Instinct observer hook phát hiện pattern tự động
- **HARNESS_BACKLOG entries** có status `accepted` → candidate for skill creation

## Do NOT Activate When

- Bug chỉ xuất hiện 1 lần, chưa recurrent → dùng `vetc-systematic-debugging`
- Pattern chỉ áp dụng cho 1 project cụ thể, không reusable
- Đã có skill chính thức cover pattern đó → extend skill, không tạo instinct
- Đang implement code, chưa ở phase review/reflection

## V2 Architecture: Instincts

### What is an Instinct?

Instinct là atomic learned behavior — nhỏ hơn skill, lớn hơn rule. Mỗi instinct có:

```
{
  id: "inst_1713288000000_abc123",
  pattern: "Oracle NVARCHAR2 cần @Nationalized annotation",
  action: "Thêm @Nationalized cho Oracle NVARCHAR2 columns",
  category: "code",          // code | debug | workflow | domain
  scope: "project",           // project | global
  projectId: "abc123",        // hash của git remote URL
  confidence: 0.7,            // 0.3-0.9
  source: "edit-observation", // session | edit-observation | bash-observation | manual
  uses: 3,                    // times applied

### Confidence Scoring

| Score | Meaning | Trigger |
|-------|---------|---------|
| 0.3 | Tentative — observed once, unverified | First observation |
| 0.5 | Noted — observed, seems useful | 2 observations |
| 0.7 | Reliable — used successfully 3+ times | 3+ uses with ≥60% hit rate |
| 0.9 | Core — consistently useful, promoted to global | 5+ uses with ≥80% hit rate |

### Scopes

- **project**: Instinct chỉ apply cho current project (stored in `~/.vetc/instincts/project-{id}.json`)
- **global**: Instinct apply cho tất cả projects (stored in `~/.vetc/instincts/global.json`)

### Promotion Pipeline

```
Observation → project instinct (0.3) → use → confidence grows → promote to global (0.7+)
```

Instinct tự động promote khi:
- Confidence ≥ 0.7
- Uses ≥ 5
- Hit rate ≥ 70%

## Learning Sources

### 1. Hook Observation (Automatic)

`instinct-observer.js` hook tự động detect patterns từ Edit/Write/Bash tool use:
- Edit patterns: @Nationalized, @Transactional, validation annotations, parameterized queries
- Write patterns: new Controller/Service/Repository creation
- Bash patterns: dependency investigation, git grep, curl testing

Rate limit: max 5 new instincts per session (avoid noise).

### 2. Manual Extraction (`/vetc-learn`)

User-triggered pattern extraction:
1. Scan conversation cho patterns
2. Classify theo 4 types
3. Tìm unique insight
4. Create instinct với higher confidence (0.5)

### 3. Session End Review

Khi session kết thúc, review instincts created:
- Show summary: new instincts, reinforced instincts
- Suggest promotions if applicable

## Instinct Categories

| Category | Trigger | Example |
|----------|---------|---------|
| **code** | Implementation pattern | Oracle NVARCHAR2 cần @Nationalized |
| **debug** | Troubleshooting technique | Feign 503 → check ACS health endpoint |
| **workflow** | Process/procedure | Journal entry: validate → reserve → create → confirm |
| **domain** | Business logic insight | Smart OTP có 2 phases với khác session type |
| **security** | Security pattern | Sensitive URL params cần encode |

## Commands

### Check Status

```
/instinct-status
```
Show: total instincts, by category, avg confidence, top 5 instincts.

### Evolve Instincts

```

<!-- condensed from source -->

