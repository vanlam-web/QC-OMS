# Business Index Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `docs/03-BUSINESS-NghiepVu/README.md` a compact Business Source of Truth index without stale per-file status tables.

**Architecture:** Keep business rules in domain folders (`Sales`, `Inventory`, `Finance`, `Purchase`, `BOM`). Keep live work status in `docs/PHASE-CHECKLIST.md`. Keep this README focused on layer responsibility and entry files.

**Tech Stack:** Markdown docs, git, `find`, `rg`, `git diff --check`.

---

## Scope

Docs-only cleanup. Do not rewrite business rules inside domain files.

## Files

- Modify: `docs/03-BUSINESS-NghiepVu/README.md`
- Create: `docs/superpowers/plans/2026-07-05-business-index-cleanup.md`

## Current Problems

- README has per-file status rows (`Đang xây dựng`, `Hoàn tất`, `Chưa có`) that can drift from live status.
- README omits existing `Purchase` and `BOM` domains.
- Top-down checklist uses status icons instead of pointing to current Source of Truth flow.

---

### Task 1: Replace Business README With Compact Domain Index

**Files:**
- Modify: `docs/03-BUSINESS-NghiepVu/README.md`

- [ ] **Step 1: Replace current README content**

Use this structure:

```markdown
# PHẦN 3: NGHIỆP VỤ (BUSINESS)

> Source of Truth cho quy tắc nghiệp vụ, workflow, điều kiện áp dụng, công thức và acceptance criteria.
>
> File này chỉ là index. Trạng thái sống / queue hiện tại nằm ở `../PHASE-CHECKLIST.md`.

## Đọc Trước Khi Sửa Business

| Cần biết | File |
|---|---|
| Quy tắc tầng Business | `_RULES.md` |
| Trạng thái sống / queue hiện tại | `../PHASE-CHECKLIST.md` |
| Vision và MVP scope | `../01-VISION-TamNhin/README.md` |
| PRD/UX liên quan | `../02-PRD-UX-PhongCanh/README.md` |

## Phạm Vi Tầng

| Loại | Ghi ở Business |
|---|---|
| Chỉ ghi | Business rule, business workflow, state machine, điều kiện, công thức, domain event, acceptance criteria nghiệp vụ |
| Chỉ tham chiếu | UI, database, API, integration |
| Không ghi | Wireframe, schema, SQL, API spec, backend workflow, code, hạ tầng |

## Domain Chính

| Domain | Điểm vào | Nội dung |
|---|---|---|
| Sales | `Sales/README.md` | Khách hàng POS, giá bán, tính tiền, lifecycle, checkout, công nợ |
| Inventory | `Inventory/README.md` | Tồn kho, đơn vị, kiểm kho, cuộn/tấm, đối soát sản xuất |
| Finance | `Finance/README.md` | Sổ quỹ, phiếu thu/chi, đối soát, công nợ liên quan tiền |
| Purchase | `Purchase/README.md` | Nhà cung cấp, phiếu nhập, thanh toán NCC |
| BOM | `BOM/README.md` | Combo vật tư, định mức, rule BOM |

## Quy Ước

- Khi nghiệp vụ thay đổi, cập nhật tầng Business trước, rồi mới cập nhật PRD/UX, Database và Backend.
- Business không copy schema/API; chỉ link sang tầng 04/05 khi cần.
- Không dùng README này làm bảng trạng thái từng file.

## Cấu Trúc Gợi Ý Cho Business Rule

1. ID
2. Mục đích
3. Mô tả
4. Điều kiện áp dụng
5. Quy trình xử lý
6. Ngoại lệ
7. Acceptance Criteria

← [Quay về README chính](../README.md)
```

- [ ] **Step 2: Verify stale status table is gone**

Run:

```bash
rg -n "Nội dung đã có|Nội dung dự kiến|Trạng thái|✅|🔨|⬜|⚠️|Đang xây dựng|Hoàn tất|Chưa có" docs/03-BUSINESS-NghiepVu/README.md
```

Expected: no output.

---

### Task 2: Verify Domain Entry Files Exist

**Files:**
- Read-only verification.

- [ ] **Step 1: Check linked files exist**

Run:

```bash
for f in _RULES.md Sales/README.md Inventory/README.md Finance/README.md Purchase/README.md BOM/README.md ../PHASE-CHECKLIST.md ../01-VISION-TamNhin/README.md ../02-PRD-UX-PhongCanh/README.md; do test -f "docs/03-BUSINESS-NghiepVu/$f" || echo "missing $f"; done
```

Expected: no output.

---

### Task 3: Verification And Commit

**Files:**
- Modified Business README.
- This plan file.

- [ ] **Step 1: Run drift checks**

Run:

```bash
rg -n "Nội dung đã có|Nội dung dự kiến|Trạng thái|✅|🔨|⬜|⚠️|Đang xây dựng|Hoàn tất|Chưa có|TBD|TODO|FIXME" docs/03-BUSINESS-NghiepVu/README.md
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
git diff -- docs/03-BUSINESS-NghiepVu/README.md
```

Expected: only Business README cleanup plus new plan file.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/03-BUSINESS-NghiepVu/README.md docs/superpowers/plans/2026-07-05-business-index-cleanup.md
git commit -m "docs: simplify business index"
```

- [ ] **Step 5: Push**

Run:

```bash
git push origin main
```

Expected: push succeeds.

---

## Self-Review

- Spec coverage: layer responsibility, complete domain index, stale status removal, link verification, commit/push.
- Placeholder scan: no `TBD`, `TODO`, or `FIXME`.
- Scope check: only Business README and plan file.
