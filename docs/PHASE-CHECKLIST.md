# QC-OMS Phase Checklist

Tài liệu này dùng để nối mạch giữa các session Codex.

## Trạng thái branch/worktree

- Main working branch: `main`
- Backend chính cho dev/staging hiện tại: Supabase Cloud. Các dòng `server shared-dev` bên dưới là lịch sử verification của phase đã merge, không phải hướng mặc định cho developer mới.
- Phase 1A đã merge vào `main`: PR #1, merge commit `b503e98`
- Phase 1B đã merge vào `main`: PR #2
- Phase 1C đã merge vào `main`: PR #4, merge commit `2b83df7`
- Phase 2A đã merge vào `main`: PR #5, merge commit `cf82542`
- Phase 2A plan: `docs/superpowers/plans/2026-07-01-phase-2a-pos-direct-checkout-ui.md`
- Phase 2B đã merge vào `main`: PR #6, merge commit `80b521e`
- Phase 2B plan: `docs/superpowers/plans/2026-07-01-phase-2b-production-queue-foundation.md`
- Phase 2C đã merge vào `main`: PR #7, merge commit `1d7a6f5`
- Phase 2C plan: `docs/superpowers/plans/2026-07-01-phase-2c-pos-discount-ui.md`
- Phase 2D đã merge vào `main`: PR #8, merge commit `552db05`
- Phase 2D plan: `docs/superpowers/plans/2026-07-01-phase-2d-sales-documents-readonly.md`

## Phase 0 — Foundation

Status: ✅ Hoàn thành và đã merge vào `main`

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
- [x] Price Book: giá `0` không fallback vì falsy; bảng giá chung giữ 0, bảng giá nhóm dùng 0 làm rule lấy giá nhập gần nhất, thiếu giá nhập thì vẫn 0.
- [x] Reports có End Of Day SoT cho phase sau, nhưng không implement trong Phase 2A.
- [x] Inventory adjustment SoT mới dành cho future Inventory branch; không đưa vào POS checkout UI.
- [x] MVP scope lock `c4c4f67`: direct checkout tại xưởng; không mở lại Orders/Giao hàng/COD/HĐĐT/VAT/kênh online/HR/payroll trong MVP.

### Phạm vi Phase 2A

- [x] Product quick grid cơ bản.
- [x] Customer search/create/select cơ bản.
- [x] Sync docs SoT mới vào implementation branch.
- [x] Cart lines editable: số lượng, đơn giá, xóa dòng.
- [x] Manual price marker và preserve khi đổi khách/bảng giá.
- [x] Re-resolve automatic prices khi đổi khách, không coi giá `0` là thiếu; nếu giá nhóm 0 thì resolve theo giá nhập gần nhất hoặc 0 nếu chưa có giá nhập.
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

Status: ✅ Hoàn thành, đã merge vào `main`, cloud staging smoke PASS

### Source of Truth đã sync vào plan

- [x] Thuật ngữ đúng là `máy sản xuất`, không dùng `máy trạm` cho luồng file/lệnh K02-D.
- [x] Channel/API/scope dùng `production_queue`, không dùng `workstation_queue`.
- [x] K02-D chỉ đưa dữ liệu máy sản xuất vào hóa đơn nháp local.
- [x] Nháp không trừ kho, không ghi tiền, không tạo doanh thu/công nợ.
- [x] Kho/tiền/công nợ chỉ phát sinh khi POS checkout lưu hóa đơn `HD...`.
- [x] Production queue không tự tạo `orders`, `stock_movements`, payment receipts, cashbook, hoặc debt.
- [x] Atomic claim bắt buộc để hai POS không xử lý trùng một queue item.
- [x] Production pilot ưu tiên production agent/folder watcher hoặc legacy bridge đưa event vào queue.
- [x] File free-form/unparseable vẫn phải vào queue để nhân viên sửa thủ công; lịch sử queue giữ 10 ngày ở DB trong phase ingestion sau.
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
- [x] Local `npm run test:e2e`: 2 passed
- [x] Supabase Cloud staging migration/function deploy and API smoke:
  - [x] `npx supabase db push` applied `202607010001_production_queue.sql`
  - [x] `npx supabase functions deploy api`
  - [x] Remote grant/RLS applied for production queue tables after first smoke caught missing service role grants
  - [x] `/functions/v1/api/v1/health` -> 200
  - [x] login `admin@qc.local / 123456` -> OK
  - [x] `/functions/v1/api/v1/me` -> 200, admin đủ 10 permissions
  - [x] `GET /functions/v1/api/v1/production-queue` -> 200, seed queue count `1`
  - [x] `POST /functions/v1/api/v1/production-queue/{id}/add-to-draft` -> 200, payload `DECAL-PP`, quantity `2`
  - [x] Add-to-draft did not create order, stock movement, or cashbook entry

