# POS-TABLES — Bảng phục vụ màn hình POS

> **Trạng thái:** 🔨 Đang xây dựng
> **Nguồn:** Cập nhật theo Business Sales `POS-CUSTOMER.md`, `POS-PRICING.md`, `POS-ORDER-LIFECYCLE.md`, `POS-ORDER-CALC.md`, `POS-CHECKOUT.md`

---

## 1. Phạm vi

Tài liệu này là Source of Truth cho cấu trúc dữ liệu Sales phục vụ Customer, Product, Pricing, báo giá và hóa đơn POS Phase 1.

Business Rule liên quan:

- [POS-CUSTOMER.md](../../03-BUSINESS-NghiepVu/Sales/POS-CUSTOMER.md)
- [POS-PRICING.md](../../03-BUSINESS-NghiepVu/Sales/POS-PRICING.md)
- [POS-ORDER-LIFECYCLE.md](../../03-BUSINESS-NghiepVu/Sales/POS-ORDER-LIFECYCLE.md)
- [POS-ORDER-CALC.md](../../03-BUSINESS-NghiepVu/Sales/POS-ORDER-CALC.md)
- [POS-CHECKOUT.md](../../03-BUSINESS-NghiepVu/Sales/POS-CHECKOUT.md)

Không chốt trong file này:

- Chi tiết Finance, Debt, Cashbook, BOM và stock movement
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
| `pricing_mode` | `text` | ❌ | `manual` hoặc `formula` |
| `unit_price` | `numeric(12,0)` | ✅ | Giá bán nhập tay theo đơn vị bán của sản phẩm; bắt buộc khi `pricing_mode = manual` |
| `formula_rule_id` | `uuid` | ✅ | FK → `public.price_formula_rules.id`; bắt buộc khi `pricing_mode = formula` |
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
- `pricing_mode IN ('manual', 'formula')`
- Nếu `pricing_mode = manual` thì `unit_price IS NOT NULL AND unit_price >= 0`.
- Nếu `pricing_mode = formula` thì `formula_rule_id IS NOT NULL`; giá bán hiệu lực được backend tính theo formula rule và `products.latest_purchase_cost`.
- `price_list_id` và `product_id` phải thuộc cùng `organization_id`.
- Với sản phẩm bán theo `m tới`, `unit_price` là giá cho `1 m tới`.
- Với bảng giá nhóm khách và `pricing_mode = manual`, `unit_price = 0` là sentinel nghiệp vụ: POS resolve theo `giá nhập gần nhất`; nếu chưa có giá nhập gần nhất thì dùng `0`.
- Với bảng giá chung và `pricing_mode = manual`, `unit_price = 0` giữ nguyên là giá đã khai báo/import, không mang nghĩa fallback.

### Ghi chú formula

- Formula phải lưu structured trong DB ngay từ MVP đầu tiên, không chỉ tính tạm ở UI.
- Ô giá `formula` tự tính lại khi `products.latest_purchase_cost` thay đổi.
- Nếu người dùng nhập giá tay, backend đổi `pricing_mode = manual`, ghi `unit_price`, xóa/ignore `formula_rule_id`.
- Nếu người dùng gắn công thức khác, backend đổi `formula_rule_id` sang rule mới.

### Index

- `idx_price_list_items_list_product` trên `(price_list_id, product_id)`
- `idx_price_list_items_product` trên `(organization_id, product_id)`

---

## 6. Bảng `public.price_formula_rules` — Công thức giá

### Mục đích

Lưu công thức PriceBook có cấu trúc để các ô giá theo công thức tiếp tục biến đổi theo `giá nhập cuối`.

### Các cột tối thiểu

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `organization_id` | `uuid` | ❌ | FK → `public.organizations.id` |
| `name` | `text` | ❌ | Tên dễ hiểu, ví dụ `Fomex 5mm` |
| `product_filter` | `jsonb` | ❌ | Điều kiện lọc slice đầu: tên chứa, mã chứa, sell_method/unit, status active; nhóm hàng để future |
| `cost_formula` | `jsonb` | ❌ | Cấu hình `Chi phí`: fixed amount hoặc amount + percent |
| `profit_formula` | `jsonb` | ❌ | Cấu hình `Lợi nhuận`: fixed amount hoặc tiers theo `latest_purchase_cost` |
| `price_list_adjustments` | `jsonb` | ❌ | Điều chỉnh theo từng `price_list_id`: +/- amount hoặc +/- percent |
| `is_active` | `boolean` | ❌ | Rule còn dùng được |
| `created_by` | `uuid` | ✅ | User tạo |
| `updated_by` | `uuid` | ✅ | User cập nhật gần nhất |
| `created_at` | `timestamptz` | ❌ | Thời điểm tạo |
| `updated_at` | `timestamptz` | ❌ | Thời điểm cập nhật gần nhất |

### Ràng buộc

