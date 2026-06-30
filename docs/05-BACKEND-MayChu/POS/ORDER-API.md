# ORDER-API — API nháp, báo giá và hóa đơn POS

> **Trạng thái:** 🔨 Đang xây dựng
> **Base path:** `/api/v1`
> **Business:** [POS-ORDER-LIFECYCLE.md](../../03-BUSINESS-NghiepVu/Sales/POS-ORDER-LIFECYCLE.md)
> **Database:** [POS-TABLES.md](../../04-DATABASE/Sales/POS-TABLES.md)

---

## 1. Phạm vi

Tài liệu này là Source of Truth cho Backend API liên quan đến vòng đời đơn POS:

- validate/tính giỏ hàng nháp
- lưu báo giá `BG...`
- tìm và mở lại báo giá
- cập nhật báo giá
- đọc chứng từ đã lưu
- khóa hóa đơn cũ khi mở lại để sửa ở phase sau

Không bao gồm:

- checkout/thanh toán
- ghi sổ quỹ, công nợ, tồn kho
- payment allocation
- in/gửi bill

Nháp POS Phase 2 vẫn lưu local theo máy tại `POS/ARCHITECTURE.md`. Backend không tạo bản ghi `orders` cho nháp cho đến khi nhân viên lưu báo giá hoặc checkout thành công.

---

## 2. Auth, response và permission

Mọi endpoint yêu cầu:

```http
Authorization: Bearer <supabase_access_token>
X-Workstation-Id: <uuid>
X-Request-Id: <client-generated-id>   # không bắt buộc
```

