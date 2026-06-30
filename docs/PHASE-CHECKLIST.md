# QC-OMS Phase Checklist

Tài liệu này dùng để nối mạch giữa các session Codex.

## Trạng thái branch/worktree

- Main working branch: `main`
- Phase 1A đã merge vào `main`: PR #1, merge commit `b503e98`
- Phase 1B đã merge vào `main`: PR #2
- Phase 1C plan sync branch: `codex/phase-1c-plan-sync`
- Phase 1C plan: `docs/superpowers/plans/2026-06-30-phase-1c-order-checkout-inventory-finance.md`

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

Status: 🟡 Đang cập nhật plan theo Source of Truth Sales/Inventory/Finance mới trên branch `codex/phase-1c-plan-sync`

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

### Cần làm khi bắt đầu implement Phase 1C

- [ ] Tạo implementation branch từ `main` sau khi plan sync được merge.
- [ ] Implement schema/RPC theo plan Phase 1C.
- [ ] Implement Order API checkout/quote/revise.
- [ ] Implement Inventory/Finance API minimum cho checkout.
- [ ] Implement POS checkout UI tối thiểu.
- [ ] Verify local và server shared-dev trước khi PR.

## Phase 2 — POS business UI

Status: ⬜ Chưa bắt đầu

- [x] Product quick grid cơ bản.
- [ ] Cart lines.
- [ ] Quantity/price/discount handling.
- [x] Customer search/create/select cơ bản trong branch Phase 1B.
- [ ] Customer debt display.
- [ ] Checkout/payment flow.
- [ ] Receipt/bill preview.

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
