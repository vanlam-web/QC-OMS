# Overview Index Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `docs/00-OVERVIEW-TongQuan/README.md` a stable project overview, not a duplicated layer status board.

**Architecture:** Keep high-level product context and reading path in `00-OVERVIEW`. Keep live project status in `docs/PHASE-CHECKLIST.md`. Keep root navigation in `docs/README.md`.

**Tech Stack:** Markdown docs, git, `rg`, `git diff --check`.

---

## Scope

Docs-only cleanup. Do not change product requirements, business rules, database docs, backend docs, or application code.

## Files

- Modify: `docs/00-OVERVIEW-TongQuan/README.md`
- Create: `docs/superpowers/plans/2026-07-05-overview-index-cleanup.md`

## Current Problems

- `00-OVERVIEW-TongQuan/README.md` repeats layer status tables that can drift from `PHASE-CHECKLIST.md`.
- It still references old audit-warning context as current reading guidance.
- The "Danh sách đầy đủ" section duplicates the root README index.

---

### Task 1: Replace Overview README With Stable Overview

**Files:**
- Modify: `docs/00-OVERVIEW-TongQuan/README.md`

- [ ] **Step 1: Replace current README content**

Use this structure:

```markdown
# 00-OVERVIEW — TỔNG QUAN DỰ ÁN QC-OMS

> Điểm vào ngữ cảnh sản phẩm. Trạng thái sống / queue hiện tại nằm ở `../PHASE-CHECKLIST.md`.

## 1. Giới Thiệu

**QC-OMS** là hệ thống quản lý vận hành nội bộ cho **Xưởng Quảng Cáo Văn Lâm**.

- Hiện tại: quản lý bán hàng, sản xuất, kho, tài chính và báo cáo theo nhu cầu xưởng.
- Mục tiêu dài hạn: thay thế hệ QuanLyXuong cũ và có thể chuẩn hoá thành sản phẩm SaaS cho xưởng quảng cáo.

## 2. Người Dùng Chính

| Vai trò | Nhu cầu chính |
|---|---|
| Chủ xưởng | Xem vận hành, tài chính, báo cáo, cấu hình quan trọng |
| Nhân viên bán hàng / thu ngân | POS, khách hàng, báo giá, hóa đơn, thanh toán |
| Nhân viên kho / vật tư | Tồn kho, nhập hàng, kiểm kho, cuộn/tấm |
| Thợ máy / sản xuất | Theo dõi hàng đợi và đối soát sản xuất |

## 3. Cách Đọc Tài Liệu

| Mục đích | Đọc |
|---|---|
| Hiểu hệ thống tài liệu | `../README.md` |
| Biết việc đang làm / queue | `../PHASE-CHECKLIST.md` |
| Hiểu vision và MVP | `../01-VISION-TamNhin/README.md` |
| Sửa màn hình / UX | `../02-PRD-UX-PhongCanh/README.md` |
| Sửa nghiệp vụ | `../03-BUSINESS-NghiepVu/README.md` |
| Sửa schema | `../04-DATABASE/README.md` |
| Sửa API / backend | `../05-BACKEND-MayChu/README.md` |
| Sửa triển khai | `../07-DEPLOYMENT-TrienKhai/README.md` |

## 4. Thứ Tự Source Of Truth

```text
01 Vision
  -> 02 PRD/UX
  -> 03 Business
  -> 04 Database
  -> 05 Backend/API
  -> 06 Integration
  -> 07 Deployment
```

Khi có thay đổi nghiệp vụ hoặc chức năng, cập nhật đúng tầng Source of Truth trước. Không copy nội dung đầy đủ qua nhiều tầng.

## 5. Quy Tắc Cốt Lõi

- Mỗi thông tin chỉ có một nơi gốc.
- README dùng để điều hướng, không dùng làm bảng trạng thái chi tiết.
- Bridge/spec trong `../superpowers/` dùng để đối chiếu hoặc bàn giao, không thay thế Source of Truth đã promote.
- Live status và next queue nằm ở `../PHASE-CHECKLIST.md`.

← [Quay về README chính](../README.md)
```

- [ ] **Step 2: Verify duplicated status content is gone**

Run:

```bash
rg -n "Trạng thái hiện tại từng tầng|Danh sách đầy đủ|✅|🔨|⬜|⚠️|AUDIT_REPORT|2026-06-26" docs/00-OVERVIEW-TongQuan/README.md
```

Expected: no output.

---

### Task 2: Verify Links

**Files:**
- Read-only verification.

- [ ] **Step 1: Check linked files exist**

Run:

```bash
for f in README.md PHASE-CHECKLIST.md 01-VISION-TamNhin/README.md 02-PRD-UX-PhongCanh/README.md 03-BUSINESS-NghiepVu/README.md 04-DATABASE/README.md 05-BACKEND-MayChu/README.md 07-DEPLOYMENT-TrienKhai/README.md superpowers/README.md; do test -f "docs/$f" || echo "missing docs/$f"; done
```

Expected: no output.

---

### Task 3: Verification And Commit

**Files:**
- Modified overview README.
- This plan file.

- [ ] **Step 1: Run drift checks**

Run:

```bash
rg -n "Trạng thái hiện tại từng tầng|Danh sách đầy đủ|✅|🔨|⬜|⚠️|AUDIT_REPORT|2026-06-26|TBD|TODO|FIXME" docs/00-OVERVIEW-TongQuan/README.md
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
git diff -- docs/00-OVERVIEW-TongQuan/README.md
```

Expected: only overview README cleanup plus new plan file.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/00-OVERVIEW-TongQuan/README.md docs/superpowers/plans/2026-07-05-overview-index-cleanup.md
git commit -m "docs: simplify overview index"
```

- [ ] **Step 5: Push**

Run:

```bash
git push origin main
```

Expected: push succeeds.

---

## Self-Review

- Spec coverage: stable overview, no duplicated status, link verification, commit/push.
- Placeholder scan: no `TBD`, `TODO`, or `FIXME`.
- Scope check: only overview README and plan file.
