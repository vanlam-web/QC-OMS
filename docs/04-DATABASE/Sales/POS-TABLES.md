# POS-TABLES — Bảng phục vụ màn hình POS

> **Trạng thái:** 🔨 Đang xây dựng
> **Nguồn:** Cập nhật theo Business Sales `POS-CUSTOMER.md` và `POS-PRICING.md`

---

## 1. Phạm vi

Tài liệu này là Source of Truth cho cấu trúc dữ liệu Sales phục vụ Customer, Product và Pricing trong POS Phase 1.

Business Rule liên quan:

- [POS-CUSTOMER.md](../../03-BUSINESS-NghiepVu/Sales/POS-CUSTOMER.md)
- [POS-PRICING.md](../../03-BUSINESS-NghiepVu/Sales/POS-PRICING.md)

Không chốt trong file này:

- Finance, Inventory, BOM và stock movement
- API request/response

---

## 2. Bảng `public.customers` — Khách hàng

### Mục đích

Lưu hồ sơ khách hàng phục vụ POS: chọn khách, chống trùng SĐT/mã khách và xác định nhóm khách.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `organization_id` | `uuid` | ❌ | FK → `public.organizations.id` |
| `code` | `text` | ❌ | Mã khách; nhập tay hoặc tự sinh dạng `KH000001` |
| `name` | `text` | ❌ | Tên khách hàng |
| `phone` | `text` | ✅ | SĐT hiển thị theo người dùng nhập |
| `phone_normalized` | `text` | ✅ | SĐT đã chuẩn hóa để chống trùng |
| `customer_group_id` | `uuid` | ✅ | FK → `public.customer_groups.id`; null nghĩa là dùng bảng giá chung |
| `created_at` | `timestamptz` | ❌ | Thời điểm tạo |
| `updated_at` | `timestamptz` | ❌ | Thời điểm cập nhật gần nhất |

### Quan hệ

```text
public.customers.organization_id
    -> public.organizations.id

public.customers.customer_group_id
    -> public.customer_groups.id
```

### Ràng buộc

- `UNIQUE (organization_id, code)`
- `phone_normalized` được phép null.
- Không cho trùng `phone_normalized` trong cùng `organization_id` khi `phone_normalized` không null.
- `name` không được rỗng sau khi trim.
- `code` không được rỗng sau khi trim.

### Index

- `idx_customers_org_name` trên `(organization_id, name)`
- `idx_customers_org_group` trên `(organization_id, customer_group_id)`
- `idx_customers_org_phone_normalized` trên `(organization_id, phone_normalized)` với điều kiện `phone_normalized IS NOT NULL`

---

## 3. Bảng `public.customer_groups` — Nhóm khách

### Mục đích

Lưu nhóm khách để xác định bảng giá mặc định áp dụng cho khách thuộc nhóm đó.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `organization_id` | `uuid` | ❌ | FK → `public.organizations.id` |
| `code` | `text` | ❌ | Mã nhóm khách |
| `name` | `text` | ❌ | Tên nhóm khách |
| `price_list_id` | `uuid` | ❌ | FK → `public.price_lists.id` |
| `is_active` | `boolean` | ❌ | Nhóm còn được dùng để gán cho khách mới |
| `created_at` | `timestamptz` | ❌ | Thời điểm tạo |
| `updated_at` | `timestamptz` | ❌ | Thời điểm cập nhật gần nhất |

### Quan hệ

```text
public.customer_groups.organization_id
    -> public.organizations.id

public.customer_groups.price_list_id
    -> public.price_lists.id
```

### Ràng buộc

- `UNIQUE (organization_id, code)`
- `name` không được rỗng sau khi trim.
- `price_list_id` phải trỏ tới bảng giá cùng `organization_id`.

### Index

- `idx_customer_groups_org_active` trên `(organization_id, is_active)`
- `idx_customer_groups_org_price_list` trên `(organization_id, price_list_id)`

---

## 4. Bảng `public.price_lists` — Bảng giá

### Mục đích

