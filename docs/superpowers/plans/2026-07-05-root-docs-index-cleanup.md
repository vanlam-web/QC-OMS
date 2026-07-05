# Root Docs Index Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `docs/README.md` a compact entry index instead of another status board that can drift from `PHASE-CHECKLIST.md`.

**Architecture:** Keep live status in `docs/PHASE-CHECKLIST.md`. Keep historical implementation state in `docs/IMPLEMENTATION-CHECKLIST.md` and `docs/superpowers/*`. Keep root README as a stable navigation page with links to layer indexes and key coordination files only.

**Tech Stack:** Markdown docs, git, `rg`, `git diff --check`.

---

## Scope

Docs-only cleanup. Do not edit application code, database schema, API docs content, business rules, or PRD details.

## Files

- Modify: `docs/README.md`
- Modify: `docs/PHASE-CHECKLIST.md`

## Current Problems

- `docs/README.md` repeats many file-level status rows already covered by layer indexes and `PHASE-CHECKLIST.md`.
- The root README still has an old update date and can become stale even when current docs are correct.
- New AI workers may treat root README status tables as current truth, causing drift.

---

### Task 1: Convert Root README To Compact Index

**Files:**
- Modify: `docs/README.md`

- [ ] **Step 1: Replace long status catalog with compact navigation**

Replace `docs/README.md` with sections:

```markdown
# TÀI LIỆU DỰ ÁN — QC-OMS

> **Xưởng Văn Lâm** — Hệ thống Quản lý Sản xuất & Bán hàng
>
> Root index chỉ để điều hướng. Trạng thái sống nằm ở `PHASE-CHECKLIST.md`.

## Đọc trước khi làm

| Việc cần biết | File |
|---|---|
| Tổng quan hệ thống tài liệu | `00-OVERVIEW-TongQuan/README.md` |
| Source of Truth 8 tầng | `ARCHITECTURE.md` |
| Quy tắc viết tài liệu | `DOCUMENT_RULES.md` |
| Trạng thái sống / queue hiện tại | `PHASE-CHECKLIST.md` |
| Quy ước phối hợp Spec / Implement / Review | `WORKFLOW-SPEC-IMPLEMENT.md` |
| Quy ước specs/plans/drafts/handoff | `superpowers/README.md` |

## Source Of Truth Theo Tầng

| Tầng | Nội dung | Điểm vào |
|---|---|---|
| 0 | Tổng quan | `00-OVERVIEW-TongQuan/README.md` |
| 1 | Tầm nhìn, MVP, target state | `01-VISION-TamNhin/README.md` |
| 2 | PRD / UX / màn hình | `02-PRD-UX-PhongCanh/README.md` |
| 3 | Nghiệp vụ | `03-BUSINESS-NghiepVu/README.md` |
| 4 | Database / schema / RLS | `04-DATABASE/README.md` |
| 5 | Backend / API | `05-BACKEND-MayChu/README.md` |
| 6 | Tích hợp | `06-INTEGRATION-KetHop/README.md` |
| 7 | Triển khai / vận hành | `07-DEPLOYMENT-TrienKhai/README.md` |

## File Điều Phối

| File | Vai trò |
|---|---|
| `PHASE-CHECKLIST.md` | Live status board, queue hiện tại, handoff giữa luồng |
| `PROJECT-COORDINATION.md` | Điều phối owner / next owner khi cần |
| `REVIEW-ISSUES.md` | Issue tracker do Review Thread duy trì |
| `IMPLEMENTATION-CHECKLIST.md` | Log baseline implementation, không phải roadmap sống |
| `CHANGELOG-AI.md` | Lịch sử phối hợp AI |

## Ghi Chú

- Không dùng root README để đánh dấu từng file đã làm/chưa làm.
- Nếu cần biết trạng thái hiện tại, đọc `PHASE-CHECKLIST.md` trước.
- Nếu cần sửa nghiệp vụ, sửa đúng layer Source of Truth trước, bridge/spec chỉ dùng để đối chiếu.
```

- [ ] **Step 2: Verify root README has no file-level status table**

Run:

```bash
rg -n "Ký hiệu|Tổng kết trạng thái|📂 Mục lục toàn bộ tài liệu|Cập nhật: 2026-06-28|✅ Historical|⚠️" docs/README.md
```

Expected: no output.

---

### Task 2: Mark Deferred README Cleanup As Done

**Files:**
- Modify: `docs/PHASE-CHECKLIST.md`

- [ ] **Step 1: Update deferred note**

Find this bullet under `Chưa nên mở nếu chưa chốt thêm`:

```markdown
- Refactor lớn `docs/README.md`; trước mắt dùng `PHASE-CHECKLIST.md` làm trạng thái sống.
```

Replace with:

```markdown
- [x] Root `docs/README.md` đã gọn lại thành index điều hướng; không giữ status chi tiết ở đó nữa.
```

- [ ] **Step 2: Verify note appears once**

Run:

```bash
rg -n "Root `docs/README.md`|Refactor lớn `docs/README.md`" docs/PHASE-CHECKLIST.md
```

Expected: one line with checked root README note.

---

### Task 3: Verification And Commit

**Files:**
- Modified docs from tasks above.
- This plan file.

- [ ] **Step 1: Run drift checks**

Run:

```bash
rg -n "Ký hiệu|Tổng kết trạng thái|📂 Mục lục toàn bộ tài liệu|Cập nhật: 2026-06-28|Refactor lớn `docs/README.md`|TBD|TODO|FIXME" docs/README.md docs/PHASE-CHECKLIST.md
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
git diff -- docs/README.md docs/PHASE-CHECKLIST.md
```

Expected: only root docs index cleanup and PHASE note update.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/README.md docs/PHASE-CHECKLIST.md docs/superpowers/plans/2026-07-05-root-docs-index-cleanup.md
git commit -m "docs: simplify root documentation index"
```

- [ ] **Step 5: Push**

Run:

```bash
git push origin main
```

Expected: push succeeds.

---

## Self-Review

- Spec coverage: covers compact root index, status ownership, deferred note cleanup, verification, commit, push.
- Placeholder scan: no `TBD`, `TODO`, `FIXME`, or vague steps.
- Scope check: docs-only, no business rule change, no implementation change.
