# REVIEW-ISSUES — Review Thread Issue Tracker

> **Status:** Active Review Thread tracker
> **Owner:** Review Thread maintains this file when Owner asks for project checks
> **Last updated:** 2026-07-03

---

## 1. Purpose

This file records issues found by the Review Thread, the Codex thread responsible for follow-up, and the verification required after a fix.

Use this file when Review checks the project and finds work that must be handled by Spec or Implement.

Review Thread responsibilities:

- record confirmed issues and likely issues separately
- assign each issue to Spec, Implement, or Owner
- state the exact evidence and commands used
- request a report back after the responsible thread fixes or decides the issue
- re-check the issue after the responsible thread reports completion

This tracker does not replace PR comments, implementation plans, or Source of Truth docs. It is the handoff ledger for Review findings.

---

## 2. Status Values

| Status | Meaning |
|---|---|
| `Open` | Review found the issue and assigned it for follow-up. |
| `Waiting for Spec` | Spec must clarify expected behavior or Source of Truth. |
| `Waiting for Implement` | Implement must fix, investigate, or report root cause. |
| `Waiting for Owner` | Owner must make a business decision. |
| `Ready for Re-check` | Responsible thread says it is fixed; Review must verify. |
| `Closed` | Review re-checked and confirmed the issue is resolved or accepted. |

---

## 3. Required Report Back Format

Responsible threads must report back directly to Review in this format. Owner is not responsible for reminding a thread to report status or for relaying reports between threads.

Report back is required when:

- the issue is fixed
- the issue is blocked and needs Spec/Owner/Implement decision
- the issue is intentionally deferred
- the responsible thread discovers the issue belongs to another thread

```text
[<Thread> -> Review]

Issue ID:
- ...

Files changed or reviewed:
- ...

Root cause:
- ...

Fix or decision:
- ...

Verification:
- ...

Remaining risk:
- ...

Current owner:
- ...

Next owner:
- ...

Next action:
- ...

Owner decision needed:
- Yes / No

Ready for Review re-check:
- Yes / No
```

Review then re-runs the required checks and updates the issue status.

If the same work also affects another thread, the responsible thread must also report to that thread directly, for example `[Implement -> Spec]` for business review or `[Spec -> Implement]` for updated requirements. Review should not be the only messenger when another thread must act.

Review should open or update a coordination finding when Owner must ask who is holding the next action. Active slice/PR ownership is tracked in [PROJECT-COORDINATION.md](./PROJECT-COORDINATION.md).

---

## 4. Active Issues

### REV-2026-07-03-001 — Catalog management unit tests fail

**Status:** Closed

**Assigned to:**

- Implement: investigate and fix behavior/tests
- Spec: confirm expected UX before behavior changes

**Evidence:**

`npm test` failed with 3 failing tests out of 450:

- `src/features/catalog/CatalogPage.test.tsx` — `expands product details directly under the selected row and closes on second click`
- `src/features/catalog/CustomersPage.test.tsx` — `expands customer details directly under the selected row and closes on second click`
- `src/features/catalog/PriceBookPage.test.tsx` — `expands price details directly under the selected product row and closes on second click`

**Review notes:**

- Catalog failure is likely a test-query issue after inline detail opens because `MICA-3MM` appears in both the row and the detail section.
- Customers and PriceBook cannot find the expected detail region after clicking row text.
- The affected area appears related to recent management layout/catalog page work.

**Spec must confirm:**

- Clicking a data row should expand inline details directly underneath that row.
- Clicking the same row again should close the details.
- Accessible detail labels such as `Chi tiết khách hàng KH000123`, `Chi tiết hàng hóa MICA-3MM`, and `Chi tiết bảng giá MICA-3MM` are still required, or Spec must document the new expected behavior.

**Implement must do:**

- Read recent changes/diff around catalog management pages before editing.
- Do not revert unrelated workspace changes.
- Fix component behavior or tests according to Spec-confirmed UX.

**Required re-check:**

```sh
npm test -- src/features/catalog/CatalogPage.test.tsx src/features/catalog/CustomersPage.test.tsx src/features/catalog/PriceBookPage.test.tsx
npm test
```

**Implement report received:** 2026-07-03

