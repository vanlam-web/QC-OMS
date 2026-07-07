# REVIEW-ISSUES — Review Thread Issue Tracker

> **Vai trò:** Tracker issue cho Review Thread.
> **Cập nhật:** 2026-07-05.

File này chỉ giữ issue review còn mở hoặc cần theo dõi. Chi tiết dài của issue đã đóng nằm trong git history.

---

## Cách Dùng

Review ghi issue ở đây khi phát hiện việc cần Spec / Implement / Owner xử lý.

Mỗi issue cần có:

- bằng chứng
- người/luồng phụ trách
- việc cần làm
- lệnh re-check
- tình trạng hiện tại

Issue không thay thế PR comments, implementation plan, hoặc Source of Truth docs.

---

## Giá Trị Tình Trạng

| Tình trạng | Ý nghĩa |
|---|---|
| `Open` | Review đã xác nhận issue và cần follow-up |
| `Waiting for Spec` | Cần Spec chốt hành vi hoặc Source of Truth |
| `Waiting for Implement` | Cần Implement sửa/điều tra |
| `Waiting for Owner` | Cần Owner quyết nghiệp vụ |
| `Ready for Re-check` | Luồng phụ trách báo đã xử lý, Review cần kiểm lại |
| `Closed` | Review đã kiểm lại hoặc chấp nhận quyết định đóng |

---

## Issue Đang Mở

Không có.

---

## Issue Đã Đóng Gần Đây

| Issue | Kết quả |
|---|---|
| `REV-2026-07-03-003` — Production bundle exceeds Vite warning threshold | Closed; route-level lazy loading tách page chunks, `npm run build` không còn cảnh báo >500 kB |
| `REV-2026-07-03-001` — Catalog management unit tests fail | Closed; targeted tests pass |
| `REV-2026-07-03-002` — Playwright e2e blocked by invalid Supabase API key | Closed; e2e pass |
| `REV-2026-07-03-004` — Workspace has many uncommitted changes | Closed; `main...origin/main` sạch ngày 2026-07-05 |
| `REV-2026-07-03-005` — Governance docs old multi-AI wording | Closed; wording đã chuyển Codex Spec / Implement / Review |
| `REV-2026-07-03-006` — Documentation indexes drift | Closed; index đã cập nhật |
| `REV-2026-07-03-007` — Historical audit/draft status unclear | Closed; root audit logs cũ đã gỡ khỏi docs sống |

---

## Format Report Back

Luồng phụ trách report thẳng về Review khi đã xử lý, bị chặn, hoặc quyết định defer:

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
- Spec / Implement / Review / Owner

Next owner:
- Spec / Implement / Review / Owner

Next action:
- ...

Owner decision needed:
- Yes / No

Ready for Review re-check:
- Yes / No
```
