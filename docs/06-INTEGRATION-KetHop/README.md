# PHẦN 6: TÍCH HỢP (INTEGRATION)

> **Source of Truth** cho mọi tích hợp với hệ thống bên ngoài.

---

## Mục đích

Folder này trả lời các câu hỏi:

- Hệ thống kết nối với dịch vụ nào?
- Mục đích của kết nối là gì?
- Dữ liệu trao đổi như thế nào?
- Khi nào thực hiện tích hợp?

---

## Phạm vi tầng

| Phân loại | Nội dung |
|-----------|----------|
| **CHỈ GHI** | Printer Integration · QR Code · Email · SMS / Zalo · Banking · AI / LLM · Webhook · External API · Đồng bộ dữ liệu · Queue / Message Broker · File Import/Export |
| **THAM CHIẾU** | Feature · Business Rule · Database · Backend — chỉ để giải thích mục đích Integration |
| **KHÔNG GHI** | Vision · Feature Specification · UI/Wireframe · Business Rule đầy đủ · Database Schema · Backend Workflow nội bộ · Frontend Code · Hạ tầng triển khai |

---

## Thứ tự phát triển

Theo nguyên tắc top-down, **06-INTEGRATION chỉ được thiết kế khi**:

1. ✅ 03-BUSINESS đã có Business Rule rõ ràng
2. ✅ 05-BACKEND đã có API Specification

---

## Nội dung đã có

| File | Mô tả | Trạng thái |
|------|--------|------------|
| `INTEGRATION_CONVENTIONS.md` | Quy ước chung: Zalo, Printer, QR, Email, Webhook, AI/LLM | ✅ Hoàn tất |
| [Legacy-QuanLyXuong/README.md](./Legacy-QuanLyXuong/README.md) | Ngu canh he QuanLyXuong cu de QC-OMS hoc luong va di tru | Dang xay dung |

---

## Nội dung dự kiến

| Hệ thống | Mô tả | Trạng thái |
|-----------|--------|------------|
| **Zalo** | Gửi bill qua Zalo sau thanh toán | ⬜ Chi tiết sắp tới |
| **Printer** | In bill, in tem trên máy in qua USB/LAN | ⬜ Chi tiết sắp tới |
| **Webhook** | Thông báo sự kiện ra bên ngoài | ⬜ Chi tiết sắp tới |
| **AI / LLM** | Hỗ trợ nhập liệu, gợi ý sản phẩm | ⬜ Chi tiết sắp tới |

> Các integration cụ thể sẽ được tách thành sub-folder riêng khi chi tiết đủ lớn.

---

← [ Quay về README chính](../README.md)
