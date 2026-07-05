# Vision Index Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `docs/01-VISION-TamNhin/README.md` a stable Vision index without stale status/date markers.

**Architecture:** Keep vision details in the three Vision files. Keep live status in `docs/PHASE-CHECKLIST.md`. Keep this README focused on what each Vision file owns and how later layers should use it.

**Tech Stack:** Markdown docs, git, `rg`, `git diff --check`.

---

## Scope

Docs-only cleanup. Do not rewrite product vision content in `01-VISION.md`, `02-TARGET-STATE-QC-OMS.md`, or `03-MVP-SCOPE.md`.

## Files

- Modify: `docs/01-VISION-TamNhin/README.md`
- Create: `docs/superpowers/plans/2026-07-05-vision-index-cleanup.md`

## Current Problems

- README contains old checked/date marker `2026-06-25`.
- README mixes index content with short summaries already owned by detail files.
- Icons in role table add visual noise and are inconsistent with newer compact README style.

---

### Task 1: Replace Vision README With Compact Index

**Files:**
- Modify: `docs/01-VISION-TamNhin/README.md`

- [ ] **Step 1: Replace current README content**

Use this structure:

```markdown
# PHẦN 1: TẦM NHÌN & MỤC TIÊU

> Source of Truth cho hướng đi sản phẩm, phạm vi MVP và trạng thái đích của QC-OMS.
>
> File này chỉ là index. Trạng thái sống / queue hiện tại nằm ở `../PHASE-CHECKLIST.md`.

## Đọc Trước Khi Sửa Vision

| Cần biết | File |
|---|---|
| Quy tắc tầng Vision | `_RULES.md` |
| Trạng thái sống / queue hiện tại | `../PHASE-CHECKLIST.md` |
| Tổng quan dự án | `../00-OVERVIEW-TongQuan/README.md` |

## File Chính

| File | Vai trò |
|---|---|
| `01-VISION.md` | Vision, Mission, giá trị cốt lõi, triết lý thiết kế |
| `02-TARGET-STATE-QC-OMS.md` | Trạng thái đích: QC-OMS thay hệ QuanLyXuong cũ |
| `03-MVP-SCOPE.md` | Phạm vi MVP hiện tại, phần trong scope và phần để sau |

## Quy Ước

- Vision là tầng định hướng; không ghi chi tiết UI, schema, API hoặc workflow kỹ thuật ở đây.
- Khi Owner đổi mục tiêu lớn hoặc phạm vi MVP, cập nhật tầng này trước.
- Các tầng 02-07 phải bám theo Vision/MVP Scope, không tự mở scope trái hướng.

← [Quay về README chính](../README.md)
```

- [ ] **Step 2: Verify stale status marker is gone**

Run:

```bash
rg -n "✅|🔨|⬜|⚠️|2026-06-25|Đã chốt|🎯|👥|📄" docs/01-VISION-TamNhin/README.md
```

Expected: no output.

---

### Task 2: Verify Links

**Files:**
- Read-only verification.

- [ ] **Step 1: Check linked files exist**

Run:

```bash
for f in 01-VISION-TamNhin/_RULES.md PHASE-CHECKLIST.md 00-OVERVIEW-TongQuan/README.md 01-VISION-TamNhin/01-VISION.md 01-VISION-TamNhin/02-TARGET-STATE-QC-OMS.md 01-VISION-TamNhin/03-MVP-SCOPE.md README.md; do test -f "docs/$f" || echo "missing docs/$f"; done
```

Expected: no output.

---

### Task 3: Verification And Commit

**Files:**
- Modified Vision README.
- This plan file.

- [ ] **Step 1: Run drift checks**

Run:

```bash
rg -n "✅|🔨|⬜|⚠️|2026-06-25|Đã chốt|🎯|👥|📄|TBD|TODO|FIXME" docs/01-VISION-TamNhin/README.md
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
git diff -- docs/01-VISION-TamNhin/README.md
```

Expected: only Vision README cleanup plus new plan file.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/01-VISION-TamNhin/README.md docs/superpowers/plans/2026-07-05-vision-index-cleanup.md
git commit -m "docs: simplify vision index"
```

- [ ] **Step 5: Push**

Run:

```bash
git push origin main
```

Expected: push succeeds.

---

## Self-Review

- Spec coverage: stable index, stale marker removal, link verification, commit/push.
- Placeholder scan: no `TBD`, `TODO`, or `FIXME`.
- Scope check: only Vision README and plan file.
