# Docs Governance Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make QC-OMS docs easier to follow by keeping one live status source, marking trace/history files clearly, and removing stale checklist drift.

**Architecture:** Keep Source of Truth in promoted layers `02-05`. Keep `PHASE-CHECKLIST.md` as the live status board. Treat `IMPLEMENTATION-CHECKLIST.md` and `docs/superpowers/*` as implementation/spec history unless explicitly promoted.

**Tech Stack:** Markdown docs, git, `rg`, `git diff --check`.

---

## Scope

This plan only changes documentation. It does not edit application code, migrations, tests, or API behavior.

## Files

- Modify: `docs/PHASE-CHECKLIST.md`
- Modify: `docs/IMPLEMENTATION-CHECKLIST.md`
- Modify: `docs/superpowers/README.md`
- Modify: `docs/superpowers/specs/2026-07-05-spec-gap-next-work-deduped.md`
- Modify: `docs/superpowers/specs/2026-07-05-inventory-ui-implementation-bridge.md`
- Modify: `docs/superpowers/specs/2026-07-05-finance-ui-implementation-bridge.md`
- Modify: `docs/superpowers/specs/2026-07-05-reports-api-ui-bridge.md`
- Optional modify: `docs/README.md`

## Current Problems

- `PHASE-CHECKLIST.md`, `IMPLEMENTATION-CHECKLIST.md`, and `2026-07-05-spec-gap-next-work-deduped.md` all track status.
- `spec-gap-next-work-deduped.md` still says `Push main` is open, but main was pushed.
- Bridge docs live under `docs/superpowers/specs/`, which is trace/history by rule, but their headers can read like current Source of Truth.
- `docs/README.md` tries to list many file-level statuses and is hard to scan.

---

### Task 1: Fix Live Status Drift

**Files:**
- Modify: `docs/PHASE-CHECKLIST.md`
- Modify: `docs/superpowers/specs/2026-07-05-spec-gap-next-work-deduped.md`

- [ ] **Step 1: Update `PHASE-CHECKLIST.md` current spec sync status**

Replace the current `Spec sync/correction` block with:

```markdown
1. **Spec sync/correction**
   - Trạng thái: ✅ đã đồng bộ và push lên `main` ở commit `3b50523`.
   - Đã cập nhật: SalesDocuments docs, Inventory business rules, Inventory/Finance/Reports bridge docs, spec gap deduped checklist.
   - Còn lại: Owner review docs; nếu ổn thì không cần thêm việc.
```

- [ ] **Step 2: Update `spec-gap-next-work-deduped.md` checklist**

In `## 1B. Checklist hien trang`, change:

```markdown
- [ ] Push `main` len remote.
- [ ] Owner review lai docs sau khi push.
```

to:

```markdown
- [x] Push `main` len remote tai commit `3b50523`.
- [ ] Owner review lai docs sau khi push.
```

- [ ] **Step 3: Verify no stale push text remains**

Run:

```bash
rg -n "Push `main`|main local|main remote|68f3cff|3b50523" docs/PHASE-CHECKLIST.md docs/superpowers/specs/2026-07-05-spec-gap-next-work-deduped.md
```

Expected:

```text
docs/PHASE-CHECKLIST.md:...commit `3b50523`
docs/superpowers/specs/2026-07-05-spec-gap-next-work-deduped.md:...commit `3b50523`
```

---

### Task 2: Make Checklist Ownership Clear

**Files:**
- Modify: `docs/IMPLEMENTATION-CHECKLIST.md`
- Modify: `docs/PHASE-CHECKLIST.md`

- [ ] **Step 1: Add ownership note to `IMPLEMENTATION-CHECKLIST.md`**

Insert under the title:

```markdown
> **Role:** Implementation log for the latest baseline work. This is not the long-term live roadmap.
> **Live status source:** Use [PHASE-CHECKLIST.md](./PHASE-CHECKLIST.md) for current queue and next work.
```

- [ ] **Step 2: Add ownership note to `PHASE-CHECKLIST.md`**

Insert after the opening paragraph:

```markdown
> **Role:** Live status board for current project state, next queue, and cross-thread handoff.
> Historical implementation logs may exist elsewhere, but this file wins for current status.
```

- [ ] **Step 3: Verify role notes are present**

Run:

```bash
rg -n "Live status source|Live status board|Implementation log" docs/IMPLEMENTATION-CHECKLIST.md docs/PHASE-CHECKLIST.md
```

Expected: 3 matching lines.

---

### Task 3: Mark Bridge Docs As Trace, Not Source Of Truth