Implement reported the catalog failures were no longer reproducible in the current workspace state. Spec confirmed the expected UX remains inline row detail with click-to-open and click-again-to-close.

**Review re-check:** 2026-07-03

```sh
npm test -- src/features/catalog/CatalogPage.test.tsx src/features/catalog/CustomersPage.test.tsx src/features/catalog/PriceBookPage.test.tsx src/lib/config/supabase-env.test.ts
```

Result: PASS — 145 files, 451 tests.

Issue closed because the catalog unit failures are no longer reproducible and the expected UX has been confirmed by Spec.

---

### REV-2026-07-03-002 — Playwright e2e blocked by invalid Supabase API key

**Status:** Closed

**Assigned to:** Implement

**Evidence:**

`npm run test:e2e` failed during Playwright global setup:

```text
AuthApiError: Invalid API key
tests/e2e/global-setup.ts:70
```

The failing call is `supabase.auth.admin.listUsers()`.

**Review notes:**

- This blocks browser e2e before app assertions run.
- Likely env/config issue, not proven app behavior issue.
- Do not print secret values in reports.

**Implement must do:**

- Inspect `.env.local`, `tests/e2e/supabase-env.ts`, and `tests/e2e/global-setup.ts`.
- Identify whether the bad source is `.env.local`, Supabase CLI status output, or another env override.
- Report the source category without exposing secret values.
- Correct local/test env or document the required Owner action if the key must be regenerated.

**Required re-check:**

```sh
npm run test:e2e
```

**Implement report received:** 2026-07-03

Root cause was env source mixing: `.env.local` provided Cloud Supabase URL/anon key, while `loadE2eSupabaseEnv()` fell back to local `npx supabase status` for the service role key. The local service role was then used against Cloud and caused `Invalid API key`.

Implement changed `tests/e2e/supabase-env.ts` so CLI service-role fallback is used only when URL/anon also come from CLI/local fallback. Implement also updated stale POS e2e assumptions and kept `CheckoutPanel` mounted after checkout success so the receipt summary remains visible.

Files reported changed:

- `tests/e2e/supabase-env.ts`
- `src/lib/config/supabase-env.test.ts`
- `tests/e2e/auth-pos.spec.ts`
- `src/features/pos/PosShell.tsx`

**Review re-check:** 2026-07-03

```sh
npm run test:e2e
```

Result: PASS — 2 Playwright tests passed.

Additional Review checks:

```sh
npm run typecheck
npm run lint
npm run build
git diff --check
```

Result: PASS. Build still reports the existing Vite chunk-size warning tracked in REV-2026-07-03-003.

Remaining risk: E2E user bootstrap is skipped because the current `.env.local` does not include a matching Cloud `SUPABASE_SERVICE_ROLE_KEY`. E2E passes because `admin@qc.local` already exists in the Cloud project. For a fresh Cloud project, set a matching Cloud service-role key or run e2e against local Supabase env.

---

### REV-2026-07-03-003 — Production bundle exceeds Vite warning threshold

**Status:** Open

**Assigned to:** Implement, later priority

**Evidence:**

`npm run build` passed, but Vite reported:

```text
dist/assets/index-gIOCjsYl.js 592.31 kB
Some chunks are larger than 500 kB after minification.
```

**Review notes:**

- This is not currently a failing build.
- It can become a performance issue as the app grows.
- Should not block fixing failing tests.

**Implement must do:**

- Defer unless Owner or Spec prioritizes performance cleanup.
- When picked up, evaluate route-level code splitting or build chunk configuration.

**Required re-check:**

```sh
npm run build
```

---

### REV-2026-07-03-004 — Workspace has many uncommitted changes

**Status:** Waiting for Owner/Spec

**Assigned to:** Owner/Spec for packaging decision; Implement and Review for follow-up

**Evidence:**

At review time, `git status --short --branch` showed:

- 41 modified files
- 11 untracked files

**Review notes:**

- This increases risk of mixing unrelated work.
- Review and Implement must avoid reverting or staging unrelated changes.
- Any fix should clearly state which files were touched for that fix.
- Implement confirmed this risk is currently blocking a clean commit/PR for the e2e/POS checkout-summary fix because `src/features/pos/PosShell.tsx` includes broad pre-existing POS layout changes in the same working tree.

