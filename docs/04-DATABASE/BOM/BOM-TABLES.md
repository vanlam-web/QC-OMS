# BOM Tables — Phác thảo dữ liệu định mức vật tư

> **Trạng thái:** Source of Truth mức thiết kế dữ liệu; tên bảng/cột có thể tinh chỉnh khi implement
> **Business:** [BOM-RULES.md](../../03-BUSINESS-NghiepVu/BOM/BOM-RULES.md)

---

## 1. Bảng BOM chuẩn

### `product_boms`

| Cột | Ghi chú |
|---|---|
| `id` | UUID |
| `product_id` | Sản phẩm/combo sở hữu BOM |
| `version` | Số version tăng dần |
| `status` | `draft`, `active`, `archived` |
| `notes` | Nullable |
| `created_by`, `created_at` | Audit |

Chỉ một BOM `active` hiện hành cho một sản phẩm tại một thời điểm.

### `product_bom_items`

| Cột | Ghi chú |
|---|---|
| `id` | UUID |
| `bom_id` | FK `product_boms` |
| `component_product_id` | Vật tư/sản phẩm thành phần |
| `quantity` | Định mức |
| `unit_id` | Đơn vị định mức |
| `calculation_payload` | JSON cho kích thước, diện tích, mét tới nếu có |
| `sort_order` | Thứ tự hiển thị |
| `notes` | Nullable |

Thành phần có thể là vật tư lá hoặc sản phẩm có BOM con.

---

## 2. Snapshot trên chứng từ

### `order_item_bom_snapshots`

| Cột | Ghi chú |
|---|---|
| `id` | UUID |
| `order_item_id` | Dòng hóa đơn/báo giá |
| `source_type` | `standard_bom`, `line_override` |
| `source_bom_id` | Nullable |
| `source_bom_version` | Nullable |
| `snapshot_payload` | JSON đầy đủ thành phần đã dùng |
| `created_at` | Audit |

Snapshot bắt buộc để hóa đơn cũ không đổi khi BOM chuẩn được sửa.

---

## 3. Validation bắt buộc

Backend/database layer phải hỗ trợ:

- chặn vòng lặp BOM
- giới hạn deep-scan mặc định 5 cấp
- không cho xóa BOM version đã được chứng từ tham chiếu nếu chưa có cơ chế archive an toàn
- sửa BOM active bằng cách tạo version mới

---

## 4. Import KiotViet

Dữ liệu `Hàng thành phần` từ KiotViet được import vào trạng thái nháp/cần rà soát.

Không lưu định dạng text `Ma:SoLuong|Ma:SoLuong` làm schema chính.

