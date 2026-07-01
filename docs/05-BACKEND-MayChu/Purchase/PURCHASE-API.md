# Purchase API — Backend contract mức khung

> **Trạng thái:** Draft kỹ thuật từ Source of Truth nghiệp vụ
> **Business:** [SUPPLIER-PURCHASE.md](../../03-BUSINESS-NghiepVu/Purchase/SUPPLIER-PURCHASE.md)

---

## 1. Endpoints tối thiểu

| Method | Path | Mục đích |
|---|---|---|
| `GET` | `/v1/suppliers` | Danh sách NCC, search/filter |
| `POST` | `/v1/suppliers` | Tạo NCC |
| `GET` | `/v1/suppliers/{id}` | Chi tiết NCC |
| `PATCH` | `/v1/suppliers/{id}` | Sửa hồ sơ NCC |
| `GET` | `/v1/purchase/receipts` | Danh sách phiếu nhập |
| `POST` | `/v1/purchase/receipts` | Tạo phiếu nhập draft |
| `GET` | `/v1/purchase/receipts/{id}` | Chi tiết phiếu nhập |
| `PATCH` | `/v1/purchase/receipts/{id}` | Sửa draft |
| `POST` | `/v1/purchase/receipts/{id}/post` | Hoàn thành nhập hàng |
| `POST` | `/v1/purchase/receipts/{id}/cancel` | Hủy phiếu |
| `POST` | `/v1/suppliers/{id}/payments` | Trả tiền NCC |

---

## 2. Transaction khi post phiếu nhập

`POST /v1/purchase/receipts/{id}/post` phải chạy trong transaction:

1. validate phiếu đang `draft`
2. validate NCC, dòng hàng, đơn vị, giá nhập
3. với hàng `normal`: tạo stock movement tăng tồn
4. với hàng `roll`: tạo roll object vật lý và stock movement liên quan
5. với hàng `sheet`: tạo sheet object/lô tấm và stock movement liên quan
6. lưu giá vốn trên dòng nhập và object vật lý
7. tạo payable nếu chưa trả đủ
8. tạo cashbook outflow nếu có trả ngay
9. chuyển trạng thái phiếu sang `posted`

Nếu bất kỳ bước nào lỗi, rollback toàn bộ.

---

## 3. Search và filter

Danh sách phiếu nhập cần hỗ trợ:

- search exact theo mã phiếu
- search theo NCC
- date range dài hạn
- trạng thái
- người tạo/người nhập

Nếu search exact mã phiếu, backend nên bỏ qua/widen date filter mặc định để tránh không tìm thấy chứng từ cũ do đang lọc tháng hiện tại.

---

## 4. Không làm trong API đầu tiên

- đặt hàng nhập
- trả hàng nhập
- tích hợp hóa đơn điện tử/thuế
- nhiều phương thức thanh toán trong một lần trả NCC
- báo cáo NCC nâng cao

