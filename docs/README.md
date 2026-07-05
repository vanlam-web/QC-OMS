# TÀI LIỆU DỰ ÁN — QC-OMS

> **Xưởng Văn Lâm** — Hệ thống Quản lý Sản xuất & Bán hàng
>
> Root index chỉ để điều hướng. Trạng thái sống nằm ở [PHASE-CHECKLIST.md](./PHASE-CHECKLIST.md).

## Đọc Trước Khi Làm

| Việc cần biết | File |
|---|---|
| Tổng quan hệ thống tài liệu | [00-OVERVIEW-TongQuan/README.md](./00-OVERVIEW-TongQuan/README.md) |
| Source of Truth 8 tầng | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Quy tắc viết tài liệu | [DOCUMENT_RULES.md](./DOCUMENT_RULES.md) |
| Trạng thái sống / queue hiện tại | [PHASE-CHECKLIST.md](./PHASE-CHECKLIST.md) |
| Quy ước phối hợp Spec / Implement / Review | [WORKFLOW-SPEC-IMPLEMENT.md](./WORKFLOW-SPEC-IMPLEMENT.md) |
| Quy ước specs/plans/drafts/handoff | [superpowers/README.md](./superpowers/README.md) |

## Source Of Truth Theo Tầng

| Tầng | Nội dung | Điểm vào |
|---|---|---|
| 0 | Tổng quan | [00-OVERVIEW-TongQuan/README.md](./00-OVERVIEW-TongQuan/README.md) |
| 1 | Tầm nhìn, MVP, target state | [01-VISION-TamNhin/README.md](./01-VISION-TamNhin/README.md) |
| 2 | PRD / UX / màn hình | [02-PRD-UX-PhongCanh/README.md](./02-PRD-UX-PhongCanh/README.md) |
| 3 | Nghiệp vụ | [03-BUSINESS-NghiepVu/README.md](./03-BUSINESS-NghiepVu/README.md) |
| 4 | Database / schema / RLS | [04-DATABASE/README.md](./04-DATABASE/README.md) |
| 5 | Backend / API | [05-BACKEND-MayChu/README.md](./05-BACKEND-MayChu/README.md) |
| 6 | Tích hợp | [06-INTEGRATION-KetHop/README.md](./06-INTEGRATION-KetHop/README.md) |
| 7 | Triển khai / vận hành | [07-DEPLOYMENT-TrienKhai/README.md](./07-DEPLOYMENT-TrienKhai/README.md) |

## File Điều Phối

| File | Vai trò |
|---|---|
| [PHASE-CHECKLIST.md](./PHASE-CHECKLIST.md) | Live status board, queue hiện tại, handoff giữa luồng |
| [PROJECT-COORDINATION.md](./PROJECT-COORDINATION.md) | Điều phối owner / next owner khi cần |
| [REVIEW-ISSUES.md](./REVIEW-ISSUES.md) | Issue tracker do Review Thread duy trì |
| [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md) | Log baseline implementation, không phải roadmap sống |
| [CHANGELOG-AI.md](./CHANGELOG-AI.md) | Lịch sử phối hợp AI |

## Ghi Chú

- Không dùng root README để đánh dấu từng file đã làm/chưa làm.
- Nếu cần biết trạng thái hiện tại, đọc [PHASE-CHECKLIST.md](./PHASE-CHECKLIST.md) trước.
- Nếu cần sửa nghiệp vụ, sửa đúng layer Source of Truth trước, bridge/spec chỉ dùng để đối chiếu.