Lưu đầu bảng giá. Chi tiết giá theo sản phẩm nằm ở `public.price_list_items`.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `organization_id` | `uuid` | ❌ | FK → `public.organizations.id` |
| `code` | `text` | ❌ | Mã bảng giá |
| `name` | `text` | ❌ | Tên bảng giá |
| `is_default` | `boolean` | ❌ | Bảng giá chung mặc định của organization |
| `is_active` | `boolean` | ❌ | Bảng giá còn được áp dụng |
| `created_at` | `timestamptz` | ❌ | Thời điểm tạo |
| `updated_at` | `timestamptz` | ❌ | Thời điểm cập nhật gần nhất |

### Ràng buộc

- `UNIQUE (organization_id, code)`
- Mỗi organization có đúng một bảng giá chung đang active tại một thời điểm.
- `name` không được rỗng sau khi trim.

### Index

- `idx_price_lists_org_active` trên `(organization_id, is_active)`
- `idx_price_lists_org_default` trên `(organization_id, is_default)`

---

## 5. Bảng `public.price_list_items` — Chi tiết bảng giá

### Mục đích

Lưu đơn giá của từng sản phẩm trong từng bảng giá. Bảng này thay thế cách lưu mảng JSONB để dễ kiểm tra trùng, query và fallback về bảng giá chung.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `organization_id` | `uuid` | ❌ | FK → `public.organizations.id` |
| `price_list_id` | `uuid` | ❌ | FK → `public.price_lists.id` |
| `product_id` | `uuid` | ❌ | FK → `public.products.id` |
| `unit_price` | `numeric(12,0)` | ❌ | Giá bán theo đơn vị bán của sản phẩm |
| `created_at` | `timestamptz` | ❌ | Thời điểm tạo |
| `updated_at` | `timestamptz` | ❌ | Thời điểm cập nhật gần nhất |

### Quan hệ

```text
public.price_list_items.price_list_id
    -> public.price_lists.id

public.price_list_items.product_id
    -> public.products.id
```

### Ràng buộc

- `UNIQUE (price_list_id, product_id)`
- `unit_price >= 0`
- `price_list_id` và `product_id` phải thuộc cùng `organization_id`.
- Với sản phẩm bán theo `m tới`, `unit_price` là giá cho `1 m tới`.

### Index

- `idx_price_list_items_list_product` trên `(price_list_id, product_id)`
- `idx_price_list_items_product` trên `(organization_id, product_id)`

---

## 6. Bảng `public.products` — Sản phẩm / dịch vụ

### Mục đích

Lưu danh sách sản phẩm/dịch vụ phục vụ POS và trang Hàng hóa.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `organization_id` | `uuid` | ❌ | FK → `public.organizations.id` |
| `code` | `text` | ❌ | Mã hàng hóa/dịch vụ |
| `name` | `text` | ❌ | Tên hàng hóa/dịch vụ |
| `status` | `text` | ❌ | `active` hoặc `inactive` |
| `unit_name` | `text` | ❌ | Tên đơn vị hiển thị, ví dụ `m²`, `m`, `cái`, `bộ` |
| `sell_method` | `text` | ❌ | Cách tính bán: `quantity`, `area_m2`, `linear_m`, `sheet`, `combo` |
| `created_at` | `timestamptz` | ❌ | Thời điểm tạo |
| `updated_at` | `timestamptz` | ❌ | Thời điểm cập nhật gần nhất |

### Ràng buộc

- `UNIQUE (organization_id, code)`
- `status IN ('active', 'inactive')`
- `sell_method IN ('quantity', 'area_m2', 'linear_m', 'sheet', 'combo')`
- `name` không được rỗng sau khi trim.
- `unit_name` không được rỗng sau khi trim.
- POS bán hàng chỉ tìm và chọn sản phẩm có `status = 'active'`.

### Index

- `idx_products_org_status` trên `(organization_id, status)`
- `idx_products_org_code` trên `(organization_id, code)`
- `idx_products_org_name` trên `(organization_id, name)`
- Cần index hoặc cột phụ phục vụ tìm kiếm không dấu khi triển khai.

### Ghi chú đơn vị

- `sell_method = 'linear_m'` dùng cho sản phẩm bán theo mét tới; `unit_price` trong `price_list_items` là giá cho `1 m tới`.
- `Cuộn` không phải đơn vị bán trực tiếp trên POS Phase 1.
- Quản lý tồn theo cuộn/tấm/lot thuộc Inventory, không nằm trong bảng này.

---

