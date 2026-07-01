# QC-OMS Phase Checklist

Tài liệu này dùng để nối mạch giữa các session Codex.

## Trạng thái branch/worktree

- Main working branch: `main`
- Phase 1A đã merge vào `main`: PR #1, merge commit `b503e98`
- Phase 1B đã merge vào `main`: PR #2
- Phase 1C đã merge vào `main`: PR #4, merge commit `2b83df7`
- Phase 2A đã merge vào `main`: PR #5, merge commit `cf82542`
- Phase 2A plan: `docs/superpowers/plans/2026-07-01-phase-2a-pos-direct-checkout-ui.md`
- Phase 2B working branch: `codex/phase-2b-production-queue-foundation`
- Phase 2B plan: `docs/superpowers/plans/2026-07-01-phase-2b-production-queue-foundation.md`

## Phase 0 — Foundation

Status: ✅ Hoàn thành và đã merge vào `tai_lieu_v1`

### Đã hoàn thành

- [x] Tạo design spec Phase 0.
- [x] Tạo implementation plan Phase 0.
- [x] Scaffold React/Vite frontend.
- [x] Thêm lint, typecheck, test, build scripts.
- [x] Khởi tạo Supabase local config.
- [x] Tạo Foundation DB schema:
  - [x] `organizations`
  - [x] `profiles`
  - [x] `workstations`
  - [x] `permissions`
  - [x] `user_permissions`
  - [x] `permission_audit_logs`
- [x] Seed dữ liệu foundation:
  - [x] organization `VAN-LAM`
  - [x] workstation `POS-01`
  - [x] 9 permissions Phase 0
- [x] Bật RLS trên Foundation tables.
- [x] Thêm RLS policies cho authenticated read.
- [x] Thêm transaction functions:
  - [x] `create_profile_with_permissions`
  - [x] `replace_user_permissions`
  - [x] `update_profile_status`
- [x] Thêm pgTAP database tests.
- [x] Thêm Supabase Edge Function API core.
- [x] Thêm route `GET /api/v1/health`.
- [x] Thêm authenticated route `GET /api/v1/me`.
- [x] Thêm workstation APIs:
  - [x] `GET /api/v1/workstations`
  - [x] `POST /api/v1/workstations`
  - [x] `PATCH /api/v1/workstations/{id}`
- [x] Thêm user/permission admin APIs:
  - [x] `GET /api/v1/users`
  - [x] `GET /api/v1/users/{id}`
  - [x] `POST /api/v1/users`
  - [x] `PATCH /api/v1/users/{id}`
  - [x] `PUT /api/v1/users/{id}/permissions`
  - [x] `GET /api/v1/permissions`
- [x] Thêm in-memory rate limiter Phase 0.
- [x] Thêm browser Supabase Auth service.
- [x] Thêm typed API client.
- [x] Thêm Login page.
- [x] Thêm Workstation selector component.
- [x] Thêm permission/session guards.
- [x] Thêm POS Shell Phase 0:
  - [x] K01 topbar
  - [x] K02 cart placeholder
  - [x] K03 payment placeholder
  - [x] profile menu
- [x] Thêm realtime access invalidation helper.
- [x] Thêm CI workflow skeleton.
- [x] Thêm Playwright E2E skeleton.
- [x] Thêm Phase 0 runbook.

### Verification đã pass

- [x] `npm run supabase:reset`
- [x] `npm run test:db`
- [x] `npm run test:functions`
- [x] `npm test`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`

### Ghi chú môi trường

- Supabase local đang chạy được.
- Supabase Studio local bị lỗi image/package:
  `ERR_INVALID_PACKAGE_CONFIG /app/apps/studio/node_modules/next/package.json`
- Đã tắt Studio trong `supabase/config.toml` để local DB/API chạy ổn.
- Có thể xem DB qua Adminer:
  - URL: `http://127.0.0.1:8080`
  - System: `PostgreSQL`
  - Server: `supabase_db_qc-oms`
  - Username: `postgres`
  - Password: `postgres`
  - Database: `postgres`

## Phase 1A — Foundation UI + Catalog/Pricing

Status: ✅ Hoàn thành, đã merge vào `main`, server shared-dev đã smoke PASS

### Đã hoàn thành

- [x] Tạo worktree/branch `codex/phase-1a`.
- [x] Refactor `AuthProvider` để giữ app state:
  - [x] `currentUser`
  - [x] workstation list
  - [x] `signIn`
  - [x] `signOut`
  - [x] `refreshMe`
  - [x] `selectWorkstation`
