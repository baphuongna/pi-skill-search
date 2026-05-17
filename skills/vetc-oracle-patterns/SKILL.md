---
name: vetc-oracle-patterns
description: PROACTIVELY activate khi tạo JPA entity, viết native query, hoặc thiết kế schema. Oracle naming conventions, sequences, NVARCHAR2, parameterized queries, view entities.
---

# VETC Oracle Database Patterns

Oracle DB patterns cho VETC E-Wallet system.

## When to Activate

- Tạo JPA entity mới
- Viết native query Oracle
- Thiết kế schema (bảng, index, sequence)

## Do NOT Activate When

- Sử dụng database không phải Oracle (PostgreSQL, MySQL, etc.)
- Chỉ làm frontend work (dùng `vetc-frontend-patterns`)
- CRUD đơn giản không cần complex query, native query, hay schema design

## Gotchas — Oracle Traps

1. **Quên `allocationSize = 1`** → Default là 50, ID nhảy cóc. Luôn set `@SequenceGenerator(allocationSize = 1)`.

2. **Native query không có `:param`** → String concat trong native query = SQL injection. Luôn dùng `@Param` placeholder.

3. **`VARCHAR2` vs `NVARCHAR2`** → VARCHAR2 không chứa tiếng Việt. Text tiếng Việt phải dùng `NVARCHAR2` + `@Nationalized`.

4. **Column name lowercase** → Oracle column name mặc định uppercase. `@Column(name = "my_column")` không match `MY_COLUMN` trong DB. Luôn UPPERCASE.

5. **Oracle DATE có time** → `DATE` trong Oracle chứa cả time, khác MySQL. Dùng `TIMESTAMP` cho full datetime.

6. **Pagination với native query** → `LIMIT/OFFSET` không hoạt động trong Oracle 11g. Dùng `ROWNUM` hoặc Oracle 12c+ `FETCH FIRST`.

7. **CLOB vs String** → Oracle VARCHAR2 max 4000 bytes. Text dài hơn phải dùng CLOB + `@Lob`.

## Oracle Naming Conventions

```
Table:    UPPER_SNAKE_CASE  — WALLET_TRANSACTION, CUSTOMER_INFOS
Column:   UPPER_SNAKE_CASE  — CUSTOMER_ID, CREATED_DATE, AUTOID
Sequence: {TABLE_NAME}_SEQ  — WALLET_TRANSACTION_SEQ
Index:    IDX_{TABLE}_{COL} — IDX_WALLET_TRANS_CUST_ID
PK:       AUTOID (Long)
```

## JPA Entity Template

PASS: Complete entity with Oracle conventions:
```java
@Builder @AllArgsConstructor @NoArgsConstructor @Getter @Setter
@Entity(name = "TABLE_NAME")
public class EntityName {

    // Primary Key — Oracle Sequence (allocationSize = 1 là BẮT BUỘC)
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "TABLE_NAME_SEQ")
    @SequenceGenerator(name = "TABLE_NAME_SEQ", allocationSize = 1)
    @Column(name = "AUTOID")
    private Long id;


## Native Query Patterns

PASS: Parameterized native query — LUÔN LUÔN dùng `:param`:
```java
@Query(nativeQuery = true, value =
    "SELECT t.* FROM WALLET_TRANSACTION t " +
    "WHERE t.CUSTOMER_ID = :customerId " +
    "AND t.STATUS = :status " +
    "AND t.CREATED_DATE BETWEEN :fromDate AND :toDate " +
    "ORDER BY t.CREATED_DATE DESC")
List<WalletTransaction> findByFilter(
    @Param("customerId") Long customerId,
    @Param("status") String status,
    @Param("fromDate") Date fromDate,
    @Param("toDate") Date toDate);

## View Entity (Read-Only)

```java
// Entity không có sequence, không có @Id tự sinh
@Immutable
@Entity(name = "V_CUSTOMER_WALLET")  // Oracle View
@Getter
public class VCustomerWallet {
    @Id  // dùng cột unique của view
    @Column(name = "CUSTOMER_ID")
    private Long customerId;

    @Column(name = "WALLET_BALANCE")
    private BigDecimal walletBalance;
    // ...
}
```

## Stored Procedure Integration

```java
// VETC pattern: RepositoryServiceBase.callStoresProcedure
List<Result> results = repositoryServiceBase.callStoresProcedure(
    "PROC_NAME",
    List.of(
        new ParameterDto("p_customer_id", customerId, ParameterType.IN),
        new ParameterDto("p_status", status, ParameterType.IN)
    ),
    Result.class
);
```

