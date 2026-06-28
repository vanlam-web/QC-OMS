# QC-OMS Phase Checklist

Tài liệu này dùng để nối mạch giữa các session Codex.

## Trạng thái branch/worktree

- Main working branch: `tai_lieu_v1`
- Phase 0 branch đã merge vào `tai_lieu_v1`: `codex/phase-0`
- Phase 1A branch đang làm tiếp: `codex/phase-1a`
- Phase 1A worktree:
  `/Users/vanlam/Documents/project/QC-OMS/.worktrees/codex-phase-1a`

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

## Phase 1A — Real frontend app flow

Status: 🟡 Đang làm trên branch `codex/phase-1a`

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

### Verification đã pass trên `codex/phase-1a`

- [x] `npm test`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`

### Còn lại đề xuất cho Phase 1A

- [ ] Tạo E2E user local bằng Admin API/script.
- [ ] Kiểm thử thủ công flow thật:
  - [ ] login
  - [ ] gọi `/me`
  - [ ] chọn workstation
  - [ ] vào POS
  - [ ] logout
- [ ] Nối `AccessSync` vào `AuthProvider`/app shell thực tế.
- [ ] Xử lý route khi `/me` trả:
  - [ ] `ACCOUNT_INACTIVE`
  - [ ] `WORKSTATION_INVALID`
  - [ ] `PERMISSION_DENIED`
- [ ] Thêm UI loading/error state cho bootstrap session.
- [ ] Bỏ warning fast-refresh bằng cách tách hooks/context khỏi component file.
- [ ] Merge `codex/phase-1a` về `tai_lieu_v1` sau khi manual flow ổn.

## Phase 1B — Admin foundation UI

Status: ⬜ Chưa bắt đầu

- [ ] Workstation admin UI:
  - [ ] list
  - [ ] create
  - [ ] edit code/name/status
- [ ] User admin UI:
  - [ ] list/search/filter
  - [ ] detail
  - [ ] create user
  - [ ] active/inactive
  - [ ] replace permissions
- [ ] Permission catalog UI.
- [ ] Error mapping UI cho validation/conflict/rate limit.

## Phase 2 — POS business UI

Status: ⬜ Chưa bắt đầu

- [ ] Product search.
- [ ] Cart lines.
- [ ] Quantity/price/discount handling.
- [ ] Customer/debt display.
- [ ] Checkout/payment flow.
- [ ] Receipt/bill preview.

## Lệnh thường dùng

```bash
# Main branch
cd /Users/vanlam/Documents/project/QC-OMS

# Phase 1A worktree
cd /Users/vanlam/Documents/project/QC-OMS/.worktrees/codex-phase-1a

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