- [x] Login xong gọi `/api/v1/me`.
- [x] Restore session bằng access token hiện có và gọi `/me`.
- [x] Router dùng state thật thay vì demo hardcoded:
  - [x] `/login`
  - [x] `/workstation`
  - [x] `/pos`
  - [x] `/forbidden`
- [x] `/pos` yêu cầu:
  - [x] user đã đăng nhập
  - [x] đã chọn workstation
  - [x] có `perm.create_order`
- [x] `/workstation` load `GET /api/v1/workstations`.
- [x] Chọn workstation lưu `qc_oms.workstation_id` và refresh `/me`.
- [x] Admin foundation UI:
  - [x] user list/search/filter
  - [x] create user
  - [x] active/inactive
  - [x] replace permissions
  - [x] permission catalog display
- [x] Product catalog admin page `/products`.
- [x] Sales catalog/pricing schema:
  - [x] `products`
  - [x] `price_lists`
  - [x] `price_list_items`
- [x] Catalog/pricing API:
  - [x] `GET/POST/PATCH /api/v1/products`
  - [x] `GET/POST/PATCH /api/v1/price-lists`
  - [x] `PUT/DELETE /api/v1/price-lists/{id}/items/{product_id}`
  - [x] `POST /api/v1/pricing/resolve`
- [x] POS product grid chỉ hiển thị hàng active.

### Verification đã pass

- [x] GitHub CI: 2 checks passed trước merge.
- [x] Server `npm.cmd ci`
- [x] Server `npm.cmd run lint`
- [x] Server `npm.cmd run typecheck`
- [x] Server `npm.cmd test`
- [x] Server `npm.cmd run build`
- [x] Server `npm.cmd run test:functions`
- [x] Server `npm.cmd run supabase:reset`
- [x] Server `npm.cmd run test:db`
- [x] Server API smoke:
  - [x] `/api/v1/health`
  - [x] `/api/v1/me`
  - [x] `/api/v1/products`
  - [x] `/api/v1/pricing/resolve`

## Phase 1B — Customer selection and customer pricing

Status: ✅ Hoàn thành, đã merge vào `main`, server shared-dev đã smoke PASS

### Đã hoàn thành

- [x] Tạo implementation plan `docs/superpowers/plans/2026-06-30-phase-1b-customer-pricing.md`.
- [x] Tạo migration customer/customer group:
  - [x] `customer_groups`
  - [x] `customers`
  - [x] `normalize_customer_phone(text)`
  - [x] `next_customer_code(uuid)`
- [x] Thêm pgTAP test `005_sales_customers.test.sql`.
- [x] Thêm customer/customer-group API route:
  - [x] `GET/POST/PATCH /api/v1/customers`
  - [x] `GET/POST/PATCH /api/v1/customer-groups`
- [x] Cập nhật `/api/v1/pricing/resolve` nhận `customer_id`.
- [x] Thêm POS customer panel:
  - [x] tìm khách
  - [x] tạo nhanh khách không bắt buộc SĐT
  - [x] chọn/bỏ chọn khách
  - [x] reload giá theo khách đã chọn

### Verification đã pass

- [x] Local `npm run lint`
- [x] Local `npm run typecheck`
- [x] Local `npm test`
- [x] Local `npm run build`
- [x] Local `npm run test:functions`
- [x] Local `npm run test:e2e`
- [x] Server `npm.cmd run supabase:reset`
- [x] Server `npm.cmd run test:db`
- [x] Server `npm.cmd run test:functions`
- [x] Server API smoke:
  - [x] `/api/v1/health`
  - [x] login `admin@qc.local / 123456`
  - [x] `/api/v1/me` đủ 9 permissions
  - [x] `/api/v1/customers` thấy `KH000001`
  - [x] `POST /api/v1/customers` tự sinh `KH000002`
  - [x] duplicate normalized phone trả `409 Conflict`
  - [x] `/api/v1/customer-groups` thấy `DAILY`
  - [x] `/api/v1/pricing/resolve` với `customer_id` trả giá seed `120000`

### Ghi chú

- Local dev hiện không kết nối được Postgres Supabase (`LegacyDbConnectError`), nên DB verification phải chạy trên server/shared Supabase.
- Inventory Source of Truth đã có, nhưng chưa implement ở Phase 1B. Không thêm stock editing vào Product admin trong phase này.

## Phase 1C — Order checkout transaction foundation

