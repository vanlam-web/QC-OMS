# SalesDocuments — Chứng từ bán hàng

> **Trạng thái:** 🔨 Đang xây dựng
> **Phase hiện tại:** Phase 2D đã merge chỉ có readonly danh sách + chi tiết hóa đơn
> **Phạm vi dài hạn:** Danh sách và chi tiết báo giá/hóa đơn sau khi rời màn hình POS

---

## 1. Mục đích

Module này dùng để tra cứu và kiểm tra lịch sử chứng từ bán hàng.

POS là nơi tạo/chốt đơn. SalesDocuments là nơi quản lý chứng từ đã lưu.

Phạm vi bán hàng là **bán đứt**. Báo giá nếu có chỉ là bản giá trước khi bán, không phải đơn đặt hàng, không giữ hàng, không giao hàng và không tạo công nợ/kho/tiền.

## 1.1. Trạng thái triển khai

| Nhóm năng lực | Trạng thái | Ghi chú |
|---|---|---|
| Danh sách chứng từ | ✅ Phase 2D | Readonly list cho hóa đơn `HD...`, có tìm kiếm mã chứng từ |
| Chi tiết chứng từ | ✅ Phase 2D | Readonly detail, hiển thị snapshot dòng hàng, thanh toán, công nợ và stock movements |
| Báo giá trong danh sách chứng từ | ⏭️ Phase 3A kế tiếp | `BG...` sinh từ POS draft, xem bằng bộ lọc Báo giá, mở lại vào POS draft local, checkout sang `HD...` |
| In lại bill/in báo giá | ⏭️ Phase 3B/future | Chỉ bật sau khi Bill Preview/print flow được chốt và implement |
| Sửa hóa đơn | ⏭️ Future phase | Chỉ bật sau khi có transaction an toàn và rule đảo dữ liệu rõ |
| Hủy hóa đơn | ⏭️ Future phase | Chỉ bật sau khi có transaction an toàn và rule đảo kho/tiền/công nợ rõ |
| Đảo kho/tiền/công nợ | ⏭️ Future phase | Không làm bằng thao tác UI rời rạc; phải đi qua nghiệp vụ sửa/hủy an toàn |

Phase 2D không biến SalesDocuments thành module quản lý đầy đủ. Nó chỉ giúp xem lại chứng từ đã phát sinh để đối chiếu.

---

## 2. File trong module

| File | Nội dung |
|---|---|
| [01-SALES-DOCUMENT-LIST.md](./01-SALES-DOCUMENT-LIST.md) | Danh sách báo giá/hóa đơn, bộ lọc, cột, thao tác nhanh |
| [02-SALES-DOCUMENT-DETAIL.md](./02-SALES-DOCUMENT-DETAIL.md) | Chi tiết chứng từ readonly hiện tại; mô tả sửa/hủy/in lại là future phase |
| [03-QUOTE-PHASE-3A.md](./03-QUOTE-PHASE-3A.md) | Ranh giới Phase 3A cho báo giá `BG...` sinh từ POS draft, không có module riêng |
| [04-QUOTE-PRINT-PHASE-3B.md](./04-QUOTE-PRINT-PHASE-3B.md) | Phase 3B in/xem báo giá đơn giản bằng mẫu mặc định |

---

## 3. Liên kết Source of Truth

- Business vòng đời đơn: [POS-ORDER-LIFECYCLE.md](../../03-BUSINESS-NghiepVu/Sales/POS-ORDER-LIFECYCLE.md)
- Business checkout: [POS-CHECKOUT.md](../../03-BUSINESS-NghiepVu/Sales/POS-CHECKOUT.md)
- Business công nợ: [POS-CUSTOMER-DEBT.md](../../03-BUSINESS-NghiepVu/Sales/POS-CUSTOMER-DEBT.md)
- Database Sales: [POS-TABLES.md](../../04-DATABASE/Sales/POS-TABLES.md)
- Backend Order API: [ORDER-API.md](../../05-BACKEND-MayChu/POS/ORDER-API.md)

---

## 4. Ngoài phạm vi MVP

- Trả hàng.
- Đặt hàng kiểu KiotViet.
- Đối tác giao hàng, vận đơn, COD.
- Bán hàng online/kênh bán.
- Hóa đơn điện tử.
- Đơn đa điểm, Ahamove/KShip.
- Gộp đơn nhiều chứng từ.
