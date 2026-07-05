# PERFORMANCE-FIX-LOG

Purpose: record measured load problems, fixes, and verification so later Codex threads do not repeat the same work.

## 2026-07-05 — Load Performance Pass

Branch: `codex/load-performance`

### Problems Checked

- Many list pages loaded slowly because they made duplicate or per-row requests.
- `/sales-documents` detail click felt frozen because UI waited for detail payload before showing feedback.
- Auth guard delayed route display while `/api/v1/me` was fetched.
- Some backend list/detail endpoints loaded more data than the current UI used.

### Fixes Made

- Shared API client:
  - dedupe concurrent `GET` requests
  - short completed `GET` cache: 1 second
  - clear GET cache after write requests
- Auth:
  - cache `/api/v1/me` in `sessionStorage`
  - allow route render immediately when token exists
  - refresh `/me` in background
- POS:
  - initial product load limited to 12 products
  - product load split from price resolution
- Customers:
  - list returns `total_debt_amount`
  - removed per-row debt-detail calls on list load
  - debt detail loads only when debt tab opens
- Sales documents:
  - list uses database pagination when no text search
  - detail row shows `Đang tải chi tiết...` immediately
  - initial detail endpoint no longer loads unused payment/debt/stock/history arrays
  - payment history tab remains visible but does not call history API yet
- Purchase receipts:
  - initial list no longer loads supplier/product/finance lookup data
  - supplier/product lookups load only when creating or opening receipt detail
  - finance accounts load only when a bank-transfer control is used
  - receipt detail row shows loading inline immediately after click
- Suppliers:
  - initial list no longer loads linked-customer options or finance accounts
  - customer options load only when creating/editing supplier
  - finance accounts load only when a bank-transfer control is used
  - supplier detail/payment row shows loading inline immediately after click

### Measured Result

- `/customers`: 17 API requests -> 2.
- `/purchase/receipts`: 7 API requests -> 5.
- `/purchase/receipts`: after lazy lookup fix, 5 API requests -> 2 on initial list load.
- `/price-book`: 4 API requests -> 3.
- `/suppliers`: 4 API requests -> 2 on initial list load.
- `/pos`: stable at 4 initial API requests.
- `/sales-documents`: list commonly around 1.09s after auth/cache changes.
- `/sales-documents` detail click: API detail still about 1.3-1.4s on local Supabase, but UI now shows loading immediately.
- `/purchase/receipts` detail click: 3 concurrent API requests remain (`receipt`, `suppliers`, `products`), but inline loading appears before they finish.

Local Supabase remains a timing limit: several endpoints still take about 0.7-1.4s before frontend rendering can finish.

### Verification Run

```bash
npm test -- --run --reporter dot --pool forks --silent=false
npm run typecheck
/Users/vanlam/.deno/bin/deno check supabase/functions/api/index.ts
/Users/vanlam/.deno/bin/deno test --no-check supabase/tests/functions/sales_documents_test.ts
git diff --check
```

Result:

- Vitest: PASS — 31 files, 178 tests.
- Typecheck: PASS.
- Deno check: PASS.
- Sales documents Deno tests: PASS — 7 tests.
- Diff whitespace check: PASS.
- Existing React `act(...)` warnings remain, not introduced by this pass.

Additional frontend verification after lazy lookup fix:

```bash
npm test -- src/features/purchase/SuppliersPage.test.tsx src/features/purchase/PurchaseReceiptsPage.test.tsx --run --reporter dot --pool forks --silent=false
npm run typecheck
```

Result:

- Vitest: PASS — 31 files, 178 tests.
- Typecheck: PASS.

### Rules From This Pass

- Measure request count and endpoint timing before changing performance code.
- Prefer shared fixes first: API client, auth route cache, backend repository pagination.
- Do not add page-by-page patches if shared CSS/API/state layer can solve it.
- Avoid N+1 list calls: no per-row debt/detail/history fetch during list load.
- List endpoints must paginate in database and return only fields shown by the list.
- Detail endpoints should not load tab payloads the UI is not currently displaying.
- Any short cache or request dedupe must be invalidated by writes and have a documented TTL.
- Before merge, record request counts/timings plus test/typecheck results here.

## 2026-07-05 — Full Route Load Recheck

Branch: `codex/load-performance`

### Problems Checked

- Full page reloads still called `/api/v1/me` on every page even when a valid cached user was already in `sessionStorage`.
- Initial list pages had already been reduced, but the remaining `/me` request added about 0.4-0.8s network time per reload.
- POS and Admin still had multiple requests; checked whether those were unused or required for visible UI.

### Fixes Made

- Auth cache TTL changed to 5 minutes.
- Fresh cached `/me` data now skips the bootstrap network refresh.
- Stale cached `/me` still refreshes.
- AccessSync can still refresh `/me` when account/permission changes arrive from realtime.

### Measured Route Counts

Measured in the in-app browser after warming auth cache once:

| Route | API requests after fix | Notes |
|---|---:|---|
| `/sales-documents` | 1 | list only |
| `/customers` | 1 | list only |
| `/products` | 1 | list only |
| `/price-book` | 2 | products + price lists, both visible |
| `/suppliers` | 1 | list only |
| `/purchase/receipts` | 1 | list only |
| `/pos` | 3 | production queue + products + price resolve, all visible/needed |
| `/admin` | 2 | users + permissions, both visible/needed |

Typical remaining endpoint time on local Supabase: about 0.7-1.3s. Most remaining delay is backend/local Supabase response time, not extra frontend request fan-out.

### Verification Run

```bash
npm test -- src/features/auth/AuthProvider.test.tsx src/features/purchase/SuppliersPage.test.tsx src/features/purchase/PurchaseReceiptsPage.test.tsx --run --reporter dot --pool forks --silent=false
npm run typecheck
```

Result:

- Vitest: PASS — 31 files, 179 tests.
- Typecheck: PASS.
- Existing React `act(...)` warnings remain, not introduced by this pass.