## Phase 2C — POS line discount handling

Status: ✅ Hoàn thành, đã merge vào `main`

### Phạm vi Phase 2C

- [x] Discount handling UI cho từng dòng POS.
- [x] Chỉ user có `perm.apply_discount` được sửa chiết khấu ở tầng kỹ thuật; preset nhân viên nội bộ MVP mặc định nên có quyền này.
- [x] POS summary tính subtotal, discount và payable total.
- [x] Checkout payload gửi `items[].discount_amount`.
- [x] Backend checkout transaction validate và persist line/order discount.
- [x] Không mở promotion, loyalty, campaign, tax hoặc online-channel scope.

### Verification đã ghi trong plan

- [x] Targeted POS UI tests PASS.
- [x] Backend DB/function tests PASS.
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`
- [x] PR #7 merged into `main`.

## Phase 2D — Sales Documents readonly module

Status: ✅ Hoàn thành, đã merge vào `main`

### Phạm vi Phase 2D

- [x] Readonly Sales Documents module cho hóa đơn `HD...`.
- [x] Backend list/detail API:
  - [x] `GET /api/v1/sales-documents`
  - [x] `GET /api/v1/sales-documents/{id}`
- [x] Exact document-code search không bị kẹt bởi default date filters.
- [x] Detail hiển thị snapshot dòng hàng, thanh toán, công nợ và stock movements.
- [x] Frontend dashboard entry, route, list page và readonly detail view.
- [x] Không implement edit/cancel/print/returns/delivery/tax trong phase này.

### Verification đã ghi trong plan

- [x] Sales Documents API tests PASS.
- [x] Sales Documents UI tests PASS.
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run test:functions`
- [x] `npm test`
- [x] `npm run build`
- [x] `npx deno check supabase/functions/api/index.ts`
- [x] PR #8 merged into `main`.

## Phase 2 — POS business UI

Status: ✅ Hoàn thành tới lát cắt Phase 2D đã merge

- [x] Product quick grid cơ bản.
- [x] Cart lines.
- [x] Quantity/price handling.
- [x] Customer search/create/select cơ bản trong branch Phase 1B.
- [x] Customer debt display.
- [x] Checkout/payment flow.
- [x] Receipt/bill preview.
- [x] K02-D production queue foundation.
- [x] Discount handling UI/backend persistence.
- [x] Sales Documents readonly list/detail.

### Còn lại sau Phase 2D

- Không có working branch Phase 2 tiếp theo đang được checklist này theo dõi.
- Phase kế tiếp theo roadmap hiện tại: Phase 3A POS draft rẽ nhánh lưu báo giá `BG...` + mở lại vào POS draft local.
- Các phần chưa làm nhưng có thể cần phase riêng nếu Owner quyết định: sửa/hủy/in chứng từ bán hàng, in báo giá đơn giản Phase 3B, production ingestion tự động, PriceBook formula nâng cao hoặc Purchase/Supplier.
- Các phần vẫn nằm ngoài scope hiện tại: delivery/COD, kênh online, tax/HĐĐT.
- Không mở rộng scope mới từ checklist này.

## Phase 3A — Quote BG + reopen into POS draft

Status: ⏭️ Sẵn sàng lập plan sau khi SoT được handoff

### Phạm vi dự kiến

- [ ] POS lưu báo giá `BG...`.
- [ ] Sales Documents list/detail cho báo giá bằng bộ lọc `Báo giá`, không có module/menu báo giá riêng.
- [ ] Mở lại báo giá vào POS draft local, không tạo server draft.
- [ ] Giữ giá snapshot mặc định; cảnh báo nếu giá hiện tại khác.
- [ ] Cảnh báo sản phẩm inactive/missing và yêu cầu xử lý trước checkout.
- [ ] Từ nháp mở lại, bấm `BÁO GIÁ` tạo `BG...` mới độc lập, không revision/copy link.
- [ ] Từ nháp mở lại, bấm `THANH TOÁN` tạo `HD...` như checkout POS bình thường.
- [ ] Đóng nháp bằng `X` không ghi gì thêm; báo giá gốc giữ nguyên `active`.
- [ ] Báo giá không tự hủy/hết hạn theo thời gian.

