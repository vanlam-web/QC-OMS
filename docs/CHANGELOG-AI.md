# CHANGELOG-AI — Historical AI Coordination Log

> **Vai trò:** Historical log only.
> **Quy trình hiện tại:** `AI_TEAM_RULES.md`, `docs/WORKFLOW-SPEC-IMPLEMENT.md`, và `docs/WORKFLOW-AUTO-SPEC-IMPLEMENT.md`.
> **Ghi chú:** Nội dung bên dưới là lịch sử trước mô hình Codex ba luồng từ 2026-07-03; giữ để truy vết, không phải quy trình đang dùng. Các trạng thái review cũ không còn là việc mở hiện tại.

File này lưu lịch sử các lần Owner phải bypass hoặc phối hợp ngoài luồng chuẩn trong giai đoạn cũ. Từ 2026-07-03, QC-OMS dùng mô hình Codex-only với ba luồng Spec / Implement / Review; không dùng file này để quyết định workflow hiện hành.

---

## Format chuẩn

```
[YYYY-MM-DD] Loại — Actor — Reason — Scope — Tình trạng
```

- **Loại:** Bypass | Decision | Rollback | Review
- **Actor:** Owner | Codex | Cursor | Gemini (historical)
- **Tình trạng:** Historical only

---

## 2026-06-27 — Bypass (Owner → Cursor)

### Bypass #1 — Đợt 1 (P-01, P-02, P-03)
- **Actor:** Owner
- **Reason:** Codex không online trong workspace QC-OMS tại thời điểm patch. Owner duyệt trực tiếp qua chat.
- **Scope:**
  - `docs/02-PRD-UX-PhongCanh/POS/K01/01-K01-TOPBAR.md` (wireframe K01, tách nhãn II.1–II.4)
  - `docs/02-PRD-UX-PhongCanh/POS/K02/02c-K02A-M2-KHUI.md` (Top Bar M2 đồng bộ K01)
  - `docs/02-PRD-UX-PhongCanh/POS/README.md` (trạng thái + sửa `||`)
  - `docs/AUDIT-V2.md` (bảng tiến độ, cập nhật Đợt 1 = ✅)
- **Tình trạng:** Historical; không còn là việc mở

### Bypass #2 — Đợt 2 (P-04, P-05, P-06)
- **Actor:** Owner
- **Reason:** Codex vẫn không online. Owner tiếp tục duyệt qua chat.
- **Scope:**
  - `docs/02-PRD-UX-PhongCanh/POS/K01/01b-K01-PROFILE-SHORTCUTS.md` (SoT shortcut + F8)
  - `docs/02-PRD-UX-PhongCanh/POS/K01/01-K01-TOPBAR.md` (bỏ bảng shortcut trùng, tham chiếu 01b)
  - `docs/AUDIT-V2.md` (Đợt 2 = ✅, dòng lịch sử mới)
- **Tình trạng:** Historical; không còn là việc mở

### Bypass #3 — Đợt 3 (P-07, P-08, P-09)
- **Actor:** Owner
- **Reason:** Codex vẫn không online. Owner phát hiện Cursor đề xuất P-09 có lỗi kỹ thuật (link anchor không có target heading thật vì BR-02/BR-03 là bold chứ không phải heading). Owner sửa proposal → Cursor patch theo.
- **Scope:**
  - `docs/03-BUSINESS-NghiepVu/Sales/POS-ORDER-CALC.md` (BR-01..03 → BR-CALC-01..03, BR-02/03 nâng từ bold thành `###`)
  - `docs/03-BUSINESS-NghiepVu/Sales/POS-CHECKOUT.md` (BR-01..07 → BR-CHK-01..07 + 4 tham chiếu nội bộ)
  - `docs/02-PRD-UX-PhongCanh/POS/K02/01-K02-GIO-HANG.md` (link anchor cập nhật)
  - `docs/AUDIT-V2.md` (Đợt 3 = ✅, dòng lịch sử mới)
- **Tình trạng:** Historical; không còn là việc mở

---

## 2026-06-27 — Bypass (Owner → Cursor)

### Bypass #4 — Đợt 4A (Sửa AI_TEAM_RULES.md + tạo CHANGELOG-AI.md)
- **Actor:** Owner
- **Reason:** Codex gửi TECH LEAD REPORT nhưng chỉ qua text trong chat (không có agent runtime). Owner duyệt 4 chỉnh sửa + tạo file log ngược.
- **Scope:**
  - `AI_TEAM_RULES.md` (thêm Owner Emergency Override, Gemini Parallel Analysis, sửa ASCII layout, thêm Questions vào Implementation Report)
  - `docs/CHANGELOG-AI.md` (file mới — log bypass #1, #2, #3 ngược)
- **Tình trạng:** Historical; không còn là việc mở

---

## Quy tắc cũ sau khi Codex online

Phần này là historical policy của giai đoạn 2026-06-27, không còn là quy trình hiện hành. Không dùng các bypass trên làm checklist đang mở.

---

## SoT

- **AI_TEAM_RULES.md** — quy tắc tổ chức hiện hành
- **docs/WORKFLOW-SPEC-IMPLEMENT.md** — workflow phối hợp hiện hành
- **docs/WORKFLOW-AUTO-SPEC-IMPLEMENT.md** — vòng lặp tự động hiện hành
- **CHANGELOG-AI.md** (file này) — historical trace only
- **AUDIT-V2.md** — historical audit/patch trace

Mỗi file có scope riêng, không trùng.
