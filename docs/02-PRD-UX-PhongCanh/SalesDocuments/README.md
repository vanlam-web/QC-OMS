# SalesDocuments — Quản lý chứng từ bán hàng

> **Trạng thái:** 🔨 Đang xây dựng  
> **Phạm vi:** Danh sách và chi tiết báo giá/hóa đơn sau khi rời màn hình POS

---

## 1. Mục đích

Module này dùng để tra cứu, in lại, mở lại báo giá, sửa/hủy hóa đơn và kiểm tra lịch sử chứng từ bán hàng.

POS là nơi tạo/chốt đơn. SalesDocuments là nơi quản lý chứng từ đã lưu.

Phạm vi bán hàng là **bán đứt**. Báo giá nếu có chỉ là bản giá trước khi bán, không phải đơn đặt hàng, không giữ hàng, không giao hàng và không tạo công nợ/kho/tiền.

---

## 2. File trong module

| File | Nội dung |
|---|---|
| [01-SALES-DOCUMENT-LIST.md](./01-SALES-DOCUMENT-LIST.md) | Danh sách báo giá/hóa đơn, bộ lọc, cột, thao tác nhanh |
| [02-SALES-DOCUMENT-DETAIL.md](./02-SALES-DOCUMENT-DETAIL.md) | Chi tiết chứng từ, sửa/hủy/in lại, liên kết kho/tiền/công nợ |

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
