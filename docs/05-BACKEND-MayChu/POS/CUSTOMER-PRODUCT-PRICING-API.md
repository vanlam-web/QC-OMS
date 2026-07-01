# CUSTOMER-PRODUCT-PRICING-API — API Customer, Product và Pricing POS

> **Trạng thái:** 🔨 Đang xây dựng
> **Base path:** `/api/v1`
> **Business:** [POS-CUSTOMER.md](../../03-BUSINESS-NghiepVu/Sales/POS-CUSTOMER.md), [POS-PRICING.md](../../03-BUSINESS-NghiepVu/Sales/POS-PRICING.md)
> **Database:** [POS-TABLES.md](../../04-DATABASE/Sales/POS-TABLES.md)

---

## 1. Phạm vi

Tài liệu này là Source of Truth cho API Customer, Product và Pricing phục vụ POS Phase 1.

Bao gồm:

- tìm, tạo và cập nhật khách hàng
- đọc nhóm khách
- tìm sản phẩm đang bán trên POS
- lấy giá theo khách/nhóm khách/bảng giá chung
- đọc lịch sử giá gần đây theo khách hàng + sản phẩm
- quản lý danh mục sản phẩm và bảng giá tối thiểu cho Phase 1

Không bao gồm:

- tạo đơn hàng, báo giá, hóa đơn hoặc checkout
- ghi lịch sử giá từ chứng từ bán hàng
- tồn kho, BOM, cuộn/tấm/lot vật tư
- kết nối máy sản xuất hoặc Realtime queue

---

## 2. Auth và response chuẩn

Mọi endpoint trong file này yêu cầu:

```http
Authorization: Bearer <supabase_access_token>
X-Workstation-Id: <uuid>
X-Request-Id: <client-generated-id>   # không bắt buộc
```

