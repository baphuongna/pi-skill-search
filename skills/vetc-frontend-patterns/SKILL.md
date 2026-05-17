---
name: vetc-frontend-patterns
description: PROACTIVELY activate khi implement React/TypeScript feature, thêm page/component/API module, hoặc fix TS error. Auto-detect version từ package.json. Bao gồm Axios interceptor, Redux, Ant Design/MUI patterns.
---

# VETC Frontend Patterns

React/TypeScript implementation patterns cho VETC frontend apps.

## When to Activate

- Implement React/TypeScript feature cho agency portal hoặc ops-ui
- Thêm page, component, API module, Redux slice
- Fix TypeScript error hoặc React warning

## Do NOT Activate When

- Đang làm backend/Java/Spring Boot work (dùng `vetc-java-patterns`)
- Chỉ làm database work — schema, migration, query (dùng `vetc-oracle-patterns`)
- Chỉ viết API contract/design (dùng `vetc-api-design`)

## Gotchas — Frontend Traps

1. **Raw `axios` thay vì `axiosInstance`** → Bypass interceptor (auth token, refresh token). Luôn import từ `AxiosInterceptor`.

2. **`useEffect` thiếu dependency** → Stale closure bug. React strict mode sẽ catch nhưng production thì không. Luôn check deps.

3. **`any` type leakage** → TypeScript mất giá trị. Dùng `unknown` + type guard thay vì `any`.

4. **Token trong localStorage** → XSS có thể steal. Dùng httpOnly cookie hoặc in-memory storage.

5. **`console.log` với sensitive data** → Token, balance, CCCD lọt vào browser console. Remove tất cả debug logs trước ship.

6. **Base64 encode nhầm encrypt** → `btoa(customerId)` chỉ encoding, không bảo mật. Không dùng thay thế encryption.

7. **`useAppSelector` vs `useSelector`** → Phải dùng typed hooks từ store, không dùng raw Redux hooks. Mất type safety.

## Step 0 — Auto-Detect Stack (luôn làm trước)

```bash
# Detect versions
cat package.json | grep -E '"react"|"typescript"|"@reduxjs|"react-query"|"antd"|"@mui|"vite"'

# Detect build tool (CRA vs Vite)
ls vite.config.* package.json

# Read 2-3 nearby files để mirror exact style
```

Xác định:
- React version → hooks patterns, concurrent features
- Build tool: CRA (`react-scripts`) hay Vite
- UI lib: Ant Design v4/v5 hay MUI v5
- State: Redux Toolkit, Zustand hay Context
- Query: react-query v3, TanStack v4/v5 hay SWR

## TypeScript Conventions (official)

**Naming conventions:**
```typescript
// Interface/Type/Class/Enum: PascalCase
interface CustomerData { id: number; name: string }
type ApiResponse<T> = { code: string; data: T; message: string }
enum TransactionStatus { PENDING = 'PENDING', SUCCESS = 'SUCCESS' }

// Variable/Function: camelCase
const customerData = fetchCustomer(id);

// Component: PascalCase matching filename
const CustomerDetailPage: React.FC<Props> = ({ id }) => { };


## API Module Pattern

PASS: Use shared axiosInstance with interceptors (auth token, refresh):
```typescript
import axiosInstance from '../../config/AxiosInterceptor';

// Sensitive params: base64 encode (custId, custNo, mobiNumber, walletId, accountNo)
export const getWallet = async (custId: number) => {
  const { data } = await axiosInstance.get(`/api/v1/wallet/${btoa(String(custId))}`);
  return data;
};
```

FAIL: Raw axios bypasses auth interceptor:
```typescript

## React Query — Version-Adaptive

```typescript
// v3: useQuery(['key', id], () => fn(id))
// v4/v5 TanStack: useQuery({ queryKey: ['key', id], queryFn: () => fn(id) })

// Invalidate cache sau mutation:
const client = useQueryClient();
useMutation(createFn, {
  onSuccess: () => client.invalidateQueries(['list-key'])
});
```