**Responsible threads must do:**

- Before fixing, read relevant diffs.
- Do not revert unrelated changes.
- Report changed files explicitly.

**Required re-check:**

```sh
git status --short --branch
git diff --stat
```

**Implement report received:** 2026-07-03

Implement decided to wait and not commit/open a PR from the current checkout.

Reason:

- `src/features/pos/PosShell.tsx` has a large uncommitted POS layout change relative to the current base.
- The functional fix is only the checkout-success behavior that keeps `CheckoutPanel` mounted so `Kết quả checkout` remains visible.
- Committing from this checkout would also package unrelated POS layout work outside the Review handoff.
- No files are staged.

Files intentionally left in the working tree:

- `tests/e2e/supabase-env.ts`
- `src/lib/config/supabase-env.test.ts`
- `tests/e2e/auth-pos.spec.ts`
- `src/features/pos/PosShell.tsx`

Packaging decision needed:

1. Include the e2e/POS checkout-summary fix in the current UI/POS dirty branch if that broader layout work is intentionally part of the same slice.
2. Or wait for a clean branch/baseline so the checkout-success hunk can be isolated safely.

Owner decision: choose option 2. Wait for a clean branch/baseline and isolate the e2e/POS checkout-summary fix later. Do not commit this fix from the current dirty checkout.

Review recommendation remains: keep this issue open until the workspace or branch is clean enough to package only the intended hunks.

---

### REV-2026-07-03-005 — Governance docs still contain old multi-AI wording

**Status:** Closed

**Assigned to:** Spec, when Spec thread is available

**Evidence:**

Review found governance/history docs that conflict with the current Codex-only, three-thread operating model:

- `docs/DOCUMENT_RULES.md` still says Gemini may analyze content supplied by Codex.
- `docs/PHASE-CHECKLIST.md` still says the implementation-ready queue is for "hai luồng".
- `docs/CHANGELOG-AI.md` still describes active bypass rules around Owner Emergency Override, Cursor, and Gemini.

**Review notes:**

- `AI_TEAM_RULES.md`, `docs/WORKFLOW-SPEC-IMPLEMENT.md`, and `docs/WORKFLOW-AUTO-SPEC-IMPLEMENT.md` now define the current model: Codex only, with Spec, Implement, and Review threads.
- These older references can cause other threads to follow the wrong operating model.

**Spec must do:**

- Update `docs/DOCUMENT_RULES.md` to refer to Codex threads, not Gemini.
- Update `docs/PHASE-CHECKLIST.md` wording from two threads to the current three-thread workflow.
- Convert `docs/CHANGELOG-AI.md` into a historical log, not active operating policy.

**Required re-check:**

```sh
rg -n "Gemini|Cursor|2 luồng|hai luồng|2 luong|Hai luong|Owner Emergency Override" AI_TEAM_RULES.md docs -g "*.md"
```

Review should confirm any remaining matches are clearly historical, not current workflow instructions.

**Spec report received:** 2026-07-03

Spec reported governance wording was updated to Codex-only Spec / Implement / Review, and `docs/CHANGELOG-AI.md` was converted into historical context rather than active operating policy.

Files reported changed or reviewed:

- `docs/DOCUMENT_RULES.md`
- `docs/PHASE-CHECKLIST.md`
- `docs/CHANGELOG-AI.md`
- reviewed `AI_TEAM_RULES.md`, `docs/WORKFLOW-SPEC-IMPLEMENT.md`, `docs/WORKFLOW-AUTO-SPEC-IMPLEMENT.md`, `docs/REVIEW-ISSUES.md`

**Review re-check:** 2026-07-03

```sh
git diff --check -- docs AI_TEAM_RULES.md
rg -n "Gemini|Cursor|2 luồng|hai luồng|2 luong|Hai luong|Owner Emergency Override|CHƯA PATCH" AI_TEAM_RULES.md docs -g "*.md"
```

Result: PASS for whitespace. Remaining legacy-wording matches are limited to explicitly historical audit/changelog content or this tracker’s evidence/required-check text, not active workflow instructions.

