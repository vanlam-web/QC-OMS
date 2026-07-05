# Superpowers Specs And Plans

> **Status:** Trace/history/handoff area
> **Current Source of Truth:** promoted docs under `docs/02-PRD-UX-PhongCanh`, `docs/03-BUSINESS-NghiepVu`, `docs/04-DATABASE`, `docs/05-BACKEND-MayChu`, plus active workflow docs at the root of `docs/`.

---

## Purpose

This folder stores working artifacts created during Codex planning:

- `specs/` contains design notes, audits, discovery notes, and draft specs.
- `plans/` contains implementation plans and handoff checklists.

These files are useful for traceability and for understanding how a slice was planned, but they are not automatically current Source of Truth.

---

## Status Rules

- Files ending in `-draft.md` are drafts unless a later Source of Truth doc explicitly promotes them.
- Files ending in `-bridge.md` or containing `implementation-bridge` are trace bridges. They explain how a slice mapped Source of Truth to implementation, but they do not replace promoted Source of Truth docs.
- Files in `plans/` are implementation guidance for a point in time, not current product status.
- Cleanup plans should be deleted after the cleanup is committed, unless Owner asks to keep them.
- If a plan conflicts with a promoted Source of Truth doc or a newer Owner decision, follow the newer Owner decision and promoted Source of Truth.
- Do not delete historical plans/drafts during cleanup unless Owner explicitly asks.

---

## Promotion Path

When a draft or plan becomes canonical, Spec should copy or summarize the approved parts into the appropriate Source of Truth layer:

- UX behavior: `docs/02-PRD-UX-PhongCanh/`
- Business rules: `docs/03-BUSINESS-NghiepVu/`
- Database schema: `docs/04-DATABASE/`
- Backend/API contract: `docs/05-BACKEND-MayChu/`
- Workflow/governance: `AI_TEAM_RULES.md` or root `docs/WORKFLOW-*.md`

After promotion, leave the original file here as trace/history.