**Files:**
- Modify: `docs/superpowers/README.md`
- Modify: `docs/superpowers/specs/2026-07-05-inventory-ui-implementation-bridge.md`
- Modify: `docs/superpowers/specs/2026-07-05-finance-ui-implementation-bridge.md`
- Modify: `docs/superpowers/specs/2026-07-05-reports-api-ui-bridge.md`

- [ ] **Step 1: Add bridge status rule**

In `docs/superpowers/README.md`, add this bullet under `## Status Rules`:

```markdown
- Files ending in `-bridge.md` or containing `implementation-bridge` are trace bridges. They explain how a slice mapped Source of Truth to implementation, but they do not replace promoted Source of Truth docs.
```

- [ ] **Step 2: Replace bridge headers**

For each bridge file, replace the `Trang thai` line with:

```markdown
> Trang thai: Trace bridge, not Source of Truth. Da dong bo voi main o commit `3b50523`.
```

- [ ] **Step 3: Verify bridge headers**

Run:

```bash
rg -n "Trace bridge, not Source of Truth|implementation-bridge" docs/superpowers/README.md docs/superpowers/specs/2026-07-05-*-implementation-bridge.md
```

Expected: bridge rule plus 3 bridge file headers.

---

### Task 4: Compact Deduped Spec Gap

**Files:**
- Modify: `docs/superpowers/specs/2026-07-05-spec-gap-next-work-deduped.md`

- [ ] **Step 1: Rename section `## 3`**

Change:

```markdown
## 3. Viec con nen dac ta tiep
```

to:

```markdown
## 3. Bridge da tao va viec con mo
```

- [ ] **Step 2: Remove stale proposed-output wording**

Delete repeated mini-blocks that start with:

```markdown
Output de xuat:
```

Keep the actual file links under `Da lam:` or `Da sync:`.

- [ ] **Step 3: Add current open checklist**

Before `## 4. Viec de sau`, add:

```markdown
## 3B. Viec con mo sau khi dong bo

- [ ] Owner review docs bridge va Inventory business updates.
- [ ] Khi bat dau slice moi, cap nhat SoT truoc, bridge chi dung de doi chieu.
- [ ] Khi implement report chinh thuc, xem xet tao API `/reports/*` de tranh UI tu cong so lieu quan trong.
- [ ] Khi implement khui vat tu, dua rule tu bridge vao PRD/Business/API tuong ung truoc khi code.
```

- [ ] **Step 4: Verify no stale output blocks**

Run:

```bash
rg -n "Output de xuat|Push `main` len remote|main local" docs/superpowers/specs/2026-07-05-spec-gap-next-work-deduped.md
```

Expected: no output.

---

### Task 5: Optional Root README Simplification

**Files:**
- Optional modify: `docs/README.md`

- [ ] **Step 1: Decide whether to defer root README cleanup**

If keeping scope small, do not edit `docs/README.md` now. Add this note to `PHASE-CHECKLIST.md` under `Chưa nên mở nếu chưa chốt thêm`:

```markdown
- Refactor lớn `docs/README.md`; trước mắt chỉ dùng `PHASE-CHECKLIST.md` làm trạng thái sống.
```

- [ ] **Step 2: If Owner asks to proceed later, create a separate plan**

New plan should cover root docs index only, not business specs.

---

### Task 6: Verification And Commit

**Files:**
- All modified docs from tasks above.

- [ ] **Step 1: Run markdown drift checks**

Run:

```bash
rg -n "Push `main` len remote|main local|Output de xuat|TBD|TODO|FIXME" docs/PHASE-CHECKLIST.md docs/IMPLEMENTATION-CHECKLIST.md docs/superpowers/README.md docs/superpowers/specs/2026-07-05-*.md
```

Expected: no stale `Push main`, `main local`, `Output de xuat`, `TBD`, `TODO`, or `FIXME` lines.

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
git diff -- docs/PHASE-CHECKLIST.md docs/IMPLEMENTATION-CHECKLIST.md docs/superpowers/README.md docs/superpowers/specs/2026-07-05-spec-gap-next-work-deduped.md
```

Expected: only docs cleanup changes.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/PHASE-CHECKLIST.md docs/IMPLEMENTATION-CHECKLIST.md docs/superpowers/README.md docs/superpowers/specs/2026-07-05-*.md
git commit -m "docs: clarify live status and bridge ownership"
```

- [ ] **Step 5: Push**

Run:

```bash
git push origin main
```

Expected: push succeeds.

---

## Self-Review

- Spec coverage: covers stale status, checklist ownership, bridge ownership, deduped spec cleanup, optional root README deferral, verification.
- Placeholder scan: no `TBD`, `TODO`, or unspecified steps.
- Scope check: docs-only and small enough for one cleanup pass.