---

### REV-2026-07-03-006 — Documentation indexes do not reflect current repo state

**Status:** Closed

**Assigned to:**

- Spec: update docs indexes and Source of Truth navigation.
- Implement: confirm code/API/database status where index wording depends on implemented state.

**Evidence:**

Review found current docs/index drift:

- `docs/README.md` does not list several active coordination docs, including `docs/REVIEW-ISSUES.md`, `docs/WORKFLOW-SPEC-IMPLEMENT.md`, and `docs/WORKFLOW-AUTO-SPEC-IMPLEMENT.md`.
- `docs/02-PRD-UX-PhongCanh/README.md` misses newer module docs such as Inventory `06-PRODUCTION-RECONCILIATION.md`, SalesDocuments `04-QUOTE-PRINT-PHASE-3B.md`, System `00-UI-SHELL-V1.md`, Reports `06-CUSTOMER-REPORT.md`, and Purchase docs.
- `docs/04-DATABASE/README.md` does not reflect Purchase/Supplier/payment/roll-sheet migrations and tests now present in the repo.
- `docs/05-BACKEND-MayChu/README.md` says Production Queue is not present, but the repo has `supabase/functions/api/routes/production-queue.ts`, use-cases, tests, and migrations.

**Review notes:**

- Internal Markdown links are not broken; Review found 0 missing links.
- The issue is stale or incomplete index/status, not missing files.

**Spec must do:**

- Update the docs indexes so active Source of Truth and workflow files are discoverable.
- Avoid marking historical plans/drafts as current Source of Truth.

**Implement must do if asked by Spec/Review:**

- Confirm implemented backend/database status from code, migrations, and tests before status wording is finalized.

**Required re-check:**

```sh
python3 - <<'PY'
from pathlib import Path
import re, urllib.parse
root=Path('.').resolve()
files=list((root/'docs').rglob('*.md'))+[root/'AI_TEAM_RULES.md']
pat=re.compile(r'\[[^\]]+\]\(([^)]+)\)')
missing=[]
for f in files:
    text=f.read_text(errors='ignore')
    for m in pat.finditer(text):
        url=m.group(1).strip()
        if url.startswith(('http://','https://','mailto:','#')):
            continue
        path=url.split('#',1)[0]
        if not path:
            continue
        target=(f.parent/urllib.parse.unquote(path)).resolve()
        if not target.exists():
            missing.append((f, url))
print(len(missing))
PY
rg -n "Production Queue.*Chưa có|hai luồng|2 luồng" docs -g "*.md"
```

**Spec report received:** 2026-07-03

Spec reported root docs and module indexes were updated so active Source of Truth and workflow files are discoverable, while historical plans/drafts are not marked as current Source of Truth.

Files reported changed:

- `docs/README.md`
- `docs/02-PRD-UX-PhongCanh/README.md`
- `docs/04-DATABASE/README.md`
- `docs/05-BACKEND-MayChu/README.md`

**Review re-check:** 2026-07-03

```sh
python3 - <<'PY'
from pathlib import Path
import re, urllib.parse
root=Path('.').resolve()
files=list((root/'docs').rglob('*.md'))+[root/'AI_TEAM_RULES.md']
pat=re.compile(r'\[[^\]]+\]\(([^)]+)\)')
missing=[]
for f in files:
    text=f.read_text(errors='ignore')
    for m in pat.finditer(text):
        url=m.group(1).strip()
        if url.startswith(('http://','https://','mailto:','#')):
            continue
        path=url.split('#',1)[0]
        if not path:
            continue
        target=(f.parent/urllib.parse.unquote(path)).resolve()
        if not target.exists():
            missing.append((str(f.relative_to(root)), url))
print(len(missing))
PY
rg -n "Production Queue.*Chưa có|hai luồng|2 luồng" docs -g "*.md"
```

Result: PASS. Markdown link check returned `0`. The stale `Production Queue.*Chưa có` and active `hai luồng` matches are gone outside this tracker’s historical evidence/check text.

---

### REV-2026-07-03-007 — Historical audit and draft files need clear status

**Status:** Closed

**Assigned to:** Spec, when Spec thread is available

**Evidence:**