- Không lưu công thức dạng text tự do.
- Backend phải validate structured JSON trước khi lưu.
- `product_filter` slice đầu không hỗ trợ `group_id` vì chưa có `product_groups/products.product_group_id`.
- `price_list_adjustments` tham chiếu các bảng giá cùng organization.
- Tiers lợi nhuận được evaluate theo thứ tự; backend chặn overlap rõ ràng, gap được phép và lợi nhuận mặc định `0` nếu không có tier khớp.
- Giá cuối làm tròn lên `1,000đ`; backend phải có test cho rule rounding.

---

## 7. Bảng `public.products` — Sản phẩm / dịch vụ

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
| `latest_purchase_cost` | `numeric(12,0)` | ✅ | Giá nhập cuối dùng cho PriceBook formula; không phải giá vốn kế toán; cho phép admin cập nhật tạm trước Purchase |
| `latest_purchase_cost_at` | `timestamptz` | ✅ | Thời điểm nguồn giá nhập cuối được cập nhật |
| `latest_purchase_cost_updated_by` | `uuid` | ✅ | User cập nhật thủ công/import gần nhất nếu có |
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
- Trước khi Purchase receipt hoàn chỉnh, `latest_purchase_cost` có thể đến từ import/KiotViet hoặc thao tác admin có kiểm soát qua Product admin/API. Khi Purchase receipt `posted` đã có, receipt là nguồn chính cập nhật trường này.

---

## 8. Bảng `public.customer_product_price_history` — Lịch sử giá riêng

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

## 9. Bảng `public.orders` — Báo giá và hóa đơn bán hàng

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
| `base_code` | `text` | ❌ | Mã gốc của chuỗi chứng từ, ví dụ `HD000123` |
| `revision_no` | `integer` | ❌ | Số lần sửa; bản gốc là `0`, bản sửa đầu là `1` |
| `revised_from_order_id` | `uuid` | ✅ | FK → `public.orders.id`; chứng từ cũ gần nhất nếu đây là bản sửa |
| `replaced_by_order_id` | `uuid` | ✅ | FK → `public.orders.id`; chứng từ mới thay thế nếu bản này bị hủy do sửa |
| `customer_id` | `uuid` | ✅ | FK → `public.customers.id`; null nếu khách lẻ |
| `customer_snapshot` | `jsonb` | ❌ | Snapshot khách hàng hoặc khách lẻ tại thời điểm lưu |
| `price_list_id` | `uuid` | ✅ | FK → `public.price_lists.id`; bảng giá áp dụng nếu có |
| `subtotal_amount` | `numeric(12,0)` | ❌ | Tổng tiền hàng trước chiết khấu |
| `discount_amount` | `numeric(12,0)` | ❌ | Tổng chiết khấu trên chứng từ |
| `total_amount` | `numeric(12,0)` | ❌ | Khách cần trả sau chiết khấu |
| `paid_amount` | `numeric(12,0)` | ❌ | Tổng tiền đã áp vào hóa đơn này; không phải tổng tiền khách đưa |
| `debt_amount` | `numeric(12,0)` | ❌ | Số tiền còn nợ của hóa đơn này |
| `change_returned_amount` | `numeric(12,0)` | ❌ | Tiền thừa trả lại khách, không ghi thành trả trước trong MVP |
| `payment_status` | `text` | ❌ | `not_applicable`, `unpaid`, `partial`, `paid` |
| `note` | `text` | ✅ | Ghi chú đơn |
| `cancel_reason_type` | `text` | ✅ | `user_cancelled` hoặc `revised`; null nếu chưa hủy |
| `cancelled_at` | `timestamptz` | ✅ | Thời điểm hủy nếu có |
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
- `discount_amount >= 0`
- `total_amount >= 0`
- `paid_amount >= 0`
- `debt_amount >= 0`
- `change_returned_amount >= 0`
- `discount_amount <= subtotal_amount`
- `total_amount = subtotal_amount - discount_amount`
- `customer_snapshot` bắt buộc để giữ lịch sử ngay cả khi hồ sơ khách thay đổi.
- `payment_status IN ('not_applicable', 'unpaid', 'partial', 'paid')`
- Với `order_type = 'quote'`, `paid_amount = 0`, `debt_amount = 0`, `change_returned_amount = 0`, `payment_status = 'not_applicable'`.
- Với `order_type = 'invoice'`, `paid_amount <= total_amount` và `debt_amount = total_amount - paid_amount`.
- Với `order_type = 'invoice'` và `debt_amount = 0`, `payment_status = 'paid'`.
- Với `order_type = 'invoice'`, nếu `debt_amount > 0` và `paid_amount > 0` thì `payment_status = 'partial'`.
- Với `order_type = 'invoice'`, nếu `debt_amount > 0` và `paid_amount = 0` thì `payment_status = 'unpaid'`.
- Nếu `status = 'cancelled'`, `cancel_reason_type` bắt buộc.
- `cancel_reason_type IN ('user_cancelled', 'revised')` khi không null.
- `revision_no >= 0`
- `base_code` không được rỗng sau khi trim.
- Với bản gốc, `revision_no = 0`, `code = base_code`, `revised_from_order_id` null.
- Với bản sửa, `revision_no > 0`, `code = base_code || '.' || LPAD(revision_no, 2, '0')`, `revised_from_order_id` bắt buộc.
- `revised_from_order_id` và `replaced_by_order_id` nếu có phải cùng `organization_id`, cùng `order_type` và cùng `base_code`.