## 7. Bảng `public.customer_product_price_history` — Lịch sử giá riêng

### Mục đích

Lưu giá sửa tay từng bán cho một cặp khách hàng + sản phẩm, để lần sau nhân viên có thể chọn lại tối đa 5 giá gần nhất.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `organization_id` | `uuid` | ❌ | FK → `public.organizations.id` |
| `customer_id` | `uuid` | ❌ | FK → `public.customers.id` |
| `product_id` | `uuid` | ❌ | FK → `public.products.id` |
| `unit_price` | `numeric(12,0)` | ❌ | Giá sửa tay đã bán |
| `sold_at` | `timestamptz` | ❌ | Thời điểm phát sinh giá này |
| `created_at` | `timestamptz` | ❌ | Thời điểm ghi nhận |

### Quan hệ

```text
public.customer_product_price_history.customer_id
    -> public.customers.id

public.customer_product_price_history.product_id
    -> public.products.id
```

### Ràng buộc

- `unit_price >= 0`
- `customer_id` và `product_id` phải thuộc cùng `organization_id`.
- Lịch sử giá không thay thế bảng giá mặc định.

### Index

- `idx_customer_product_price_history_recent` trên `(organization_id, customer_id, product_id, sold_at DESC)`

## 8. Bảng `public.orders` — Báo giá và hóa đơn bán hàng

### Mục đích

Lưu chứng từ đã được server ghi nhận: báo giá `BG...` và hóa đơn bán hàng `HD...`.

Hóa đơn nháp POS Phase 2 vẫn lưu local theo máy POS, không tạo bản ghi `orders` cho đến khi nhân viên lưu báo giá hoặc checkout thành công.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `organization_id` | `uuid` | ❌ | FK → `public.organizations.id` |
| `code` | `text` | ❌ | Mã chứng từ, ví dụ `BG000001`, `HD000001` |
| `order_type` | `text` | ❌ | `quote` hoặc `invoice` |
| `status` | `text` | ❌ | Trạng thái chứng từ |
| `source_quote_id` | `uuid` | ✅ | FK → `public.orders.id`; hóa đơn sinh từ báo giá |
| `customer_id` | `uuid` | ✅ | FK → `public.customers.id`; null nếu khách lẻ |
| `customer_snapshot` | `jsonb` | ❌ | Snapshot khách hàng hoặc khách lẻ tại thời điểm lưu |
| `price_list_id` | `uuid` | ✅ | FK → `public.price_lists.id`; bảng giá áp dụng nếu có |
| `subtotal_amount` | `numeric(12,0)` | ❌ | Tổng tiền hàng trước các xử lý thanh toán |
| `total_amount` | `numeric(12,0)` | ❌ | Tổng tiền chứng từ |
| `note` | `text` | ✅ | Ghi chú đơn |
| `created_by` | `uuid` | ❌ | FK → `public.profiles.id` |
| `created_at` | `timestamptz` | ❌ | Thời điểm tạo |
| `updated_at` | `timestamptz` | ❌ | Thời điểm cập nhật gần nhất |

### Ràng buộc

- `UNIQUE (organization_id, code)`
- `order_type IN ('quote', 'invoice')`
- Với `order_type = 'quote'`, `code` dùng prefix `BG`.
- Với `order_type = 'invoice'`, `code` dùng prefix `HD`.
- `status` hợp lệ theo `order_type`.
- `subtotal_amount >= 0`
- `total_amount >= 0`
- `source_quote_id` nếu có phải trỏ tới `orders` cùng organization và `order_type = 'quote'`.
- `customer_snapshot` bắt buộc để giữ lịch sử ngay cả khi hồ sơ khách thay đổi.

### Trạng thái khởi điểm

| order_type | status | Ý nghĩa |
|---|---|---|
| `quote` | `active` | Báo giá đang còn hiệu lực để mở lại/sửa/chuyển hóa đơn |
| `quote` | `converted` | Báo giá đã được chuyển thành hóa đơn |
| `quote` | `cancelled` | Báo giá đã hủy |
| `invoice` | `completed` | Hóa đơn bán hàng đã checkout thành công |
| `invoice` | `cancelled` | Hóa đơn đã hủy/đảo theo nghiệp vụ tương ứng |

### Index