Status: ✅ Hoàn thành, đã merge vào `main`, server shared-dev đã smoke PASS

### Source of Truth đã sync vào plan

- [x] Business Sales checkout/order/debt.
- [x] Business Inventory stock rules/unit conversion/stocktake/production reconciliation.
- [x] Business Finance cashbook.
- [x] Database Sales order tables.
- [x] Database Inventory tables.
- [x] Database Finance payment/debt/cashbook tables.
- [x] Backend POS order/checkout API.
- [x] Backend Inventory API.
- [x] Backend Finance API.
- [x] Implementation sync note.

### Plan corrections bắt buộc

- [x] Checkout là transaction tạo order/items/stock/payment/debt/cashbook, không chỉ lưu order.
- [x] Sửa hóa đơn đã chốt tạo mã mới dạng `HD000123.01`, không sửa đè.
- [x] Inventory trừ kho khi tạo/lưu đơn bán chính thức.
- [x] Dữ liệu máy sản xuất chỉ đối soát, không tự tạo stock movement trong MVP.
- [x] Bán thiếu tồn cảnh báo nhưng vẫn cho bán, tồn có thể âm.
- [x] Roll/sheet quản lý theo đối tượng vật lý, không sửa tổng tồn trực tiếp.
- [x] Sửa tồn hàng `normal` tự sinh phiếu kiểm kho `balanced`.
- [x] Công nợ theo từng hóa đơn, thu nợ cấn hóa đơn cũ nhất trước.
- [x] Không dùng trả trước/negative customer balance trong MVP.
- [x] Cashbook tách tiền mặt và từng tài khoản ngân hàng.
- [x] Một POS payment tối đa một bank account.
- [x] Seed quyền mới `perm.manage_finance`.

### Đã hoàn thành

- [x] Tạo implementation branch `codex/phase-1c-order-checkout`.
- [x] Sync stocktake Source of Truth bổ sung từ KiotViet audit.
- [x] Implement schema/RPC foundation:
  - [x] `orders`, `order_items`, `order_status_history`
  - [x] inventory units/settings/objects/stock movements/stocktakes
  - [x] finance accounts/payment receipts/debt/cashbook/reconciliations
  - [x] `checkout_order_tx`
  - [x] `collect_customer_debt_tx`
  - [x] `adjust_normal_product_stock_tx`
  - [x] `revise_invoice_tx`
- [x] Implement Order API:
  - [x] `POST /api/v1/orders/checkout`
  - [x] `POST /api/v1/orders/{id}/revise`
- [x] Implement Inventory API minimum:
  - [x] `GET /api/v1/inventory/products`
  - [x] `GET /api/v1/inventory/products/{product_id}`
  - [x] `GET /api/v1/inventory/stock-movements`
  - [x] `GET /api/v1/inventory/stocktakes`
  - [x] `POST /api/v1/inventory/products/{product_id}/adjust-stock`
- [x] Implement Finance API minimum and cashbook follow-up:
  - [x] `GET /api/v1/finance/accounts`
  - [x] `GET /api/v1/finance/customer-debts`
  - [x] `GET /api/v1/finance/customers/{customer_id}/debt`
  - [x] `POST /api/v1/finance/debt-collections`
  - [x] `GET /api/v1/finance/cashbook`
  - [x] `GET /api/v1/finance/cashbook/{entry_id}`
  - [x] `GET /api/v1/finance/payment-receipts/{id}`
  - [x] `GET /api/v1/finance/cashbook/balances`
  - [x] `GET /api/v1/finance/cashbook/vouchers`
  - [x] `GET /api/v1/finance/reconciliations`
- [x] Implement POS checkout UI tối thiểu:
  - [x] cart line quantity/price source
  - [x] selected customer
  - [x] cash/bank payment fields
  - [x] one bank account selector
  - [x] return-change/apply-old-debt choice
  - [x] retail debt note validation
  - [x] receipt summary and inventory warnings
- [x] Add Phase 1 module boundaries for POS, Sales Documents, Customers, PriceBook, Inventory, Finance.
- [x] Add E2E happy path: login, open POS, select customer, add product, cash checkout, assert `HD...` receipt summary.

### Verification đã pass