### Ngoài phạm vi Phase 3A

- [ ] In/xem báo giá đơn giản bằng mẫu mặc định; gửi thủ công ngoài hệ thống nếu cần.
- [ ] Không làm hủy báo giá thủ công; báo giá không dùng nữa cứ để nguyên để tra cứu/dùng lại sau.
- [ ] Không làm nút/endpoint sao chép báo giá riêng.
- [ ] Giữ hàng, trừ kho, công nợ, doanh thu hoặc sổ quỹ khi chỉ lưu báo giá.
- [ ] Sửa/hủy hóa đơn và đảo kho/tiền/công nợ.

## Phase 3B — Simple quote print

Status: ⏭️ Sẵn sàng lập plan sau Phase 3A nếu cần in báo giá ngay

### Phạm vi dự kiến

- [ ] Từ chi tiết báo giá `BG...`, mở preview mẫu báo giá mặc định.
- [ ] Ưu tiên route riêng `/sales-documents/:id/quote-print` hoặc tương đương, frontend-only.
- [ ] Dùng snapshot báo giá đã lưu; không tự resolve lại giá/danh mục hiện tại.
- [ ] Hiển thị cửa hàng, mã/ngày báo giá, nhân viên, khách hàng snapshot, dòng hàng, kích thước/m2/mét tới, chiết khấu, tổng tiền và ghi chú.
- [ ] In bằng trình duyệt/browser print, có CSS print ẩn nav/sidebar/button.
- [ ] Không làm thay đổi trạng thái báo giá và không phát sinh kho/tiền/công nợ/doanh thu.

### Ngoài phạm vi Phase 3B

- [ ] Export PDF/ảnh ở backend.
- [ ] Nhiều mẫu bill/báo giá tùy biến.
- [ ] Tự gửi Zalo/Facebook/email hoặc lưu lịch sử gửi.
- [ ] In lại hóa đơn/bill nâng cao nếu chưa có Bill Preview riêng.

## Future — PriceBook formula nâng cao

Status: ⏭️ Đã có SoT nghiệp vụ, chờ Owner chọn thứ tự sau Quote/Print/Purchase

### Phạm vi đã chốt

- [ ] Chỉ dùng `giá nhập cuối` làm nguồn tính giá; không dùng giá vốn bình quân trong PriceBook MVP.
- [ ] `giá nhập cuối` đọc từ `products.latest_purchase_cost`; trước Purchase receipt hoàn chỉnh có thể lấy từ import/admin edit, sau này receipt `posted` cập nhật.
- [ ] Product admin/API cho phép `perm.edit_price_book` nhập/sửa `latest_purchase_cost` tạm thời, có audit metadata tối thiểu.
- [ ] Tạo bảng giá chỉ cần tên; không có phạm vi áp dụng hoặc thời gian hiệu lực.
- [ ] Lưới giá có cột cố định `Mã hàng`, `Tên hàng`, `Giá nhập cuối`.
- [ ] Các cột bảng giá lấy dynamic từ `price_lists` đang active; không hard-code chỉ `25/26/30/35/40`.
- [ ] Formula filter slice đầu chỉ dùng field hiện có: tên chứa, mã chứa, `sell_method`, `status = active`; chưa làm `product_groups/group_id`.
- [ ] Cột `Chi phí`: chọn giá cố định hoặc công thức `+ số tiền + % giá nhập cuối`.
- [ ] Cột `Lợi nhuận`: chọn giá cố định hoặc công thức điều kiện theo giá nhập cuối.
- [ ] Cột bảng giá chỉ cộng/trừ số tiền hoặc phần trăm.
- [ ] Giá cuối luôn làm tròn lên `1,000đ`, không có UI chọn làm tròn.
- [ ] Ô giá có 2 chế độ: giá tay hoặc theo công thức.
- [ ] Ô theo công thức tự tính lại khi `giá nhập cuối` thay đổi.
- [ ] Ô theo công thức ghi nhớ công thức tới khi người dùng nhập giá tay hoặc gắn công thức khác.
- [ ] Formula rule phải lưu structured trong DB ngay từ slice đầu; không chỉ tính tạm ở UI.
- [ ] Gắn công thức hàng loạt phải có preview trước khi áp dụng cho bộ lọc.
- [ ] `perm.edit_price_book` đủ cho preview/gắn công thức; audit tối thiểu actor/filter/số dòng bị ảnh hưởng.
- [ ] Backend test rounding up `1,000đ`, formula mode resolve, missing latest cost = `0`, và tier overlap validation.

