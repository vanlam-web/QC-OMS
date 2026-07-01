# Purchase Tables — Phác thảo dữ liệu nhà cung cấp/nhập hàng

> **Trạng thái:** Source of Truth mức thiết kế dữ liệu; tên bảng/cột có thể tinh chỉnh khi implement
> **Business:** [SUPPLIER-PURCHASE.md](../../03-BUSINESS-NghiepVu/Purchase/SUPPLIER-PURCHASE.md)

---

## 1. Bảng chính

### `suppliers`

| Cột | Ghi chú |
|---|---|
| `id` | UUID |
| `code` | Unique, tự sinh nếu trống |
| `name` | Bắt buộc |
| `phone` | Nullable, không unique cứng trong MVP |
| `email` | Nullable |
| `address` | Nullable |
| `tax_code` | Nullable, text nội bộ |
| `linked_customer_id` | Nullable FK `customers.id`; dùng khi NCC cũng là khách hàng |
| `notes` | Nullable |
| `status` | `active`, `inactive` |
| `created_at`, `updated_at` | Audit |

`linked_customer_id` không được tự suy luận cứng theo số điện thoại. Người dùng hoặc migration chỉ gắn khi chắc chắn cùng một đối tác.

### `purchase_receipts`

| Cột | Ghi chú |
|---|---|
| `id` | UUID |
| `code` | Unique, ví dụ `PN000001` |
| `supplier_id` | FK `suppliers` |
| `warehouse_id` | FK nếu có nhiều kho; MVP có thể mặc định một kho |
| `received_at` | Thời gian nhập |
| `status` | `draft`, `posted`, `cancelled` |
| `supplier_document_no` | Số chứng từ/hóa đơn NCC dạng text |
| `subtotal_amount` | Tổng tiền hàng |
| `discount_amount` | Giảm giá phiếu nếu có |
| `payable_amount` | Cần trả NCC |
| `paid_amount` | Đã trả |
| `remaining_amount` | Còn phải trả |
| `notes` | Nullable |
| `created_by`, `posted_by`, `cancelled_by` | Audit |
| `created_at`, `posted_at`, `cancelled_at` | Audit |

### `purchase_receipt_items`

| Cột | Ghi chú |
|---|---|
| `id` | UUID |
| `purchase_receipt_id` | FK |
| `product_id` | FK |
| `inventory_shape` | Snapshot tại thời điểm nhập: `normal`, `roll`, `sheet` |
| `unit_id` | Đơn vị mua |
| `quantity` | Số lượng dòng nhập |
| `unit_cost` | Đơn giá nhập |
| `line_amount` | Thành tiền |
| `physical_payload` | JSON snapshot cho roll/sheet nếu cần |

---

## 2. Liên kết tồn vật lý

Khi `purchase_receipts.status = posted`:

- hàng `normal`: tạo stock movement tăng tồn
- hàng `roll`: tạo các roll object hoặc liên kết tới bảng roll hiện có
- hàng `sheet`: tạo sheet object/lô tấm hoặc liên kết tới bảng sheet hiện có

Các object vật lý cần lưu `purchase_receipt_item_id` để truy xuất nguồn giá vốn/NCC.

Không cập nhật tổng tồn cuộn/tấm bằng tay trong bảng sản phẩm.

---

## 3. Công nợ NCC và sổ quỹ

Thiết kế có thể dùng chung hạ tầng Finance hiện có:

- phiếu nhập posted chưa trả đủ tạo payable entry cho NCC
- trả tiền NCC tạo cashbook outflow/payment record
- payment allocation mặc định vào phiếu nhập nợ cũ nhất trước

Nếu sau này có bảng riêng, tên đề xuất:

- `supplier_payables`
- `supplier_payments`
- `supplier_payment_allocations`

---

## 4. Giá vốn

Giá vốn nên lưu tại:

- `purchase_receipt_items.unit_cost`
- object/lô vật lý đối với roll/sheet
- bảng tổng hợp cost nếu cần tối ưu báo cáo

Không dùng PriceBook làm nơi sửa giá vốn kế toán. PriceBook MVP chỉ đọc `giá nhập cuối` (`products.latest_purchase_cost`) để tính giá bán theo công thức. Trước khi Purchase receipt hoàn chỉnh, trường này có thể đến từ import/KiotViet hoặc thao tác admin có kiểm soát; sau này phiếu nhập `posted` là nguồn chính cập nhật.