Áp dụng response chuẩn tại [FOUNDATION-API.md](../FOUNDATION-API.md#2-response-chuẩn).

| Nhóm API | Permission |
|---|---|
| Validate/tính giỏ nháp | `perm.create_order` |
| Tạo, đọc, cập nhật báo giá | `perm.create_order` |
| Khóa/mở khóa hóa đơn cũ để sửa | `perm.edit_order_locked` |

---

## 3. Cart validation

### `POST /pos/cart/validate`

Validate và tính lại giỏ hàng nháp từ dữ liệu POS gửi lên.

**Permission:** `perm.create_order`

**Input:**

```json
{
  "customer_id": "uuid",
  "items": [
    {
      "client_line_id": "local-line-1",
      "product_id": "uuid",
      "sell_method": "linear_m",
      "quantity": 1,
      "width_m": null,
      "height_m": null,
      "linear_m": 1.5,
      "unit_price": 120000,
      "price_source": "customer_group",
      "note": "Cắt gấp"
    }
  ],
  "note": "Giao chiều nay"
}
```

`customer_id` được phép null.

**Validation:**

- Mọi `product_id` phải tồn tại, active và cùng organization.
- `quantity > 0`.
- `unit_price >= 0`.
- `sell_method` phải khớp sản phẩm hoặc là cách bán hợp lệ được Backend cho phép.
- Với `area_m2`, `width_m` và `height_m` bắt buộc lớn hơn 0.
- Với `linear_m`, `linear_m` bắt buộc lớn hơn 0.
- `price_source = manual` được phép khi người dùng sửa giá.

**Workflow:**

1. Xác thực actor, workstation và permission.
2. Tải sản phẩm active trong organization.
3. Validate từng dòng.
4. Tính lại `line_total` theo Business Rule tính giỏ hàng.
5. Trả giỏ hàng đã chuẩn hóa cho Frontend.

**Response data:**

```json
{
  "items": [
    {
      "client_line_id": "local-line-1",
      "product_id": "uuid",
      "quantity": 1,
      "unit_price": 120000,
      "line_total": 180000,
      "price_source": "customer_group"
    }
  ],
  "subtotal_amount": 180000,
  "total_amount": 180000
}
```

---

## 4. Quotes

### `POST /orders/quotes`

Lưu hóa đơn nháp hiện tại thành báo giá.

**Permission:** `perm.create_order`

**Input:**

```json
{
  "customer_id": "uuid",
  "customer_snapshot": {
    "code": "KH000001",
    "name": "Công ty ABC",
    "phone": "0901234567"
  },
  "price_list_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "product_snapshot": {
        "code": "MICA-3MM",
        "name": "Mica 3mm",
        "unit_name": "m",
        "sell_method": "linear_m"
      },
      "sell_method": "linear_m",
      "quantity": 1,
      "linear_m": 1.5,
      "unit_price": 120000,
      "price_source": "customer_group",
      "line_total": 180000,
      "note": "Cắt gấp"
    }
  ],
  "note": "Giao chiều nay"
}
```

**Validation:**

- Nếu có `customer_id`, khách phải cùng organization.
- `customer_snapshot` bắt buộc, kể cả khách lẻ.
- Có ít nhất một dòng hàng.
- Dòng hàng phải pass cùng validation với `/pos/cart/validate`.
- `subtotal_amount` và `total_amount` do Backend tính lại, không tin tổng tiền client gửi lên.

**Workflow:**

1. Validate giỏ hàng.
2. Sinh mã `BG...` tăng dần trong organization.
3. Tạo `orders` với `order_type = quote`, `status = active`.
4. Tạo `order_items` theo snapshot đã validate.
5. Ghi `order_status_history` từ null sang `active`.
6. Trả báo giá vừa tạo.

**Response data:**

```json
{
  "id": "uuid",
  "code": "BG000001",
  "order_type": "quote",
  "status": "active",
  "total_amount": 180000
}
```

### `GET /orders/quotes`

Tìm báo giá.

**Permission:** `perm.create_order`

**Query:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `search` | `string` | Không | Tìm theo mã báo giá, tên/mã khách trong snapshot |
| `status` | `string` | Không | `active`, `converted`, `cancelled`, mặc định `active` |
| `page` | `number` | Không | Mặc định `1` |
| `page_size` | `number` | Không | Mặc định `20`, tối đa `100` |

### `GET /orders/{id}`

Đọc báo giá hoặc hóa đơn đã lưu.

**Permission:** `perm.create_order`

Chỉ trả chứng từ trong cùng organization.

### `PUT /orders/quotes/{id}`

Cập nhật báo giá active.

**Permission:** `perm.create_order`

Validation giống `POST /orders/quotes`.

Chỉ cho cập nhật báo giá `order_type = quote` và `status = active`.

Workflow cập nhật:

1. Validate input.
2. Cập nhật snapshot tổng ở `orders`.
3. Thay thế toàn bộ `order_items` của báo giá bằng danh sách mới.
4. Không đổi mã `BG...`.

### `POST /orders/quotes/{id}/cancel`

Hủy báo giá.

**Permission:** `perm.create_order`

Chỉ cho hủy báo giá `status = active`.

Hủy báo giá không xóa dữ liệu, chỉ đổi `status = cancelled` và ghi `order_status_history`.

---

## 5. Invoice link from quote

### `POST /orders/quotes/{id}/mark-converted`

Đánh dấu báo giá đã được chuyển thành hóa đơn.

**Permission:** `perm.create_order`

Endpoint này chỉ được gọi sau khi checkout tạo hóa đơn `HD...` thành công.

**Input:**

```json
{
  "invoice_order_id": "uuid"
}
```

**Validation:**

- Báo giá phải cùng organization, `order_type = quote`, `status = active`.
- Hóa đơn phải cùng organization, `order_type = invoice`.
- Hóa đơn phải có `source_quote_id` trỏ về báo giá này.

**Workflow:**

1. Kiểm tra báo giá và hóa đơn.
2. Đổi báo giá sang `status = converted`.
3. Ghi `order_status_history`.

---

## 6. Order lock

### `POST /orders/{id}/lock`

Khóa hóa đơn cũ khi mở lại để sửa trong phase sau.

**Permission:** `perm.edit_order_locked`

Chi tiết lock hiện tại tham chiếu [ARCHITECTURE.md §3](./ARCHITECTURE.md#3-concurrency-lock--khóa-đơn-tranh-chấp).

### `POST /orders/{id}/unlock`

Giải phóng khóa hóa đơn.

**Permission:** `perm.edit_order_locked`

---

## 7. Error Handling

| HTTP | Code | Khi dùng |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Giỏ hàng sai, thiếu snapshot, giá trị không hợp lệ |
| 401 | `AUTH_REQUIRED` | Thiếu hoặc sai access token |
| 403 | `PERMISSION_DENIED` | Thiếu permission |
| 403 | `WORKSTATION_INVALID` | Workstation không hợp lệ |
| 404 | `RESOURCE_NOT_FOUND` | Không tìm thấy customer/product/order trong organization |
| 409 | `RESOURCE_CONFLICT` | Báo giá không còn active, đơn đang bị khóa hoặc mã chứng từ xung đột |
| 500 | `INTERNAL_ERROR` | Lỗi hệ thống không công khai chi tiết |

---

## 8. Logging và metric

Backend nên log:

- tạo báo giá
- cập nhật báo giá
- hủy báo giá
- chuyển báo giá thành hóa đơn
- lock/unlock hóa đơn cũ

Metric gợi ý:

- số báo giá tạo mới
- số báo giá chuyển hóa đơn
- lỗi validate giỏ hàng
- latency `/pos/cart/validate`

---

← [Quay về POS README](./README.md)
