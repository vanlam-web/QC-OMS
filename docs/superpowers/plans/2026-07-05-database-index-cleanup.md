# Database Index Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `docs/04-DATABASE/README.md` a compact Database Source of Truth index without stale per-file status tables.

**Architecture:** Keep schema detail in domain files (`Sales`, `Inventory`, `Finance`, `Purchase`, `BOM`, `System`) and shared ERD/RLS docs. Keep live work status in `docs/PHASE-CHECKLIST.md`. Keep this README focused on layer responsibility, entry points, and database rules.

**Tech Stack:** Markdown docs, git, `find`, `rg`, `git diff --check`.

---

## Scope

Docs-only cleanup. Do not rewrite schema, migrations, RLS policy details, SQL, or implementation evidence.

## Files

- Modify: `docs/04-DATABASE/README.md`
- Create: `docs/superpowers/plans/2026-07-05-database-index-cleanup.md`

## Current Problems

- README has per-file and per-domain status rows (`Một phần`, `Draft`, `Chốt`) that can drift from live status.
- The title says "PHẦN 3" even though this is layer 04.
- Domain index mixes table lists and status, making it hard to scan.

---

### Task 1: Replace Database README With Compact Schema Index

**Files:**
- Modify: `docs/04-DATABASE/README.md`

- [ ] **Step 1: Replace current README content**

Use this structure:

```markdown
# PHẦN 4: CƠ SỞ DỮ LIỆU (DATABASE)

> Source of Truth cho schema, quan hệ bảng, RLS và dữ liệu lưu trữ trên Supabase/PostgreSQL.
>
> File này chỉ là index. Việc đang làm / queue hiện tại nằm ở `../PHASE-CHECKLIST.md`.

## Đọc Trước Khi Sửa Database

| Cần biết | File |
|---|---|
| Quy tắc tầng Database | `_RULES.md` |
| Việc đang làm / queue hiện tại | `../PHASE-CHECKLIST.md` |
| Nghiệp vụ nguồn | `../03-BUSINESS-NghiepVu/README.md` |
| Backend/API dùng schema | `../05-BACKEND-MayChu/README.md` |

## Nền Tảng Chung

| File | Vai trò |
|---|---|
| `01-ERD.md` | ERD tổng quan và quan hệ theo giai đoạn |
| `03-RLS.md` | Nguyên tắc RLS chung |
| `System/AUTH-PERMISSIONS.md` | Organization, profile, workstation, permission |

## Domain Schema

| Domain | Điểm vào | Nội dung |
|---|---|---|
| Sales | `Sales/README.md` | Customers, pricing, products, quotes/orders, order snapshots |
| Inventory | `Inventory/README.md` | Units, stock settings, conversions, movements, rolls, sheets, stocktakes |
| Finance | `Finance/README.md` | Payment receipts, debt allocations, cashbook, reconciliation |
| Purchase | `Purchase/PURCHASE-TABLES.md` | Suppliers, purchase receipts, supplier payments, purchase roll/sheet objects |
| BOM | `BOM/BOM-TABLES.md` | BOM/combo vật tư |
| System | `System/README.md` | Auth, profile, workstation, permission |

## Quy Ước

- Database chỉ mô tả schema, quan hệ, constraint, RLS và dữ liệu lưu.
- Không copy nghiệp vụ đầy đủ; link sang tầng 03 khi cần.
- Không copy API workflow; link sang tầng 05 khi cần.
- Không dùng README này làm bảng trạng thái từng file.

← [Quay về README chính](../README.md)
```

- [ ] **Step 2: Verify stale status table is gone**

Run:

```bash
rg -n "Nội dung đã có|Nội dung theo domain|Trạng thái|✅|🔨|⬜|⚠️|Một phần|Draft|Chốt Giai đoạn" docs/04-DATABASE/README.md
```

Expected: no output.

---

### Task 2: Verify Schema Entry Files Exist

**Files:**
- Read-only verification.

- [ ] **Step 1: Check linked files exist**

Run:

```bash
for f in _RULES.md 01-ERD.md 03-RLS.md System/AUTH-PERMISSIONS.md Sales/README.md Inventory/README.md Finance/README.md Purchase/PURCHASE-TABLES.md BOM/BOM-TABLES.md System/README.md ../PHASE-CHECKLIST.md ../03-BUSINESS-NghiepVu/README.md ../05-BACKEND-MayChu/README.md; do test -f "docs/04-DATABASE/$f" || echo "missing $f"; done
```

Expected: no output.

---

### Task 3: Verification And Commit

**Files:**
- Modified Database README.
- This plan file.

- [ ] **Step 1: Run drift checks**

Run:

```bash
rg -n "Nội dung đã có|Nội dung theo domain|Trạng thái|✅|🔨|⬜|⚠️|Một phần|Draft|Chốt Giai đoạn|TBD|TODO|FIXME" docs/04-DATABASE/README.md
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
git diff -- docs/04-DATABASE/README.md
```

Expected: only Database README cleanup plus new plan file.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/04-DATABASE/README.md docs/superpowers/plans/2026-07-05-database-index-cleanup.md
git commit -m "docs: simplify database index"
```

- [ ] **Step 5: Push**

Run:

```bash
git push origin main
```

Expected: push succeeds.

---

## Self-Review

- Spec coverage: layer role, shared docs, domain schema index, stale status removal, link verification, commit/push.
- Placeholder scan: no `TBD`, `TODO`, or `FIXME`.
- Scope check: only Database README and plan file.