Áp dụng response chuẩn tại [FOUNDATION-API.md](../FOUNDATION-API.md#2-response-chuẩn).

Tất cả dữ liệu đọc/ghi phải được giới hạn trong organization của actor.

---

## 3. Permission

| Nhóm API | Permission |
|---|---|
| Tìm khách, tạo nhanh khách, sửa thông tin khách phục vụ POS | `perm.create_order` |
| Tìm sản phẩm đang bán, lấy giá mặc định, đọc lịch sử giá gần đây | `perm.create_order` |
| Quản lý sản phẩm, nhóm khách, bảng giá và chi tiết bảng giá | `perm.edit_price_book` |

Backend phải kiểm tra permission ở mọi endpoint, không phụ thuộc việc Frontend ẩn nút.

---

## 4. Customers

### `GET /customers`

Tìm khách hàng trong organization hiện tại.

**Permission:** `perm.create_order`

**Query:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `search` | `string` | Không | Tìm theo mã khách, tên khách hoặc SĐT |
| `page` | `number` | Không | Mặc định `1` |
| `page_size` | `number` | Không | Mặc định `20`, tối đa `100` |

**Validation:**

- `page >= 1`
- `1 <= page_size <= 100`
- `search` được trim; chuỗi rỗng sau trim tương đương không truyền search

**Response data:**

```json
{
  "items": [
    {
      "id": "uuid",
      "code": "KH000001",
      "name": "Công ty ABC",
      "phone": "0901234567",
      "customer_group": {
        "id": "uuid",
        "code": "DAILY",
        "name": "Đại lý"
      }
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

### `POST /customers`

Tạo khách hàng từ POS.

**Permission:** `perm.create_order`

**Input:**

```json
{
  "code": "KH000123",
  "name": "Công ty ABC",
  "phone": "0901234567",
  "customer_group_id": "uuid"
}
```

`code`, `phone`, `customer_group_id` được phép bỏ trống.

**Validation:**

- `name` bắt buộc, trim xong không rỗng.
- Nếu có `code`, trim xong không rỗng và không trùng trong organization.
- Nếu thiếu `code`, Backend tự sinh mã dạng `KH000001`, tăng dần trong organization.
- Nếu có `phone`, Backend chuẩn hóa thành `phone_normalized` và không cho trùng trong organization.
- Nếu có `customer_group_id`, nhóm khách phải tồn tại, active và cùng organization.

**Workflow:**

1. Xác thực actor, workstation và permission.
2. Trim input.
3. Chuẩn hóa SĐT nếu có.
4. Tự sinh mã khách nếu thiếu `code`.
5. Kiểm tra trùng mã khách và SĐT.
6. Ghi `public.customers`.
7. Trả khách hàng vừa tạo.

**Response data:**

```json
{
  "id": "uuid",
  "code": "KH000123",
  "name": "Công ty ABC",
  "phone": "0901234567",
  "customer_group_id": "uuid"
}
```

### `PATCH /customers/{id}`

Cập nhật thông tin khách hàng phục vụ POS.

**Permission:** `perm.create_order`

**Input:**

```json
{
  "code": "KH000123",
  "name": "Công ty ABC",
  "phone": "0901234567",
  "customer_group_id": "uuid"
}
```

**Validation:**

- Khách hàng phải tồn tại trong organization.
- Nếu sửa `name`, trim xong không rỗng.
- Nếu sửa `code`, không được trùng trong organization.
- Nếu sửa `phone`, SĐT chuẩn hóa không được trùng với khách khác trong organization.
- `customer_group_id = null` nghĩa là khách không gán nhóm và dùng bảng giá chung.
- Nếu `customer_group_id` khác null, nhóm khách phải active và cùng organization.

---

## 5. Customer groups

### `GET /customer-groups`

Lấy danh sách nhóm khách active để gán cho khách hàng.

**Permission:** `perm.create_order`

**Response data:**

```json
{
  "items": [
    {
      "id": "uuid",
      "code": "DAILY",
      "name": "Đại lý",
      "price_list_id": "uuid"
    }
  ]
}
```

### `POST /customer-groups`

Tạo nhóm khách.

**Permission:** `perm.edit_price_book`

**Input:**

```json
{
  "code": "DAILY",
  "name": "Đại lý",
  "price_list_id": "uuid"
}
```

**Validation:**

- `code` và `name` trim xong không rỗng.
- `code` không trùng trong organization.
- `price_list_id` phải tồn tại, active và cùng organization.

### `PATCH /customer-groups/{id}`

Cập nhật nhóm khách.

**Permission:** `perm.edit_price_book`

Cho phép sửa `code`, `name`, `price_list_id`, `is_active`.

Nếu chuyển `is_active = false`, khách hàng đang thuộc nhóm này vẫn giữ liên kết hiện tại; nhóm inactive chỉ không được gán mới.

---

## 6. Products

### `GET /products`

Tìm sản phẩm/dịch vụ đang bán trên POS.

**Permission:** `perm.create_order` hoặc `perm.edit_price_book`

**Query:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `search` | `string` | Không | Tìm theo mã hoặc tên sản phẩm |
| `status` | `string` | Không | POS mặc định chỉ dùng `active`; chỉ endpoint quản lý được dùng `inactive` hoặc `all` |
| `page` | `number` | Không | Mặc định `1` |
| `page_size` | `number` | Không | Mặc định `20`, tối đa `100` |

**Validation và rule:**

- Nếu actor chỉ có `perm.create_order`, Backend luôn ép `status = active`.
- Nếu actor có `perm.edit_price_book`, `status` được phép là `active`, `inactive` hoặc `all`.
- `search` trim xong rỗng thì bỏ qua.
- Tìm kiếm hỗ trợ không dấu theo chiến lược kỹ thuật được chốt khi triển khai search.
- Không hỗ trợ QR/barcode trong Phase 1.

**Response data:**

```json
{
  "items": [
    {
      "id": "uuid",
      "code": "MICA-3MM",
      "name": "Mica 3mm",
      "status": "active",
      "unit_name": "m",
      "sell_method": "linear_m"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

### `POST /products`

Tạo sản phẩm/dịch vụ.

**Permission:** `perm.edit_price_book`

**Input:**

```json
{
  "code": "MICA-3MM",
  "name": "Mica 3mm",
  "status": "active",
  "unit_name": "m",
  "sell_method": "linear_m",
  "latest_purchase_cost": 120000
}
```

**Validation:**

- `code`, `name`, `unit_name` trim xong không rỗng.
- `code` không trùng trong organization.
- `status` thuộc `active | inactive`.
- `sell_method` thuộc `quantity | area_m2 | linear_m | sheet | combo`.
- `latest_purchase_cost` được phép null/bỏ trống; nếu có thì phải `>= 0`.
- Trước Purchase receipt hoàn chỉnh, `latest_purchase_cost` là field admin-controlled để PriceBook formula chạy được; không phải giá vốn kế toán.

### `PATCH /products/{id}`

Cập nhật sản phẩm/dịch vụ.

**Permission:** `perm.edit_price_book`

Cho phép sửa `code`, `name`, `status`, `unit_name`, `sell_method`, `latest_purchase_cost`.

Nếu cập nhật `latest_purchase_cost`, backend lưu `latest_purchase_cost_at` và audit metadata tối thiểu actor/thời gian.

Không xóa vật lý sản phẩm đã có lịch sử; ngưng bán dùng `status = inactive`.

---

## 7. Price lists

### `GET /price-lists`

Lấy danh sách bảng giá.

**Permission:** `perm.edit_price_book`

**Query:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `active_only` | `boolean` | Không | Mặc định `true` |

**Response data:**

```json
{
  "items": [
    {
      "id": "uuid",
      "code": "DEFAULT",
      "name": "Bảng giá chung",
      "is_default": true,
      "is_active": true
    }
  ]
}
```

### `POST /price-lists`

Tạo bảng giá.

**Permission:** `perm.edit_price_book`

**Input:**

```json
{
  "code": "DAILY",
  "name": "Bảng giá đại lý"
}
```

**Validation:**

- `code`, `name` trim xong không rỗng.
- `code` không trùng trong organization.
- Tạo bảng giá mới không có phạm vi áp dụng hoặc thời gian hiệu lực.
- Không bắt buộc nhập công thức khi tạo bảng giá.
- Chỉ seed/import mới tạo bảng giá chung mặc định; UI tạo bảng giá thường không cần truyền `is_default`.

### `PATCH /price-lists/{id}`

Cập nhật bảng giá.

**Permission:** `perm.edit_price_book`

Cho phép sửa `code`, `name`, `is_default`, `is_active`.

Không cho inactive bảng giá đang là bảng giá chung duy nhất của organization.

### `PUT /price-lists/{id}/items/{product_id}`

Tạo hoặc cập nhật giá tay của một sản phẩm trong bảng giá.

**Permission:** `perm.edit_price_book`

**Input:**

```json
{
  "unit_price": 120000
}
```

**Validation:**

- Bảng giá và sản phẩm phải cùng organization.
- `unit_price >= 0`.
- Với sản phẩm `sell_method = linear_m`, `unit_price` là giá cho `1 m tới`.
- Nếu dòng giá trước đó đang theo công thức, thao tác nhập giá tay phải đổi dòng về `pricing_mode = manual` và bỏ liên kết công thức.

### `POST /price-lists/formulas/preview`

Xem trước việc gắn công thức cho một bộ lọc sản phẩm.

**Permission:** `perm.edit_price_book`

**Input:**

```json
{
  "name": "Fomex 5mm",
  "product_filter": {
    "name_contains": "5mm",
    "code_contains": "F5",
    "sell_method": "sheet",
    "status": "active"
  },
  "cost_formula": {
    "type": "amount_plus_percent",
    "amount": 5000,
    "percent_of_latest_purchase_cost": 8
  },
  "profit_formula": {
    "type": "tiers",
    "tiers": [
      { "operator": "<=", "value": 100000, "amount": 25000 },
      { "from_exclusive": 100000, "to_inclusive": 200000, "amount": 40000 },
      { "operator": ">", "value": 200000, "amount": 60000 }
    ]
  },
  "price_list_adjustments": [
    { "price_list_id": "uuid-default", "amount": 20000 },
    { "price_list_id": "uuid-30", "amount": -5000 }
  ]
}
```

**Response data:**

```json
{
  "items": [
    {
      "product_id": "uuid",
      "product_code": "F5",
      "product_name": "Fomex 5mm",
      "latest_purchase_cost": 100000,
      "current_mode": "manual",
      "current_unit_price": 150000,
      "computed_prices": [
        {
          "price_list_id": "uuid-default",
          "price_list_name": "Bảng giá chung",
          "computed_unit_price": 158000,
          "delta": 8000
        }
      ]
    }
  ]
}
```

**Rules:**

- Không ghi dữ liệu khi preview.
- Slice đầu chỉ hỗ trợ filter hiện có: `name_contains`, `code_contains`, `sell_method`, `status = active`.
- `group_id`/nhóm hàng chưa thuộc PriceBook formula MVP vì chưa có schema `product_groups`.
- `latest_purchase_cost` null thì tính như `0`, không warning/block.
- Giá cuối làm tròn lên `1,000đ` ở backend.
- Backend validate tiers lợi nhuận: chặn overlap rõ ràng; gap được phép, không match tier thì lợi nhuận `0`.

### `POST /price-lists/formulas/apply`

Lưu formula rule và gắn các dòng giá được chọn sang chế độ `formula`.

**Permission:** `perm.edit_price_book`

**Input:** giống preview, thêm danh sách sản phẩm/bảng giá được chọn nếu UI cho bỏ bớt dòng.

```json
{
  "formula": { "...": "same as preview" },
  "selected_items": [
    { "product_id": "uuid", "price_list_id": "uuid-default" },
    { "product_id": "uuid", "price_list_id": "uuid-30" }
  ]
}
```

**Rules:**

- Lưu structured formula rule, không lưu công thức text tự do.
- Các dòng được chọn chuyển sang `pricing_mode = formula` và nhớ `formula_rule_id`.
- Nếu sau này người dùng nhập giá tay vào dòng đó, dòng chuyển về `pricing_mode = manual`.
- Ghi audit tối thiểu: actor, thời gian, filter, số dòng/bảng giá bị ảnh hưởng.
- Không tự tạo bảng giá thiếu. Grid/API chỉ dùng các `price_lists` đang tồn tại.

### `DELETE /price-lists/{id}/items/{product_id}`

Xóa giá riêng của một sản phẩm khỏi bảng giá.

**Permission:** `perm.edit_price_book`

Sau khi xóa, nếu bảng giá nhóm không còn giá cho sản phẩm, luồng POS fallback về bảng giá chung.

---

## 8. Price resolution

### `POST /pricing/resolve`

Lấy giá mặc định cho một hoặc nhiều sản phẩm theo khách hàng hiện tại.

**Permission:** `perm.create_order`

**Input:**

```json
{
  "customer_id": "uuid",
  "product_ids": ["uuid"]
}
```

`customer_id` được phép null hoặc bỏ trống.

**Workflow:**

1. Xác thực actor, workstation và permission.
2. Kiểm tra mọi sản phẩm tồn tại, active và cùng organization.
3. Nếu có `customer_id`, tải khách hàng cùng organization.
4. Nếu khách có nhóm active, lấy bảng giá của nhóm; nếu không, dùng bảng giá chung.
5. Với mỗi sản phẩm, tìm giá trong bảng giá đã chọn.
6. Nếu không có giá trong bảng giá đã chọn, fallback về bảng giá chung.
7. Nếu bảng giá đã chọn là bảng giá nhóm và dòng giá có `unit_price = 0`, lấy `giá nhập gần nhất` của sản phẩm làm giá mặc định.
8. Nếu chưa có `giá nhập gần nhất`, trả giá `0` và không tạo cảnh báo.
9. Trả giá và nguồn giá.

**Response data:**

```json
{
  "items": [
    {
      "product_id": "uuid",
      "unit_price": 120000,
      "price_source": "customer_group",
      "price_list_id": "uuid"
    }
  ]
}
```

`price_source` có thể là:

| Giá trị | Ý nghĩa |
|---|---|
| `customer_group` | Giá cụ thể trong bảng giá nhóm |
| `default_price_list` | Fallback hoặc dùng bảng giá chung |
| `latest_purchase_cost` | Bảng giá nhóm để `0`, hệ thống lấy giá nhập gần nhất |
| `latest_purchase_cost_missing_zero` | Bảng giá nhóm để `0`, nhưng sản phẩm chưa có giá nhập gần nhất nên dùng `0` |
| `price_formula` | Dòng bảng giá đang theo công thức và được tính từ `latest_purchase_cost` |
| `price_formula_missing_cost_zero` | Dòng theo công thức nhưng chưa có `latest_purchase_cost`, nên tính từ `0` |

Không trả warning khi `latest_purchase_cost_missing_zero`; Owner chốt giữ thao tác đơn giản, nhân viên có thể sửa giá tay nếu cần.

---

## 9. Recent customer prices

### `GET /customers/{customer_id}/products/{product_id}/recent-prices`

Đọc tối đa 5 giá sửa tay gần nhất cho cặp khách hàng + sản phẩm.

**Permission:** `perm.create_order`

**Validation:**

- Khách hàng và sản phẩm phải tồn tại trong cùng organization.

**Response data:**

```json
{
  "items": [
    {
      "unit_price": 115000,
      "sold_at": "2026-06-30T08:00:00Z"
    }
  ]
}
```

API này chỉ đọc lịch sử. Việc ghi lịch sử giá phát sinh từ order/checkout khi chứng từ bán hàng được lưu thành công.

---

## 10. Error Handling

| HTTP | Code | Khi dùng |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Input sai định dạng, thiếu trường bắt buộc hoặc giá trị ngoài enum |
| 401 | `AUTH_REQUIRED` | Thiếu hoặc sai access token |
| 403 | `PERMISSION_DENIED` | Thiếu permission yêu cầu |
| 403 | `WORKSTATION_INVALID` | Workstation không hợp lệ |
| 404 | `RESOURCE_NOT_FOUND` | Không tìm thấy customer/product/price list trong organization |
| 409 | `RESOURCE_CONFLICT` | Trùng mã khách, SĐT, mã sản phẩm, mã nhóm hoặc mã bảng giá |
| 500 | `INTERNAL_ERROR` | Lỗi hệ thống không công khai chi tiết |

Validation lỗi có thể trả thêm:

```json
{
  "fields": {
    "phone": "PHONE_ALREADY_EXISTS",
    "code": "CODE_ALREADY_EXISTS"
  }
}
```

---

## 11. Logging và metric

Backend nên log các thao tác ghi quan trọng:

- tạo/sửa khách hàng
- tạo/sửa nhóm khách
- tạo/sửa sản phẩm
- tạo/sửa bảng giá
- tạo/sửa/xóa chi tiết bảng giá

Log không ghi token, secret hoặc dữ liệu nhạy cảm không cần thiết.

Metric gợi ý:

- số request tìm sản phẩm
- số request resolve giá
- số lỗi conflict khi tạo khách hoặc tạo sản phẩm
- latency của `/pricing/resolve`

---

← [Quay về POS README](./README.md)
