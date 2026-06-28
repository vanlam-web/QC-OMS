# POS-TABLES — Bảng phục vụ màn hình POS

> **Trạng thái:** 🔨 Đang xây dựng
> **Nguồn:** Di chuyển từ `02-PRD-UX-PhongCanh/POS/K01/01c-K01-ARCH-SAFETY.md` (Section IV) và `02-PRD-UX-PhongCanh/POS/K03/01-K03A-DOI-TAC.md` (Section IV)

---

## 1. Bảng `public.customers` — Đối tác / Khách hàng

### Mục đích

Lưu hồ sơ đối tác phục vụ POS — chọn khách hàng, áp bảng giá chiết khấu.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `name` | `text` | ❌ | Tên khách hàng / đối tác |
| `phone` | `text` | ✅ | Số điện thoại |
| `price_list_id` | `uuid` | ✅ | Bảng giá đang áp (FK → `public.price_lists.id`) |
| `discount_rate` | `numeric(5,2)` | ✅ | Tỷ lệ chiết khấu tùy chỉnh (%) |
| `created_at` | `timestamptz` | ❌ | Thời điểm tạo |
| `updated_at` | `timestamptz` | ❌ | Thời điểm cập nhật gần nhất |

### Quan hệ

```
public.customers.price_list_id
    ──── FK ────► public.price_lists.id
```

### Ràng buộc

- `UNIQUE` trên `phone` (nếu không null)
- `CHECK`: `discount_rate` ∈ [0, 100]

### Index

- `idx_customers_phone` trên `phone`
- `idx_customers_price_list_id` trên `price_list_id`

### Business Rule liên quan

> Xem: `03-BUSINESS-NghiepVu/Sales/`

---

## 2. Bảng `public.price_lists` — Bảng giá

### Mục đích

Lưu danh sách bảng giá phục vụ POS — mỗi bảng giá chứa danh sách sản phẩm với đơn giá riêng.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `name` | `text` | ❌ | Tên bảng giá (VD: "Bảng giá VIP - PNJ") |
| `discount_items` | `jsonb` | ✅ | Mảng đơn giá theo sản phẩm |
| `created_at` | `timestamptz` | ❌ | Thời điểm tạo |
| `updated_at` | `timestamptz` | ❌ | Thời điểm cập nhật gần nhất |

### Cấu trúc `discount_items`

```json
[
  { "product_id": "uuid", "unit_price": 50000 },
  { "product_id": "uuid", "unit_price": 120000 }
]
```

### Ràng buộc

- `UNIQUE` trên `name`

### Index

- `idx_price_lists_name` trên `name`

---

## 3. Bảng `auth.users` — Người dùng (Supabase Auth)

### Mục đích

Lấy định danh người dùng đang đăng nhập để liên kết với hồ sơ nhân viên / phân quyền của hệ thống.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính (Supabase Auth tự quản lý) |
| `raw_user_meta_data` | `jsonb` | ✅ | Metadata do Supabase Auth quản lý, có thể chứa tên hiển thị |
| `email` | `text` | ❌ | Email đăng nhập |
| `created_at` | `timestamptz` | ❌ | Thời điểm tạo |

### Ghi chú

- Bảng này do Supabase Auth quản lý, không tự tạo thêm cột ứng dụng.
- Hồ sơ ứng dụng, máy trạm và permissions được đặc tả tại [System/AUTH-PERMISSIONS.md](../System/AUTH-PERMISSIONS.md).
- Máy trạm là định danh thiết bị/quầy, không gắn cứng vào `auth.users`.

---

## 4. Bảng `public.products` — Sản phẩm

### Mục đích

Lưu danh sách sản phẩm phục vụ POS — gọi khi bấm F3 mở lưới sản phẩm nhanh.

### Các cột

| Tên cột | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|---|---|
| `id` | `uuid` | ❌ | Khóa chính |
| `name` | `text` | ❌ | Tên sản phẩm |
| `price` | `numeric(12,0)` | ❌ | Đơn giá mặc định |
| `unit_name` | `text` | ❌ | Tên đơn vị tính (m², Cái, Combo) |

### Index

- `idx_products_name` trên `name` (Full-text search)
- `idx_products_unit_name` trên `unit_name`

### Ghi chú

- POS chỉ `SELECT id, name, price, unit_name` — không lấy toàn bộ cột.

---

## 5. Supabase Realtime Channel — `workstation_queue`

### Mục đích

Realtime channel để máy trạm xưởng gửi sự kiện → cập nhật gián tiếp luồng `K02-D` (Hàng đợi máy trạm).

### Cấu hình

| Thành phần | Giá trị |
|---|---|
| Channel name | `workstation_queue` |
| Type | Broadcast |
| Visibility | Private (chỉ máy trạm + POS) |

### Event payload (dự kiến)

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
