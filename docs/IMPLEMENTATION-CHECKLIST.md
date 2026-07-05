# QC-OMS Implementation Checklist

> **Role:** Implementation log for the latest baseline work. This is not the long-term live roadmap.
> **Live status source:** Use [PHASE-CHECKLIST.md](./PHASE-CHECKLIST.md) for current queue and next work.
> Last update: 2026-07-05
> Purpose: Track implementation progress after each work block.

## Later Backlog

- [ ] Reduce Vite production chunk size warning.
  - Current status: `npm run build` passes, but Vite warns that the main JavaScript chunk is over 500 kB.
  - Meaning: not a correctness bug; it can make first page load slower as the app grows.
  - Suggested fix later: add route-level code splitting so POS, Inventory, Finance, Reports, BOM/Catalog pages load their code only when opened.
  - Priority: later, after core business workflows are stable.

## Phase 1 — Green Checks First

- [x] Fix `npm run lint`
  - Result: pass.
  - Notes: removed React set-state-in-effect lint issue, unused variable issue, and unused sales document detail loader issue.

- [x] Fix `npm run test:functions`
  - Result: pass, 85 tests.
  - Notes: sales document fixture now matches `PaymentReceiptDetailData` contract.

- [x] Run frontend unit tests
  - Result: pass, 32 files / 185 tests.
  - Command: `npm test`

- [x] Run `npm run typecheck`
  - Result: pass.

- [x] Run `npm run build`
  - Result: pass.
  - Note: Vite still reports chunk size warning over 500 kB.

- [x] Run `npm run test:db`
  - Result: pass, 14 files / 449 tests.
  - Command: `npm run test:db`

- [x] Run `npm run test:e2e`
  - Result: pass, 2 tests.
  - Command: `npm run test:e2e`
  - Notes: E2E selectors now match current POS UI; checkout test asserts API `201`, invoice code, paid amount, and cleared paid draft.

## Phase 2 — Inventory UI

- [x] Add inventory route.
  - Result: `/inventory` route added behind `perm.manage_inventory`.
  - Notes: app shell navigation now shows `Kho` for inventory users.

- [x] Add inventory product list.
  - Result: product inventory table with search, status filter, shape filter, pagination, total/quantity/negative-stock KPIs.
  - API: `/api/v1/inventory/products`.

- [x] Add inventory product detail.
  - Result: detail panel shows product code, name, inventory shape, available quantity, stock unit, and status.
  - API: `/api/v1/inventory/products/{id}`.

- [x] Add stock movement history.
  - Result: detail panel shows recent movement list for selected product.
  - API: `/api/v1/inventory/stock-movements`.

- [x] Add normal product stock adjustment UI.
  - Result: normal products can submit actual quantity and adjustment reason from detail panel.
  - API: `/api/v1/inventory/products/{id}/adjust-stock`.

- [x] Add inventory UI tests.
  - Result: pass, 34 files / 189 tests.
  - Command: `npm test -- src/features/inventory/inventory-service.test.ts src/features/inventory/InventoryPage.test.tsx src/components/ui-shell/AppShell.test.tsx`

- [x] Run Phase 2 frontend gates.
  - `npm run lint`: pass.
  - `npm run typecheck`: pass.
  - `npm run build`: pass.
  - Note: Vite still reports chunk size warning over 500 kB.

## Phase 3 — Finance UI

- [x] Add finance route.
  - Result: `/finance` route added behind `perm.manage_finance`.
  - Notes: app shell navigation now shows `Tài chính` for finance users.

- [x] Add finance accounts/cashbook view.
  - Result: page shows account balances, cashbook summary, cashbook entries, search, direction filter, and pagination.
  - API: `/api/v1/finance/accounts`, `/api/v1/finance/cashbook/balances`, `/api/v1/finance/cashbook`.

- [x] Add customer debt list.
  - Result: page shows customer debt list with search and pagination.
  - API: `/api/v1/finance/customer-debts`.

- [x] Add debt collection form.
  - Result: customer debt detail can submit cash/bank split payment and note.
  - API: `/api/v1/finance/customers/{customer_id}/debt`, `/api/v1/finance/debt-collections`.
  - Notes: retail debt rows without `customer_id` are readonly because debt collection endpoint requires `customer_id`.

