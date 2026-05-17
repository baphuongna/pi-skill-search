---
name: vetc-java-patterns
description: PROACTIVELY activate khi implement backend Java/Spring Boot, thêm endpoint/service/entity, hoặc code review Java. Auto-detect version từ pom.xml. Bao gồm Controller/Service/Repository/Entity/Exception/Cache/RabbitMQ patterns.
---

# VETC Java Patterns

Java/Spring Boot implementation patterns cho VETC E-Wallet.

## When to Activate

- Implement backend Java/Spring Boot feature
- Thêm endpoint, service, entity, repository
- Tích hợp external service (ACS, Bank GW, eKYC)
- Fix Java compile error hoặc logic bug
- Code review Java code

## Do NOT Activate When

- Đang làm việc trên code không phải Java (frontend, script, config file)
- Chỉ làm frontend React/TypeScript work (dùng `vetc-frontend-patterns`)
- Chỉ viết test, không implement business logic

## Step 0 — Auto-Detect Stack (luôn làm trước)

```bash
# Detect Java version và Spring Boot version
grep -E "<java.version>|<spring-boot.version>" pom.xml

# Detect dependencies
grep -E "springfox|springdoc|junit|lombok|mapstruct" pom.xml

# Read 2-3 nearby implementation files để mirror style
```

Kết quả → xác định:
- `javax.*` (Spring Boot 2.x) hay `jakarta.*` (Spring Boot 3.x)
- JUnit 4 hay JUnit 5
- Springfox (Swagger 2) hay springdoc (OpenAPI 3)
- Field injection (`@Autowired`) hay constructor injection

## Core Patterns

### Layered Architecture (bất biến)
```
Controller (thin: validate → delegate → return)
    ↓
Service (business logic + @Transactional)
    ↓
Repository (data access only)
    ↓
Entity (JPA mapping to Oracle)
```

### Controller
```java
@RestController
@RequestMapping("api/v{N}/{domain}")
public class XxxController extends ControllerBase {
    @Autowired  // hoặc constructor inject — mirror nearby code
    private XxxService service;

    @PostMapping("/endpoint")
    public ResultResp<?> create(
            @AuthenticationPrincipal Jwt token,
            @Valid @RequestBody XxxRequest request) {
        return ResultResp.success(service.create(request));
    }
}
```

### Service
```java
@Service
@Slf4j
public class XxxServiceImpl implements XxxService {
    @Override
    @Transactional  // chỉ ở service layer
    public XxxResponse create(XxxRequest request) {
        // 1. Business validation → throw CustomizeException
        // 2. Business logic
        // 3. Save entity
        // 4. Publish event (RabbitMQ nếu cần)
        // 5. Return DTO — không expose entity
    }
}
```

### Entity — Oracle Conventions
```java
@Builder @AllArgsConstructor @NoArgsConstructor @Getter @Setter
@Entity(name = "TABLE_NAME")  // UPPERCASE
public class Xxx {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "TABLE_NAME_SEQ")
    @SequenceGenerator(name = "TABLE_NAME_SEQ", allocationSize = 1)
    @Column(name = "AUTOID")
    private Long id;

    @Column(name = "AMOUNT", precision = 20, scale = 4)
    private BigDecimal amount;  // KHÔNG dùng double/float cho tiền

    @Nationalized  // NVARCHAR2 — tiếng Việt

### Repository — Parameterized queries ONLY

FAIL: SQL injection via string concatenation:
```java
// KHÔNG BAO GIỜ làm thế này
@Query(nativeQuery = true, value =
    "SELECT * FROM TABLE WHERE STATUS = '" + status + "'")
```

<!-- condensed from source -->