- [x] Local `git diff --check`
- [x] Local `npm run lint`
- [x] Local `npm run typecheck`
- [x] Local `npm test`: 17 files / 44 tests
- [x] Local `npm run build`
- [x] Local `npm run test:functions`: 34 passed
- [x] Local `npx deno check supabase/functions/api/index.ts`
- [x] Local `npm run test:e2e`: 2 passed
- [x] Server `npm.cmd run supabase:reset`
- [x] Server `npm.cmd run test:db`: 7 files / 233 tests
- [x] Server `npm.cmd run test:functions`: 34 passed
- [x] Server runtime mirror `C:\QC-OMS-runtime` sync/start smoke PASS.
- [x] Server API smoke:
  - [x] `/functions/v1/api/v1/health` -> 200
  - [x] login `admin@qc.local / 123456` -> OK
  - [x] `/functions/v1/api/v1/me` -> 200, admin đủ 10 active permissions
  - [x] `GET /functions/v1/api/v1/finance/accounts` -> 200, includes `CASH` + `MB01`
  - [x] `GET /functions/v1/api/v1/inventory/products` -> 200, includes `DECAL-PP`, `MICA-3MM`, `STANDEE`
  - [x] `POST /functions/v1/api/v1/orders/checkout` cash full-paid -> created `HD000001`
  - [x] receipt `PT000001` created
  - [x] `GET /functions/v1/api/v1/finance/cashbook` -> `total_in = 180000`, `ending_balance = 180000`
  - [x] cashbook exact receipt search with date filter still returns `PT000001`
  - [x] `GET /functions/v1/api/v1/finance/cashbook/{entry_id}` -> source `PT000001` / `HD000001`
  - [x] `GET /functions/v1/api/v1/finance/payment-receipts/{id}` -> cash method `180000`, source order `HD000001`

### Ghi chú

- Supabase local Windows có thể báo một số dev UI service stopped như Studio/Imgproxy/Pooler; DB/Auth/API/Edge runtime vẫn chạy và smoke PASS.
- Sau `supabase:reset`, Auth user `admin@qc.local` phải được tạo lại trước khi smoke runtime.

## Phase 2A — POS direct checkout UI

Status: ✅ Hoàn thành, đã merge vào `main`, cloud staging smoke PASS

### Source of Truth đã sync vào plan

- [x] QC-OMS Sales MVP là bán trực tiếp / `bán đứt`.
- [x] Không làm KiotViet-style `Đặt hàng`, giao hàng, vận đơn, COD, kênh online/Zalo/website.
- [x] `BG...` chỉ là báo giá/snapshot giá; không giữ kho, không tạo sản xuất, không tạo tiền/công nợ/doanh thu.
- [x] Không làm HĐĐT/VAT/thuế kế toán trong scope hiện tại.
- [x] POS Customer modal không có tab `Thông tin xuất hóa đơn`; thông tin pháp lý nếu cần chỉ là thông tin nội bộ.
- [x] Price Book: giá khai báo `0` là giá hợp lệ; không fallback vì giá falsy.
- [x] Reports có End Of Day SoT cho phase sau, nhưng không implement trong Phase 2A.
- [x] Inventory adjustment SoT mới dành cho future Inventory branch; không đưa vào POS checkout UI.
- [x] MVP scope lock `c4c4f67`: direct checkout tại xưởng; không mở lại Orders/Giao hàng/COD/HĐĐT/VAT/kênh online/HR/payroll trong MVP.

### Phạm vi Phase 2A

- [x] Product quick grid cơ bản.
- [x] Customer search/create/select cơ bản.
- [x] Sync docs SoT mới vào implementation branch.
- [x] Cart lines editable: số lượng, đơn giá, xóa dòng.
- [x] Manual price marker và preserve khi đổi khách/bảng giá.
- [x] Re-resolve automatic prices khi đổi khách, không coi giá `0` là thiếu.
- [x] Customer debt display trong checkout.
- [x] Tách tiền trả hóa đơn hiện tại và tiền thu nợ cũ trong UI/payload.
- [x] Cash/bank/mixed payment tối đa một tài khoản bank.
- [x] Return-change/apply-old-debt surplus choice.
- [x] Retail debt note validation khi khách lẻ còn nợ.
- [x] Receipt summary rõ hơn: mã hóa đơn, mã phiếu thu, đã trả/còn nợ, cảnh báo tồn.
- [x] E2E direct checkout có chỉnh số lượng/thanh toán.

### Verification

