# QC-OMS Implementation Checklist

> Last update: 2026-07-05
> Purpose: Track implementation progress after each work block.

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

- [ ] Run `npm run test:db`
  - Result: blocked.
  - Blocker: Docker daemon is not running, so Supabase local Postgres cannot start/connect.

- [x] Run `npm run test:e2e`
  - Result: pass, 2 tests.
  - Command: `npm run test:e2e`
  - Notes: E2E selectors now match current POS UI; checkout test asserts API `201`, invoice code, paid amount, and cleared paid draft.

## Phase 2 — Inventory UI

- [ ] Add inventory route.
- [ ] Add inventory product list.
- [ ] Add inventory product detail.
- [ ] Add stock movement history.
- [ ] Add normal product stock adjustment UI.

## Phase 3 — Finance UI

- [ ] Add finance route.
- [ ] Add finance accounts/cashbook view.
- [ ] Add customer debt list.
- [ ] Add debt collection form.
- [ ] Add payment receipt or voucher readonly list.

## Phase 4 — Reports

- [ ] Add end-of-day report.
- [ ] Add sales report.
- [ ] Add debt report.
- [ ] Add inventory report.

## Phase 5 — BOM

- [ ] Review BOM spec.
- [ ] Add minimum DB/API if missing.
- [ ] Add BOM management UI.
- [ ] Connect BOM to POS checkout and inventory deduction after Inventory UI is stable.
