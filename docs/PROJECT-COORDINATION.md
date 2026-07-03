# PROJECT-COORDINATION — Current Work Board

> **Status:** Active coordination board
> **Owner:** Spec Thread maintains business queue and next-owner state; Review verifies stale or blocked items.
> **Last updated:** 2026-07-03

---

## 1. Purpose

This board exists so Owner can give business requirements without tracking code details or relaying messages between threads.

Every active slice must show:

- what the user-facing/business goal is
- who currently owns the next action
- which thread must receive the next report
- the PR/branch/commit involved
- whether Owner decision is needed

The short mandatory operating contract is [AI-OPERATING-RULES.md](./AI-OPERATING-RULES.md). This board is the live state that proves those rules are being followed.

If a thread finishes work, it must update/report the next-owner state. Owner should not need to ask "who is holding this now?"

---

## 2. Owner Model

Owner only needs to provide:

- business workflow
- desired UI/operation outcome
- priority
- acceptance/rejection based on real use

Codex threads must translate that into:

- Source of Truth docs
- implementation slices
- tests/verification
- PR review and merge gate
- follow-up queue

---

## 3. Required Work Item Fields

Use this shape for any active slice, PR, blocker, or review issue:

```text
Work item:
- ID:
- Business goal:
- Current owner: Spec / Implement / Review / Owner
- Next owner: Spec / Implement / Review / Owner
- Status: Drafting / Implementing / Waiting Spec / Waiting Review / Must Fix / Ready to Merge / Merged / Blocked / Deferred
- Branch / PR / commit:
- Source of Truth:
- Last report:
- Next action:
- Owner decision needed:
- Risk:
```

No important work is considered handed off unless `Current owner`, `Next owner`, and `Next action` are explicit.

---

## 4. Active Board

| Work item | Business goal | Current owner | Next owner | Status | Branch / PR | Next action |
|---|---|---|---|---|---|---|
| Customer detail MVP spec base | Chốt SoT khách hàng có MST, bảng giá áp dụng và công nợ readonly trước khi merge implementation | Review | Review | Merged | PR #43 `codex/customer-detail-mvp-spec` | Merged into `main` at `7d83247`; kept as trace for stacked order |
| Customer detail MVP implementation | Khách hàng có MST, bảng giá áp dụng và công nợ readonly để phục vụ bán hàng | Review | Review | Merged | PR #41 `codex/customer-detail-mvp-impl` | Merged into `main` at `1402f61`; browser smoke remains follow-up risk due local login redirect |
| Governance/docs cleanup | Quy trình 3 luồng rõ ràng, không để Owner chuyển lời | Spec | Spec | Merged | PR #42 `codex/docs-governance-index-cleanup` | Merged into `main` at `7b1a85a`; no active next action, continue normal Owner intake |
| AI operating rules compact | Tập trung luật vận hành một nơi, tránh Owner phải điều phối và tránh AI đọc nhầm tài liệu cũ | Review | Review | Waiting Review | PR #46 `codex/ai-operating-rules` | Review kiểm tra link, độ rõ của luật và quy tắc xóa/đánh dấu tài liệu lỗi thời |

---

## 5. Thread Report Addendum

Every thread-to-thread report must include this block near the top or bottom:

```text
Status:
- ...

Current owner:
- Spec / Implement / Review / Owner

Next owner:
- Spec / Implement / Review / Owner

Next action:
- ...

Owner decision needed:
- Yes / No
```

If `Owner decision needed` is `Yes`, the report must include one concise business question and the recommended default.

---

## 6. Staleness Rules

Review should flag a stale coordination item when:

- a PR is open but no next owner is clear
- a thread reports completion but no next action is listed
- Owner asks for status and the answer requires guessing from chat history
- a work item waits on the same owner for more than one review cycle without an explicit blocker

Stale items should be recorded in `docs/REVIEW-ISSUES.md` or reported directly to the responsible thread.

---

## 7. Completion Rules

A work item can leave the active board only when one of these is true:

- merged and post-merge report was sent to the relevant thread
- intentionally deferred with a reason and future trigger
- blocked by Owner decision and reported clearly
- replaced by a newer work item with a link/reference

After merge, Spec decides whether Source of Truth or this board needs an update. Review may request cleanup if the board drifts from real PR/thread state.