- [x] Add payment receipt or voucher readonly list.
  - Result: readonly voucher list added from available API.
  - API: `/api/v1/finance/cashbook/vouchers`.
  - Notes: route has `GET /api/v1/finance/payment-receipts/{id}` only, no list endpoint, so UI uses cashbook vouchers for readonly list.

- [x] Add finance UI tests.
  - Result: pass, 68 files / 379 tests.
  - Command: `npm test -- src/features/finance/finance-service.test.ts src/features/finance/FinancePage.test.tsx src/components/ui-shell/AppShell.test.tsx`

- [x] Run Phase 3 frontend gates.
  - `npm run lint`: pass.
  - `npm run typecheck`: pass.
  - `npm run build`: pass.
  - Note: Vite still reports chunk size warning over 500 kB.

## Phase 4 — Reports

- [x] Add reports route.
  - Result: `/reports` route added.
  - Permission: requires both `perm.manage_finance` and `perm.manage_inventory`.
  - Notes: app shell navigation only shows `Báo cáo` when user has both permissions.

- [x] Add end-of-day report.
  - Result: shows invoice count, cashbook total in/out, ending balance, and latest cashbook rows for selected date range.
  - API: `/api/v1/finance/cashbook`.

- [x] Add sales report.
  - Result: shows sales total, paid amount, debt created, and invoice rows for selected date range.
  - API: `/api/v1/sales-documents`.

- [x] Add debt report.
  - Result: shows current customer debt total and debt rows.
  - API: `/api/v1/finance/customer-debts`.

- [x] Add inventory report.
  - Result: shows active item count, total available quantity, negative stock count, and inventory rows.
  - API: `/api/v1/inventory/products`.

- [x] Add reports UI tests.
  - Result: pass, 70 files / 385 tests.
  - Command: `npm test -- src/features/reports/report-service.test.ts src/features/reports/ReportsPage.test.tsx src/components/ui-shell/AppShell.test.tsx src/features/navigation/module-boundaries.test.ts`
  - Coverage: empty report states, data from POS checkout-like sales rows, and date filters.

- [x] Run Phase 4 frontend gates.
  - `npm run lint`: pass.
  - `npm run typecheck`: pass.
  - `npm run build`: pass.
  - Note: Vite still reports chunk size warning over 500 kB.

## Phase 5 — BOM

- [x] Review BOM spec.
  - Result: owner chose BOM v1 direction.
  - Scope: single-level BOM, normal inventory components only, versioned active BOM, checkout snapshot.
  - Deferred: multi-level deep-scan, roll/sheet physical deduction, POS line override BOM.

- [x] Add minimum DB/API if missing.
  - Result: migration adds `product_boms`, `product_bom_items`, `order_item_bom_snapshots`, `save_product_bom_v1_tx`, and checkout trigger.
  - API: `GET /api/v1/products/{product_id}/bom`, `POST /api/v1/products/{product_id}/bom`.
  - Permission: `perm.manage_inventory`.

- [x] Add BOM management UI.
  - Result: product detail in Hàng hóa can load/save single-level BOM components.
  - Notes: UI filters out roll/sheet components for v1.

- [x] Connect BOM to POS checkout and inventory deduction after Inventory UI is stable.
  - Result: after an invoice order item is inserted, active BOM v1 is snapshotted and component stock movements are inserted.
  - Notes: existing sold-product deduction remains unchanged; BOM v1 adds component deduction for configured BOM components.

- [x] Add BOM tests.
  - Frontend: `npm test -- src/features/catalog/catalog-service.test.ts src/features/catalog/CatalogPage.test.tsx` pass, 71 files / 387 tests.
  - Functions: `npm run test:functions` pass, 86 tests.

- [x] Run Phase 5 gates.
  - `npm run lint`: pass.
  - `npm run typecheck`: pass.
  - `npm test`: pass, 71 files / 387 tests.
  - `npm run test:functions`: pass, 86 tests.
  - `npm run build`: pass.
  - Note: Vite still reports chunk size warning over 500 kB.