### Trạng thái khởi điểm

| order_type | status | Ý nghĩa |
|---|---|---|
| `quote` | `active` | Báo giá đã lưu, còn xem/mở lại được |
| `quote` | `cancelled` | Future/optional nếu sau này có hủy báo giá thủ công |
| `invoice` | `completed` | Hóa đơn bán hàng đã checkout thành công |
| `invoice` | `cancelled` | Hóa đơn đã hủy/đảo theo nghiệp vụ tương ứng |

### Quy tắc sửa chứng từ đã chốt

- Không sửa đè dữ liệu chứng từ đã chốt.
- Khi sửa hóa đơn đã checkout, hệ thống tạo chứng từ mới với `base_code` giữ nguyên và `revision_no` tăng dần.
- Ví dụ: bản gốc `HD000123`; sửa lần 1 tạo `HD000123.01`; sửa lần 2 tạo `HD000123.02`.
- Bản cũ chuyển `status = 'cancelled'`, `cancel_reason_type = 'revised'`, và trỏ `replaced_by_order_id` tới bản mới.
- Bản mới trỏ `revised_from_order_id` tới bản cũ gần nhất.
- Các tác động đảo kho, đảo tiền và đảo công nợ không được sửa trực tiếp vào dòng lịch sử cũ; domain Inventory/Finance phải tạo giao dịch đảo hoặc giao dịch bổ sung để truy vết.

### Quy tắc mở lại báo giá

- Báo giá đã lưu không sửa đè snapshot cũ.
- Khi mở lại báo giá, hệ thống chỉ trả snapshot để POS tạo nháp local.
- Nếu nhân viên sửa nháp đó rồi lưu báo giá, hệ thống tạo `BG...` mới độc lập qua flow tạo báo giá bình thường.
- Không tạo revision dạng `BG000123.01` cho báo giá trong Phase 3A.
- Không đổi báo giá gốc sang `converted` khi thanh toán từ nháp mở lại.
- Báo giá gốc vẫn `active` để tra cứu hoặc mở lại làm mẫu nội dung về sau.

### Index

- `idx_orders_org_type_status` trên `(organization_id, order_type, status)`
- `idx_orders_org_customer` trên `(organization_id, customer_id)`
- `idx_orders_org_created_at` trên `(organization_id, created_at DESC)`
- `idx_orders_org_base_revision` trên `(organization_id, base_code, revision_no)`
- `idx_orders_revised_from` trên `(organization_id, revised_from_order_id)` với điều kiện `revised_from_order_id IS NOT NULL`
- `idx_orders_replaced_by` trên `(organization_id, replaced_by_order_id)` với điều kiện `replaced_by_order_id IS NOT NULL`

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
| `line_subtotal_amount` | `numeric(12,0)` | ❌ | Thành tiền dòng trước chiết khấu dòng |
| `discount_amount` | `numeric(12,0)` | ❌ | Chiết khấu riêng của dòng nếu có |
| `price_source` | `text` | ❌ | `customer_group`, `default_price_list`, `fallback_default_price_list`, `manual` |
| `line_total` | `numeric(12,0)` | ❌ | Thành tiền dòng sau chiết khấu dòng |
| `note` | `text` | ✅ | Ghi chú dòng |
| `created_at` | `timestamptz` | ❌ | Thời điểm tạo |

### Ràng buộc

- `UNIQUE (order_id, line_no)`
- `quantity > 0`
- `unit_price >= 0`
- `line_subtotal_amount >= 0`
- `discount_amount >= 0`
- `line_total >= 0`
- `discount_amount <= line_subtotal_amount`
- `line_total = line_subtotal_amount - discount_amount`
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

## 11. Production queue placeholder

### Mục đích

K02-D dùng hàng đợi máy sản xuất để đưa thông báo/file vào POS và tạo hóa đơn nháp. Chi tiết bảng production queue, event history, claim và restore chưa nằm trong Sales tables; sẽ được thiết kế ở phase Production queue.

Sales chỉ lưu kết quả khi nhân viên chốt/lưu báo giá hoặc hóa đơn. Thông báo máy sản xuất không tự tạo `orders`, không tự trừ kho và không tự ghi doanh thu.

### Realtime channel dự kiến

| Thành phần | Giá trị |
|---|---|
| Channel name | `production_queue` |
| Type | Broadcast |
| Visibility | Private |

### Payload tối thiểu dự kiến

```json
{
  "production_machine_id": "string",
  "queue_item_id": "string",
  "event_type": "queued | claimed | dismissed | restored",
  "timestamp": "ISO8601"
}
```

Payload chính thức xem draft `docs/superpowers/specs/2026-07-01-production-queue-contract-draft.md` trước khi chuyển thành Database/Backend Source of Truth.

---

← [Quay về Sales README](./README.md)