Review found historical/draft docs that are useful for traceability but risky if read as current operating truth:

- `docs/AUDIT_REPORT.md` is a 2026-06-26 historical audit that says it read 44 files; the docs tree is now much larger.
- `docs/AUDIT-V2.md` says "CHỐT CHECKLIST — CHƯA PATCH" near the top, while later sections show all listed patch waves completed.
- Many `docs/superpowers/specs/*-draft.md` files explicitly say they are drafts or not Source of Truth.
- `docs/superpowers/plans/*` are implementation plans/handoffs, not current project status.

**Spec must do:**

- Mark `docs/AUDIT_REPORT.md` as historical.
- Mark `docs/AUDIT-V2.md` as historical/completed, or update the top status to match its completed patch table.
- Add or update a `docs/superpowers/README.md` or equivalent index explaining that drafts/plans are trace/history unless explicitly promoted into `02-07` Source of Truth docs.

**Required re-check:**

```sh
rg -n "CHƯA PATCH|Draft|draft|không phải Source of Truth|not Source of Truth" docs/AUDIT*.md docs/superpowers -g "*.md"
```

Review should confirm remaining draft markers are intentional and clearly labeled.

**Spec report received:** 2026-07-03

Spec reported audit files were marked historical/completed and `docs/superpowers/README.md` was added to explain drafts/plans as trace/history unless promoted into Source of Truth docs.

Files reported changed:

- `docs/AUDIT_REPORT.md`
- `docs/AUDIT-V2.md`
- `docs/superpowers/README.md`

**Review re-check:** 2026-07-03

```sh
rg -n "CHƯA PATCH|Draft|draft|không phải Source of Truth|not Source of Truth" docs/AUDIT*.md docs/superpowers -g "*.md"
```

Result: PASS. Remaining draft markers are intentional in `docs/superpowers/specs` and `docs/superpowers/plans`, and `docs/superpowers/README.md` now explains that these files are trace/history unless promoted.

---

## 5. Recently Sent Handoffs

### 2026-07-03 — Review to Implement

Sent issues:

- REV-2026-07-03-001
- REV-2026-07-03-002

Requested Implement report back with:

- files changed
- root cause
- fix
- verification
- remaining risk

### 2026-07-03 — Review to Spec

Sent issue:

- REV-2026-07-03-001

Requested Spec confirm expected UX and report:

- expected UX
- Source of Truth files
- Must fix before merge
- Follow-up acceptable
- Owner decision needed

### 2026-07-03 — Implement to Review/Spec

Reported fixed/re-checked issues:

- REV-2026-07-03-001
- REV-2026-07-03-002

Review independently re-ran the required checks and closed both issues.

### 2026-07-03 — Implement packaging decision for e2e/POS fix

Implement reported:

- No commit/PR from current checkout.
- Fix verified but left in working tree.
- Packaging decision needed because `PosShell.tsx` includes unrelated broad layout changes.

Related issue:

- REV-2026-07-03-004

### 2026-07-03 — Review queue for docs cleanup

Queued and sent to Spec after the Spec thread became idle:

- REV-2026-07-03-005
- REV-2026-07-03-006
- REV-2026-07-03-007

Review should re-check after Spec reports completion.

### 2026-07-03 — Owner packaging decision for e2e/POS fix

Owner chose option A from Review's recommendation: wait for a clean branch/baseline before packaging the e2e/POS checkout-summary fix.

Related issue:

- REV-2026-07-03-004

### 2026-07-03 — Direct thread report-back rule

Owner clarified that threads must work directly with each other and report back directly, without Owner having to remind or relay status.

Updated coordination docs:

- `AI_TEAM_RULES.md`
- `docs/WORKFLOW-SPEC-IMPLEMENT.md`
- `docs/WORKFLOW-AUTO-SPEC-IMPLEMENT.md`
- `docs/REVIEW-ISSUES.md`

New rule:

- Any thread that receives a handoff, review request, blocker question, or Review issue must report directly back to the sending thread when done, blocked, or deferred.
- If the work affects multiple threads, report to each affected thread.
- Review keeps `docs/REVIEW-ISSUES.md` as the issue ledger and re-checks only after the responsible thread reports readiness.