- `idx_orders_org_type_status` trên `(organization_id, order_type, status)`
- `idx_orders_org_customer` trên `(organization_id, customer_id)`
- `idx_orders_org_created_at` trên `(organization_id, created_at DESC)`
- `idx_orders_source_quote` trên `(organization_id, source_quote_id)` với điều kiện `source_quote_id IS NOT NULL`

---

## 9. Bảng `public.order_items` — Dòng chứng từ

### Mục đích

Lưu snapshot dòng hàng của báo giá hoặc hóa đơn bán hàng.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `organization_id` | `uuid` | ❌ | FK → `public.organizations.id` |
| `order_id` | `uuid` | ❌ | FK → `public.orders.id` |
| `line_no` | `integer` | ❌ | Số thứ tự dòng |
| `product_id` | `uuid` | ✅ | FK → `public.products.id`; null nếu sau này cho dòng tự do |
| `product_snapshot` | `jsonb` | ❌ | Snapshot mã, tên, đơn vị và cách tính bán |
| `sell_method` | `text` | ❌ | `quantity`, `area_m2`, `linear_m`, `sheet`, `combo` |
| `quantity` | `numeric(12,3)` | ❌ | Số lượng chính của dòng |
| `width_m` | `numeric(12,3)` | ✅ | Rộng theo mét nếu có |
| `height_m` | `numeric(12,3)` | ✅ | Dài/cao theo mét nếu có |
| `linear_m` | `numeric(12,3)` | ✅ | Mét tới nếu có |
| `unit_price` | `numeric(12,0)` | ❌ | Đơn giá đã áp dụng |
| `price_source` | `text` | ❌ | `customer_group`, `default_price_list`, `fallback_default_price_list`, `manual` |
| `line_total` | `numeric(12,0)` | ❌ | Thành tiền dòng |
| `note` | `text` | ✅ | Ghi chú dòng |
| `created_at` | `timestamptz` | ❌ | Thời điểm tạo |

### Ràng buộc

- `UNIQUE (order_id, line_no)`
- `quantity > 0`
- `unit_price >= 0`
- `line_total >= 0`
- `sell_method IN ('quantity', 'area_m2', 'linear_m', 'sheet', 'combo')`
- `price_source IN ('customer_group', 'default_price_list', 'fallback_default_price_list', 'manual')`
- `order_id` phải cùng `organization_id`.
- `product_id` nếu có phải cùng `organization_id`.

### Index

- `idx_order_items_order` trên `(organization_id, order_id, line_no)`
- `idx_order_items_product` trên `(organization_id, product_id)` với điều kiện `product_id IS NOT NULL`

---

## 10. Bảng `public.order_status_history` — Lịch sử trạng thái chứng từ

### Mục đích

Ghi lịch sử đổi trạng thái của báo giá và hóa đơn để truy vết vòng đời chứng từ.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `organization_id` | `uuid` | ❌ | FK → `public.organizations.id` |
| `order_id` | `uuid` | ❌ | FK → `public.orders.id` |
| `from_status` | `text` | ✅ | Trạng thái trước đó |
| `to_status` | `text` | ❌ | Trạng thái mới |
| `reason` | `text` | ✅ | Lý do đổi trạng thái nếu có |
| `changed_by` | `uuid` | ❌ | FK → `public.profiles.id` |
| `changed_at` | `timestamptz` | ❌ | Thời điểm đổi trạng thái |

### Ràng buộc

- `order_id` phải cùng `organization_id`.
- Không xóa lịch sử trạng thái khi chứng từ bị hủy.

### Index

- `idx_order_status_history_order` trên `(organization_id, order_id, changed_at DESC)`

---

## 11. Supabase Realtime Channel — `workstation_queue`

### Mục đích

Realtime channel để máy trạm xưởng gửi sự kiện, phục vụ luồng K02-D ở các phase sau.

### Cấu hình

| Thành phần | Giá trị |
|---|---|
| Channel name | `workstation_queue` |
| Type | Broadcast |
| Visibility | Private |

### Event payload dự kiến

```json
{
  "workstation_id": "string",
  "event_type": "job_started | job_completed | job_cancelled",
  "order_id": "string",
  "timestamp": "ISO8601"
}
```

---

← [Quay về Sales README](./README.md)
