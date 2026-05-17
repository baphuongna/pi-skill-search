---
name: vetc-analyze-codebase
description: PROACTIVELY activate khi mới vào project, cần bản đồ kiến trúc, hoặc trước khi thiết kế API. Scan codebase → codebase-spec.md + data-model.md. Chạy 1 lần per project.
---

# VETC Analyze Codebase

Tạo "bản đồ kiến trúc machine-readable" của toàn bộ VETC project — để các skill khác (vetc-analyze-ba, vetc-api-design, vetc-java-patterns) bám theo khi implement.

## When to Activate

- Vào project VETC mới lần đầu
- Trước khi chạy `vetc-analyze-ba` (Phase 4 yêu cầu có codebase-spec.md)
- Trước khi thiết kế API mới hoặc refactor kiến trúc lớn
- Khi muốn có bản đồ codebase để AI không đoán mò về patterns, packages, conventions

## Do NOT Activate When

- Chỉ cần sửa 1 file đơn giản, không cần hiểu toàn bộ kiến trúc
- Requirement đã cụ thể và rõ ràng, không cần codebase analysis
- Chỉ fix bug cụ thể (dùng `vetc-runbook` hoặc `vetc-build-resolver`)

## Output Files

- `docs/architecture/codebase-spec.md` — Kiến trúc + conventions + modules + APIs
- `docs/architecture/data-model.md` — 5 Mermaid diagrams
- `docs/architecture/project-knowledge.md` — Entity registry, pattern catalog, lessons learned (optional, enhance over time)

## Workflow (7 Phases)

### Phase 1 — LOAD-SPEC
Nếu `docs/architecture/codebase-spec.md` đã tồn tại → đọc và merge (incremental). Tôn trọng sections đã đánh dấu completed.

### Phase 2 — COLLECT
```bash
# Tìm project config
Glob("**/pom.xml", "**/build.gradle", "**/application*.yml")

# Tìm Java classes
Grep("@RestController", src/main/java/) → danh sách controllers
Grep("@Service",        src/main/java/) → danh sách services
Grep("@Repository",     src/main/java/) → danh sách repositories
Grep("@Entity",         src/main/java/) → danh sách entities
Grep("@ControllerAdvice", src/main/java/) → exception handlers
```

### Phase 3 — INFER-ARCH
Từ kết quả collect, suy luận:
- `LAYERED` nếu có `controller/ + service/ + repository/` (flat packages)
- `HEXAGONAL` nếu có `application/ + domain/ + infrastructure/`
- Conventions: naming suffix, REST base path, response wrapper, injection style

#### 3.1 INFER-SECURITY
Detect auth pattern chi tiết:
```
Grep("SecurityFilterChain|WebSecurityConfigurerAdapter", src/) → filter chain class
Grep("@PreAuthorize|@Secured|@RolesAllowed", src/) → method-level auth
Grep("x-api-key|X-API-KEY|apiKey", src/) → API key auth
Grep("jwt|JWT|Bearer", src/) → JWT auth
Grep("OAuth2|oauth2", src/) → OAuth2 auth
```

### Phase 4 — INFER-MODULES & APIS
Đọc từng controller → group theo base path → tạo module list:
| Module | Base Path | Controllers | APIs count |

Với mỗi API: method, path, summary, request_dto, response_dto, auth_required

### Phase 5 — INFER-DATA-MODEL
```bash
Grep("@Entity", src/main/java/) → phân loại theo package:
  entities/         → primary_datasource (Oracle)
  secondsource.*    → secondary_datasource
  tertiarysource.*  → tertiary_datasource
```

### Phase 6 — INFER-BUSINESS-CONTEXTS
Từ modules → tạo business contexts: tên, mô tả, modules liên quan, capabilities (use case)

### Phase 7 — VALIDATE & PERSIST

#### 7.1 Validation
Trước khi ghi output, cross-check:
- Declared vs used dependencies: flag deps trong pom.xml mà không có import nào dùng
- Commented-out code: flag `@KafkaListener`, `@Entity`, `@Scheduled` bị comment → không tính active
- Empty stubs: flag interface/class không có implementation
- Entity/sequence naming: verify UPPER_SNAKE_CASE tables, AUTOID PK, allocationSize=1

#### 7.2 Persist
Ghi 2 files output theo template chuẩn.

### Phase 8 — KNOWLEDGE EXTRACTION (Optional, enhance over time)

Tạo `docs/architecture/project-knowledge.md` — persistent knowledge base:

```markdown
# Project Knowledge: {Project Name}

## Entity Registry
| Entity | Table | Key Fields | Business Domain |
|--------|-------|------------|-----------------|
| Wallet | WALLET | userId, balance, status | E-Wallet |
| Transaction | WALLET_TRANSACTION | walletId, amount, type | E-Wallet |
| ... | | | |

## Pattern Catalog
| Pattern | Where Used | Notes |
|---------|-----------|-------|
| ResultResp<T> wrapper | All controllers | Standard response format |
| CustomizeException | All services | Error handling with code |
| ... | | |

## VETC Domain Terms
| Term | Meaning | Domain |
|------|---------|--------|
| Bút toán | Journal entry | ACS |
| Đối soát | Reconciliation | Reconcile |

<!-- condensed from source -->
```