### Ngoài phạm vi slice đầu

- [ ] Công thức Excel/free-form `+ - * /` tự do.
- [ ] Chọn nguồn giá vốn bình quân.
- [ ] Điều kiện phức tạp ở cột bảng giá.
- [ ] Phạm vi áp dụng/thời gian hiệu lực kiểu KiotViet.
- [ ] Product group schema/UI/filter (`product_groups`, `products.product_group_id`) trong formula MVP đầu.

## Implementation-ready queue

Status: 🔄 Dùng để hai luồng làm việc liên tục hơn; Owner trực tiếp quyết thứ tự cuối cùng.

Mục này không tự mở scope mới. Nó ghi các lát cắt đã có đủ SoT hoặc gần đủ SoT để implement có thể chuẩn bị plan khi xong việc đang làm.

### Đang làm / ưu tiên hiện tại

1. **PriceBook formula MVP**
   - Trạng thái: implement đang làm trên branch `codex/pricebook-formula-mvp`.
   - SoT đã đủ cho slice đầu: formula structured, manual/formula price cell, latest purchase cost admin field, không product group filter.
   - Nếu phát sinh blocker mới, implement gửi câu hỏi cụ thể sang spec.

### Có thể làm tiếp sau PriceBook formula

1. **Phase 3B — Simple quote print**
   - Mức sẵn sàng: cao.
   - Lý do: SoT đã rõ, scope nhỏ, chủ yếu frontend print view từ snapshot báo giá; file `SalesDocuments/04-QUOTE-PRINT-PHASE-3B.md` đã có route/layout/print CSS/verification gợi ý.
   - Không cần schema mới, không PDF backend, không gửi tự động, không mở scope in hóa đơn `HD...`.
   - Phù hợp làm ngay nếu Owner muốn có đầu ra nhìn thấy nhanh sau PriceBook formula.

2. **Purchase/Supplier foundation**
   - Mức sẵn sàng: trung bình-cao.
   - Lý do: SoT đã có cho NCC, phiếu nhập, công nợ NCC, nhập cuộn/tấm vật lý, cập nhật `latest_purchase_cost`.
   - Nên chia nhỏ:
     - supplier list/detail + linked customer
     - purchase receipt draft/list/detail
     - post receipt tăng tồn/công nợ/cashbook và cập nhật `latest_purchase_cost`
   - Cần implement đánh giá kỹ vì chạm Inventory/Finance nhiều hơn Phase 3B.

3. **Supplier/customer link**
   - Mức sẵn sàng: cao nếu làm như lát cắt nhỏ.
   - Lý do: SoT đã chốt `linked_customer_id`; NCC có thể đồng thời là khách hàng.
   - Có thể đi cùng Purchase/Supplier hoặc tách nhỏ trước nếu cần nền dữ liệu.

4. **Production reconciliation read-only**
   - Mức sẵn sàng: trung bình.
   - Lý do: SoT đã chốt máy sản xuất chỉ để đối soát, không tự trừ kho MVP.
   - Chưa nên làm ingestion phức tạp/matching file-bill tự động nếu Owner chưa yêu cầu.

### Chưa nên mở nếu chưa chốt thêm

- Sửa/hủy hóa đơn có đảo kho/tiền/công nợ.
- Product group schema/UI/filter cho PriceBook formula.
- Purchase return/trả hàng nhập.
- Máy sản xuất tự động trừ kho hoặc tự match file với bill.
- HĐĐT/VAT, delivery/COD, kênh online.

## Lệnh thường dùng

```bash
# Main branch
cd /Users/vanlam/Documents/project/QC-OMS

# Current main
git switch main

# Dev thường: dùng .env.local trỏ Supabase Cloud dev/staging
npm ci
npm run dev

# Verification app/frontend
npm test
npm run typecheck
npm run lint
npm run build

# Optional local isolated Supabase, chỉ khi cần test DB/migration/RLS cô lập
npm run supabase:start
npm run supabase:reset
npm run test:db
npm run test:functions
```
