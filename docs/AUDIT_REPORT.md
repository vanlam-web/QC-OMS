# AUDIT REPORT — Historical Docs Audit

> **Vai trò:** Lưu vết audit tài liệu ngày 2026-06-26/2026-06-27.
> **Không dùng làm trạng thái hiện tại.**
>
> Trạng thái sống nằm ở [PHASE-CHECKLIST.md](./PHASE-CHECKLIST.md).
> Quy trình hiện hành nằm ở [WORKFLOW-SPEC-IMPLEMENT.md](./WORKFLOW-SPEC-IMPLEMENT.md) và [WORKFLOW-AUTO-SPEC-IMPLEMENT.md](./WORKFLOW-AUTO-SPEC-IMPLEMENT.md).

---

## Tóm Tắt

Audit cũ kiểm tra `docs/` theo `DOCUMENT_RULES.md` và đã xử lý các nhóm lỗi chính:

- sai tầng Source of Truth giữa PRD/Business/Database/Backend
- thiếu README ở một số folder
- trùng hoặc mơ hồ Acceptance Criteria giữa UI và nghiệp vụ
- metadata/checklist cũ gây hiểu nhầm
- một số lỗi heading/wireframe/link nội bộ

Kết quả audit đã được áp dụng trong các patch sau đó. File này chỉ giữ để truy vết bối cảnh cũ, không chứa việc cần làm.

## Tham Chiếu Lịch Sử

- `AUDIT-V2.md`: đối chiếu audit Cursor/Codex ngày 2026-06-27.
- `CHANGELOG-AI.md`: log phối hợp AI lịch sử trước mô hình Codex-only.

## Quy Ước Hiện Tại

- Không cập nhật file này cho backlog mới.
- Không dùng file này để quyết định module nào đã làm/chưa làm.
- Nếu cần biết việc tiếp theo, đọc [PHASE-CHECKLIST.md](./PHASE-CHECKLIST.md).
