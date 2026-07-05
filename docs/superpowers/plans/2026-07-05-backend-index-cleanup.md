# Backend Index Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `docs/05-BACKEND-MayChu/README.md` a compact Backend/API Source of Truth index without stale per-file status tables.

**Architecture:** Keep API/workflow detail in domain files (`POS`, `Inventory`, `Finance`, `Purchase`, `Production`, `BOM`) and foundation docs. Keep live work status in `docs/PHASE-CHECKLIST.md`. Keep this README focused on layer responsibility, entry points, and backend authoring rules.

**Tech Stack:** Markdown docs, git, `find`, `rg`, `git diff --check`.

---

## Scope

Docs-only cleanup. Do not rewrite API contracts, backend workflows, permissions, validation rules, tests, or implementation notes inside domain files.

## Files

- Modify: `docs/05-BACKEND-MayChu/README.md`
- Create: `docs/superpowers/plans/2026-07-05-backend-index-cleanup.md`

## Current Problems

- README has per-file and per-module status rows (`Một phần`, `Draft`, `Hoàn tất`, `Chốt`) that can drift from live status.
- It repeats implementation evidence that belongs in implementation logs, not the backend index.
- Entry points are harder to scan because rules appear after status tables.

---

### Task 1: Replace Backend README With Compact API Index

**Files:**
- Modify: `docs/05-BACKEND-MayChu/README.md`

- [ ] **Step 1: Replace current README content**

Use this structure:

```markdown
# PHẦN 5: MÁY CHỦ & API (BACKEND)

> Source of Truth cho API, use case, validation, permission, workflow thực thi và request/response model.
>
> File này chỉ là index. Việc đang làm / queue hiện tại nằm ở `../PHASE-CHECKLIST.md`.

## Đọc Trước Khi Sửa Backend

| Cần biết | File |
|---|---|
| Quy tắc tầng Backend | `_RULES.md` |
| Quy ước backend chung | `BACKEND_CONVENTIONS.md` |
| Việc đang làm / queue hiện tại | `../PHASE-CHECKLIST.md` |
| Nghiệp vụ nguồn | `../03-BUSINESS-NghiepVu/README.md` |
| Schema nguồn | `../04-DATABASE/README.md` |

## Nền Tảng Chung

| File | Vai trò |
|---|---|
| `FOUNDATION-TECHNICAL-DESIGN.md` | Kiến trúc FE-BE, source layout, security baseline |
| `FOUNDATION-API.md` | Auth, profile, permission, workstation |
| `BACKEND_CONVENTIONS.md` | Naming, validation, error handling, API style |

## Domain API

| Domain | Điểm vào | Nội dung |
|---|---|---|
| POS | `POS/README.md` | Pricing, customer/product lookup, order/quote/checkout, toast, POS auth |
| Inventory | `Inventory/README.md` | Tồn kho, cuộn/tấm, stock movement, kiểm kho |
| Finance | `Finance/README.md` | Tài khoản quỹ, công nợ, thu nợ, sổ quỹ, phiếu thu/chi, đối soát |
| Purchase | `Purchase/PURCHASE-API.md` | Supplier, purchase receipt draft/post, supplier payment |
| Production | `Production/PRODUCTION-RECONCILIATION-API.md` | Đối soát sản xuất / hàng đợi máy |
| BOM | `BOM/BOM-API.md` | BOM/combo vật tư |

## Phạm Vi Tầng

| Loại | Ghi ở Backend |
|---|---|
| Chỉ ghi | API spec, use case, validation, permission, auth, error handling, request/response model |
| Chỉ tham chiếu | PRD/UX, business rule, database schema, integration |
| Không ghi | Vision, wireframe, business rule đầy đủ, schema đầy đủ, frontend code, hạ tầng |

## Quy Ước

- Khi nghiệp vụ thay đổi, cập nhật tầng Business trước, rồi Database, rồi Backend.
- Backend không copy schema đầy đủ; link sang tầng 04 khi cần.
- Backend không copy UI/wireframe; link sang tầng 02 khi cần.
- Không dùng README này làm bảng trạng thái từng file.

## Cấu Trúc Gợi Ý Cho API / Use Case

1. Mục đích
2. Input
3. Validation
4. Workflow
5. Permission
6. Output
7. Error Handling
8. Business Rule liên quan

← [Quay về README chính](../README.md)
```

- [ ] **Step 2: Verify stale status table is gone**

Run:

```bash
rg -n "Nội dung đã có|Nội dung dự kiến|Trạng thái|✅|🔨|⬜|⚠️|Một phần|Draft|Hoàn tất|Chốt Giai đoạn|Bằng chứng implement" docs/05-BACKEND-MayChu/README.md
```

Expected: no output.

---

### Task 2: Verify API Entry Files Exist

**Files:**
- Read-only verification.

- [ ] **Step 1: Check linked files exist**

Run:

```bash
for f in _RULES.md BACKEND_CONVENTIONS.md FOUNDATION-TECHNICAL-DESIGN.md FOUNDATION-API.md POS/README.md Inventory/README.md Finance/README.md Purchase/PURCHASE-API.md Production/PRODUCTION-RECONCILIATION-API.md BOM/BOM-API.md ../PHASE-CHECKLIST.md ../03-BUSINESS-NghiepVu/README.md ../04-DATABASE/README.md; do test -f "docs/05-BACKEND-MayChu/$f" || echo "missing $f"; done
```

Expected: no output.

---

### Task 3: Verification And Commit

**Files:**
- Modified Backend README.
- This plan file.

- [ ] **Step 1: Run drift checks**

Run:

```bash
rg -n "Nội dung đã có|Nội dung dự kiến|Trạng thái|✅|🔨|⬜|⚠️|Một phần|Draft|Hoàn tất|Chốt Giai đoạn|Bằng chứng implement|TBD|TODO|FIXME" docs/05-BACKEND-MayChu/README.md
```

Expected: no output.

- [ ] **Step 2: Run whitespace check**

Run:

```bash
git diff --check
```

Expected: no output.

- [ ] **Step 3: Review changed files**

Run:

```bash
git diff --stat
git diff -- docs/05-BACKEND-MayChu/README.md
```

Expected: only Backend README cleanup plus new plan file.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/05-BACKEND-MayChu/README.md docs/superpowers/plans/2026-07-05-backend-index-cleanup.md
git commit -m "docs: simplify backend index"
```

- [ ] **Step 5: Push**

Run:

```bash
git push origin main
```

Expected: push succeeds.

---

## Self-Review

- Spec coverage: layer role, foundation docs, domain API index, stale status removal, link verification, commit/push.
- Placeholder scan: no `TBD`, `TODO`, or `FIXME`.
- Scope check: only Backend README and plan file.