- [x] Baseline `npm test`: 17 files / 44 tests trên worktree mới.
- [x] Local `git diff --check`
- [x] Local `npm run lint`
- [x] Local `npm run typecheck`
- [x] Local `npm test`: 17 files / 49 tests
- [x] Local `npm run build`
- [x] Local `npm run test:functions`: 34 passed
- [x] Local `npx deno check supabase/functions/api/index.ts`
- [x] Local `npm run test:e2e`: 2 passed
- [x] Supabase Cloud staging verification before merge:
  - [x] `/v1/health` -> 200
  - [x] `/v1/me` -> 200, admin đủ 10 permissions
  - [x] `/v1/products` -> 200
  - [x] `/v1/customers` -> 200
  - [x] `/v1/finance/accounts` -> 200
  - [x] `/v1/inventory/products` -> 200
  - [x] `/v1/finance/cashbook` -> 200
  - [x] `/v1/pricing/resolve` -> 200, `MICA-3MM` giá `120000`

## Phase 2B — Production queue / K02-D foundation

Status: 🔨 Đang làm trên branch `codex/phase-2b-production-queue-foundation`

### Source of Truth đã sync vào plan

- [x] Thuật ngữ đúng là `máy sản xuất`, không dùng `máy trạm` cho luồng file/lệnh K02-D.
- [x] Channel/API/scope dùng `production_queue`, không dùng `workstation_queue`.
- [x] K02-D chỉ đưa dữ liệu máy sản xuất vào hóa đơn nháp local.
- [x] Nháp không trừ kho, không ghi tiền, không tạo doanh thu/công nợ.
- [x] Kho/tiền/công nợ chỉ phát sinh khi POS checkout lưu hóa đơn `HD...`.
- [x] Production queue không tự tạo `orders`, `stock_movements`, payment receipts, cashbook, hoặc debt.
- [x] Atomic claim bắt buộc để hai POS không xử lý trùng một queue item.
- [x] Guard MVP: không Orders/Đặt hàng, delivery/COD, kênh online, loyalty/campaign, HĐĐT/VAT/tax, HR/payroll/timesheet/commission, Purchase/Supplier, BOM deduction trong phase này.

### Đã hoàn thành trong branch

- [x] Sync production queue SoT docs và tạo implementation plan Phase 2B.
- [x] Database foundation:
  - [x] `production_machines`
  - [x] `production_queue_items`
  - [x] `production_queue_events`
  - [x] `claim_production_queue_item_tx`
  - [x] `restore_production_queue_item_tx`
  - [x] seed `IN-BAT`, `IN-DECAL`, `CNC` và queue item simulator
- [x] API foundation:
  - [x] `GET /api/v1/production-queue`
  - [x] `GET /api/v1/production-queue/history`
  - [x] `POST /api/v1/production-queue/{id}/add-to-draft`
  - [x] `POST /api/v1/production-queue/{id}/dismiss`
  - [x] `POST /api/v1/production-queue/{id}/restore`
- [x] POS K02-D panel:
  - [x] list queued machine files
  - [x] `[+]` calls add-to-draft and removes item from local queue list
  - [x] payload becomes local cart line
  - [x] customer from queue payload is selected for the draft
  - [x] add-to-draft does not call checkout

### Verification

- [x] Local `npm run supabase:reset`
- [x] Local `npm run test:db`: 8 files / 267 tests
- [x] Local `npm run test:functions`: 38 passed
- [x] Local targeted POS tests: 18 files / 51 tests
- [x] Local `npm run typecheck`
- [x] Local `git diff --check`
- [x] Local `npm run lint`
- [x] Local `npm test`: 18 files / 51 tests
- [x] Local `npm run build`
- [x] Local `npx deno check supabase/functions/api/index.ts`
- [ ] Local `npm run test:e2e` after cloud/local staging has Phase 2B migration + function.
- [ ] Supabase Cloud staging migration/function deploy and API smoke.

## Phase 2 — POS business UI

Status: 🔨 Đang triển khai theo các lát cắt Phase 2A/2B

- [x] Product quick grid cơ bản.
- [x] Cart lines.
- [x] Quantity/price handling.
- [x] Customer search/create/select cơ bản trong branch Phase 1B.
- [x] Customer debt display.
- [x] Checkout/payment flow.
- [x] Receipt/bill preview.
- [x] K02-D production queue foundation.
- [ ] Discount handling UI.

## Lệnh thường dùng

```bash
# Main branch
cd /Users/vanlam/Documents/project/QC-OMS

# Phase 1C plan sync branch
git switch codex/phase-1c-plan-sync

# Local Supabase
npm run supabase:start
npm run supabase:reset
npm run test:db
npm run test:functions

# Frontend
npm test
npm run typecheck
npm run lint
npm run build
npm run dev
```
