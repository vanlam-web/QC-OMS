# PRD UX Index Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `docs/02-PRD-UX-PhongCanh/README.md` a compact PRD/UX module index, not a duplicated status board.

**Architecture:** Keep detailed screen requirements in module files. Keep live status and queue in `docs/PHASE-CHECKLIST.md`. Keep this README focused on "where to read next" and layer rules for PRD/UX.

**Tech Stack:** Markdown docs, git, `find`, `rg`, `git diff --check`.

---

## Scope

Docs-only cleanup. Do not edit PRD details, business rules, database docs, backend docs, or application code.

## Files

- Modify: `docs/02-PRD-UX-PhongCanh/README.md`
- Create: `docs/superpowers/plans/2026-07-05-prd-ux-index-cleanup.md`

## Current Problems

- `02-PRD-UX-PhongCanh/README.md` repeats a large tree plus a file-level status table.
- Several files exist but are missing from the hand-written status table, especially newer POS K01/K02 files.
- Status icons in this README can drift from `PHASE-CHECKLIST.md`.

---

### Task 1: Replace PRD README With Compact Module Index

**Files:**
- Modify: `docs/02-PRD-UX-PhongCanh/README.md`

- [ ] **Step 1: Replace current README content**

Use this structure:

```markdown
# PHẦN 2: ĐẶC TẢ TÍNH NĂNG & UX

> Source of Truth cho màn hình, luồng thao tác, bố cục, trạng thái UI và hành vi người dùng.
>
> File này chỉ là index. Trạng thái sống / queue hiện tại nằm ở `../PHASE-CHECKLIST.md`.

## Đọc Trước Khi Sửa PRD/UX

| Cần biết | File |
|---|---|
| Quy tắc tầng PRD/UX | `_RULES.md` |
| Trạng thái sống / queue hiện tại | `../PHASE-CHECKLIST.md` |
| Quy ước phối hợp Spec / Implement / Review | `../WORKFLOW-SPEC-IMPLEMENT.md` |
| UI shell, token, layout quản lý dùng chung | `System/00-UI-SHELL-V1.md` |

## Module Chính

| Module | Điểm vào | Nội dung |
|---|---|---|
| Overview | `Overview/README.md` | Dashboard và tổng quan vận hành |
| POS | `POS/README.md` | Bán hàng, giỏ hàng, khách, sản phẩm, thanh toán |
| Inventory | `Inventory/README.md` | Kho hàng, tồn kho, cuộn/tấm, kiểm kho |
| Sales Documents | `SalesDocuments/README.md` | Chứng từ bán hàng, danh sách và chi tiết |
| Purchase | `Purchase/01-SUPPLIER-PURCHASE.md` | Nhà cung cấp, phiếu nhập, thanh toán NCC |
| Customers | `Customers/README.md` | Danh sách khách hàng, chi tiết, công nợ |
| PriceBook | `PriceBook/README.md` | Bảng giá và chi tiết giá |
| Finance | `Finance/README.md` | Sổ quỹ, công nợ, đối soát |
| Reports | `Reports/README.md` | Báo cáo cuối ngày, bán hàng, công nợ, tồn kho |
| System | `System/README.md` | UI shell, người dùng, phân quyền, cấu hình |

## POS Chi Tiết

| Khu | Điểm vào | Ghi chú |
|---|---|---|
| Tổng thể POS | `POS/01-POS-LAYOUT.md` | Bản đồ màn hình bán hàng |
| K01 | `POS/K01/01-K01-TOPBAR.md` | Thanh đỉnh, tìm kiếm, tab, profile, khui vật tư |
| K02 | `POS/K02/01-K02-GIO-HANG.md` | Giỏ hàng, dòng sản phẩm, ghi chú, hàng đợi |
| K03 | `POS/K03/01-K03A-DOI-TAC.md` | Đối tác, sản phẩm, toast, thanh toán |

## Quy Ước

- Không ghi trạng thái từng file ở README này.
- Không copy nghiệp vụ đầy đủ vào PRD/UX; link sang `../03-BUSINESS-NghiepVu/` khi cần.
- Không copy schema/API vào PRD/UX; link sang `../04-DATABASE/` hoặc `../05-BACKEND-MayChu/`.
- Khi thêm module hoặc trang mới, thêm link vào index này và viết chi tiết trong file module.
```

- [ ] **Step 2: Verify old status table is gone**

Run:

```bash
rg -n "Trạng thái các khối|📋|🔨|✅|⬜|⚠️|tree structure|Wireframe tỉ lệ" docs/02-PRD-UX-PhongCanh/README.md
```

Expected: no output.

---

### Task 2: Verify Linked Entry Files Exist

**Files:**
- Read-only verification.

- [ ] **Step 1: Check module entry files**

Run:

```bash
for f in _RULES.md Overview/README.md POS/README.md POS/01-POS-LAYOUT.md POS/K01/01-K01-TOPBAR.md POS/K02/01-K02-GIO-HANG.md POS/K03/01-K03A-DOI-TAC.md Inventory/README.md SalesDocuments/README.md Purchase/01-SUPPLIER-PURCHASE.md Customers/README.md PriceBook/README.md Finance/README.md Reports/README.md System/README.md System/00-UI-SHELL-V1.md; do test -f "docs/02-PRD-UX-PhongCanh/$f" || echo "missing $f"; done
```

Expected: no output.

---

### Task 3: Verification And Commit

**Files:**
- Modified README.
- This plan file.

- [ ] **Step 1: Run drift checks**

Run:

```bash
rg -n "Trạng thái các khối|📋|🔨|✅|⬜|⚠️|tree structure|Wireframe tỉ lệ|TBD|TODO|FIXME" docs/02-PRD-UX-PhongCanh/README.md
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
git diff -- docs/02-PRD-UX-PhongCanh/README.md
```

Expected: only PRD/UX README index cleanup.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/02-PRD-UX-PhongCanh/README.md docs/superpowers/plans/2026-07-05-prd-ux-index-cleanup.md
git commit -m "docs: simplify prd ux index"
```

- [ ] **Step 5: Push**

Run:

```bash
git push origin main
```

Expected: push succeeds.

---

## Self-Review

- Spec coverage: root goal covered by Task 1, link existence by Task 2, verification/commit by Task 3.
- Placeholder scan: no `TBD`, `TODO`, or `FIXME`.
- Scope check: only PRD/UX README and plan file; no product requirement changes.
