# ORDER-API — API nháp, báo giá và hóa đơn POS

> **Trạng thái:** 🔨 Đang xây dựng
> **Base path:** `/api/v1`
> **Business:** [POS-ORDER-LIFECYCLE.md](../../03-BUSINESS-NghiepVu/Sales/POS-ORDER-LIFECYCLE.md)
> **Database:** [POS-TABLES.md](../../04-DATABASE/Sales/POS-TABLES.md), [INVENTORY-TABLES.md](../../04-DATABASE/Inventory/INVENTORY-TABLES.md), [PAYMENT-DEBT-TABLES.md](../../04-DATABASE/Finance/PAYMENT-DEBT-TABLES.md), [CASHBOOK-TABLES.md](../../04-DATABASE/Finance/CASHBOOK-TABLES.md)

---

## 1. Phạm vi

Tài liệu này là Source of Truth cho Backend API liên quan đến vòng đời đơn POS:

- validate/tính giỏ hàng nháp
- lưu báo giá `BG...`
- tìm và mở lại báo giá
- lưu revision báo giá khi sửa, không ghi đè snapshot cũ
- checkout tạo hóa đơn `HD...`
- sửa hóa đơn đã chốt bằng bản mới `MaCu.01`
- đọc chứng từ đã lưu
- khóa hóa đơn cũ khi mở lại để sửa ở phase sau

Trạng thái implementation hiện tại:

- Đã có foundation checkout/hóa đơn và Sales Documents readonly theo các phase đã merge.
- Phase 3A kế tiếp chỉ gồm lưu/list/detail/reopen báo giá và checkout sang hóa đơn.
- Bill Preview/in báo giá, sao chép báo giá, sửa/hủy hóa đơn đã chốt và đảo kho/tiền/công nợ là năng lực future phase. Chỉ bật khi có transaction an toàn, rule nghiệp vụ rõ và test đủ cho các bảng liên quan.

Không bao gồm:

- API quản trị sổ quỹ/đối soát độc lập
- API kiểm kho/quản trị tồn kho độc lập
- in/gửi bill hoặc render báo giá PDF/ảnh

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
| Tạo, đọc, mở lại, lưu revision báo giá | `perm.create_order` |
| Checkout tạo hóa đơn | `perm.create_order` |
| Sửa hóa đơn đã chốt | `perm.edit_order_locked` |
| Khóa/mở khóa hóa đơn cũ để sửa | `perm.edit_order_locked` |

Ghi chú MVP: `perm.create_order` và các quyền thao tác POS thường ngày phải nằm trong preset `Nhân viên nội bộ`. `perm.edit_order_locked` là guard kỹ thuật cho luồng sửa/hủy chứng từ đã chốt bằng bản mới `MaCu.01`; nếu Owner muốn kiểm soát mạnh hơn, tách ở preset hoặc yêu cầu xác nhận lại, không thêm approval nhiều bước trong MVP.

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
3. Tạo `orders` với `order_type = quote`, `status = active`, `base_code = code`, `revision_no = 0`.
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

Nếu `search` là mã báo giá exact, backend phải bỏ qua/widen date filter mặc định để không che chứng từ cũ.

### `GET /orders/{id}`

Đọc báo giá hoặc hóa đơn đã lưu.

**Permission:** `perm.create_order`

Chỉ trả chứng từ trong cùng organization.

### `GET /orders/quotes/{id}/reopen-payload`

Trả payload để Frontend mở báo giá vào POS như nháp local.

**Permission:** `perm.create_order`

Backend không tạo server draft ở endpoint này.

Response cần gồm:

- quote id/code/status
- customer snapshot và `customer_id` nếu còn hợp lệ
- price list snapshot/id nếu có
- order item snapshots
- warning nếu sản phẩm inactive/missing
- warning nếu giá hiện tại khác snapshot
- `source_quote_id` và `source_quote_code` để POS gửi lại khi checkout

Không tự resolve lại giá và không tự thay dòng theo danh mục hiện tại.

**Response data ví dụ:**

```json
{
  "quote": {
    "id": "uuid",
    "code": "BG000123",
    "status": "active",
    "source_quote_id": "uuid",
    "source_quote_code": "BG000123"
  },
  "customer": {
    "customer_id": "uuid",
    "snapshot": {
      "code": "KH000001",
      "name": "Công ty ABC",
      "phone": "0901234567"
    },
    "warnings": []
  },
  "price_list": {
    "price_list_id": "uuid",
    "snapshot": {
      "code": "BG_DAILY",
      "name": "Bảng giá đại lý"
    },
    "warnings": ["PRICE_LIST_INACTIVE"]
  },
  "items": [
    {
      "order_item_id": "uuid",
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
      "discount_amount": 0,
      "line_total": 180000,
      "note": "Cắt gấp",
      "warnings": [
        {
          "code": "CURRENT_PRICE_DIFFERS",
          "message": "Giá hiện tại khác giá đã lưu trong báo giá",
          "current_unit_price": 130000,
          "snapshot_unit_price": 120000
        }
      ]
    }
  ],
  "summary": {
    "subtotal_amount": 180000,
    "discount_amount": 0,
    "total_amount": 180000
  },
  "note": "Giao chiều nay"
}
```

Warning codes Phase 3A:

| Code | Ý nghĩa | Checkout |
|---|---|---|
| `CURRENT_PRICE_DIFFERS` | Giá hiện tại khác giá snapshot | Không chặn |
| `PRODUCT_INACTIVE` | Sản phẩm đã ngưng bán | Chặn nếu dòng chưa thay thế/xử lý |
| `PRODUCT_MISSING` | Không tìm thấy sản phẩm | Chặn nếu dòng chưa thay thế |
| `PRICE_LIST_INACTIVE` | Bảng giá không còn active | Không chặn |
| `CUSTOMER_CHANGED` | Hồ sơ khách hiện tại khác snapshot đáng kể | Không chặn |

### `POST /orders/quotes/{id}/revisions`

Lưu báo giá mới dựa trên báo giá cũ sau khi người dùng mở lại và sửa.

**Permission:** `perm.create_order`

Validation giống `POST /orders/quotes`.

Chỉ cho tạo revision từ báo giá `order_type = quote` và `status = active`.

Không cho tạo revision từ báo giá `converted` trong Phase 3A.

Workflow:

1. Validate input.
2. Tìm `base_code` và `revision_no` lớn nhất trong chuỗi báo giá.
3. Sinh mã revision mới, ví dụ `BG000123.01`.
4. Tạo `orders` mới với `order_type = quote`, `status = active`, `base_code` giữ nguyên, `revision_no` tăng.
5. Tạo `order_items` snapshot mới.
6. Chuyển báo giá cũ sang `cancelled` với `cancel_reason_type = revised` hoặc trạng thái tương đương đã chốt trong schema.
7. Ghi `order_status_history` cho cả bản cũ và bản mới.

Không ghi đè snapshot báo giá cũ.

### Không có endpoint hủy báo giá trong Phase 3A

Owner chốt: nếu khách không làm nữa thì không cần thao tác gì, để báo giá ở danh sách để tra cứu hoặc sau này dùng lại làm mẫu báo giá tương tự.

Phase 3A không tạo route hủy báo giá thủ công.

### Sao chép báo giá — future

Owner chốt hướng future: có nút `Sao chép báo giá`.

Backend future có thể cung cấp payload tương tự reopen, nhưng semantics khác:

- reopen quote để checkout giữ `source_quote_id/source_quote_code`
- copy quote để tạo báo giá mới không giữ `source_quote_id`

Khi copy và lưu:

- tạo mã `BG...` mới độc lập
- `base_code = code`, `revision_no = 0`
- không đổi trạng thái báo giá gốc
- không tạo revision `BG...01`

Không implement endpoint copy trong Phase 3A.

---

## 5. Invoice link from quote

### `POST /orders/quotes/{id}/mark-converted`

Đánh dấu báo giá đã được chuyển thành hóa đơn.

**Permission:** `perm.create_order`

Endpoint này chỉ được gọi nội bộ sau khi checkout tạo hóa đơn `HD...` thành công.

Frontend không gọi endpoint này trực tiếp trong MVP; checkout phải tự xử lý chuyển trạng thái báo giá trong cùng workflow.

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

## 6. Checkout hóa đơn

### `POST /orders/checkout`

Checkout giỏ hàng hiện tại thành hóa đơn bán hàng `HD...`.

**Permission:** `perm.create_order`

**Input:**

```json
{
  "source_quote_id": "uuid",
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
        "code": "BAT-HIFLEX-32",
        "name": "Bạt Hiflex 3.2m",
        "unit_name": "m2",
        "sell_method": "area_m2"
      },
      "sell_method": "area_m2",
      "quantity": 1,
      "width_m": 2,
      "height_m": 3,
      "unit_price": 50000,
      "discount_amount": 0,
      "price_source": "customer_group",
      "note": "Chừa biên theo mặc định"
    }
  ],
  "payment": {
    "cash_amount": 300000,
    "bank_amount": 0,
    "bank_account_id": null,
    "bank_transaction_ref": null,
    "old_debt_payment_amount": 0
  },
  "retail_debt_note": null,
  "note": "Giao chiều nay"
}
```

`source_quote_id`, `customer_id`, `price_list_id`, `bank_account_id` được phép null theo nghiệp vụ.

`payment.cash_amount` và `payment.bank_amount` là số tiền thực giữ lại để ghi quỹ, không bao gồm tiền thừa đã trả lại khách.

Nếu khách trả dư và nhân viên chọn cấn vào nợ cũ, phần cấn nợ được đưa vào `old_debt_payment_amount`. Nếu trả lại khách, phần đó không đưa vào `cash_amount`/`bank_amount`.

**Validation:**

- Có ít nhất một dòng hàng.
- Dòng hàng phải pass validation như `/pos/cart/validate`.
- Backend tự tính lại `line_subtotal_amount`, `line_total`, `subtotal_amount`, `discount_amount`, `total_amount`.
- Nếu `source_quote_id` có giá trị, báo giá phải cùng organization, `order_type = quote`, `status = active`.
- Nếu checkout từ báo giá, hóa đơn phải lưu `source_quote_id` và `source_quote_code` để Sales Documents truy vết nhanh.
- Nếu checkout từ báo giá đã `converted` hoặc không còn `active`, trả `RESOURCE_CONFLICT`.
- Nếu payload còn dòng từ báo giá có warning `PRODUCT_INACTIVE` hoặc `PRODUCT_MISSING` chưa được thay thế/xử lý, trả `QUOTE_REOPEN_BLOCKED`.
- Nếu `customer_id` null và hóa đơn còn nợ, `retail_debt_note` bắt buộc.
- `cash_amount >= 0`, `bank_amount >= 0`, `old_debt_payment_amount >= 0`.
- Nếu `bank_amount > 0`, `bank_account_id` bắt buộc, active, cùng organization và là tài khoản `bank`.
- Một lần checkout chỉ được chọn tối đa một tài khoản bank.
- Nếu `old_debt_payment_amount > 0`, `customer_id` bắt buộc.
- Cho phép tồn kho âm sau cảnh báo; Backend không chặn checkout chỉ vì thiếu tồn.

**Workflow bắt buộc trong một transaction nghiệp vụ:**

1. Xác thực actor, workstation và permission.
2. Validate giỏ hàng và tính lại tiền.
3. Sinh mã `HD...`.
4. Tạo `orders` loại `invoice`, `status = completed`.
5. Tạo `order_items` snapshot.
6. Trừ kho theo Inventory rule bằng `stock_movements`.
7. Nếu có tiền thực giữ lại, tạo `payment_receipts` và `payment_receipt_methods`.
8. Tạo `cashbook_entries` từ từng dòng phương thức thu.
9. Nếu hóa đơn mới còn nợ, tạo `customer_debt_entries` loại `invoice_debt`.
10. Nếu có trả nợ cũ, phân bổ vào hóa đơn còn nợ cũ nhất trước bằng `customer_debt_allocations` và tạo `customer_debt_entries` loại `debt_payment`.
11. Nếu sinh từ báo giá, đổi báo giá sang `converted`.
12. Ghi `order_status_history`.
13. Trả hóa đơn, payment summary, debt summary và cảnh báo tồn kho nếu có.

Nếu bất kỳ bước ghi dữ liệu chính nào lỗi, transaction phải rollback; không được tạo hóa đơn dở dang.

**Response data:**

```json
{
  "order": {
    "id": "uuid",
    "code": "HD000123",
    "order_type": "invoice",
    "status": "completed",
    "total_amount": 300000,
    "paid_amount": 300000,
    "debt_amount": 0,
    "payment_status": "paid"
  },
  "payment_receipt": {
    "id": "uuid",
    "code": "PT000001",
    "total_received_amount": 300000
  },
  "inventory_warnings": []
}
```

---

## 7. Sửa hóa đơn đã chốt

### `POST /orders/{id}/revise`

Tạo bản sửa của hóa đơn đã chốt theo mã `MaCu.01`, không sửa đè hóa đơn cũ.

**Permission:** `perm.edit_order_locked`

**Input:**

```json
{
  "customer_id": "uuid",
  "customer_snapshot": {
    "code": "KH000001",
    "name": "Công ty ABC",
    "phone": "0901234567"
  },
  "items": [
    {
      "product_id": "uuid",
      "product_snapshot": {
        "code": "BAT-HIFLEX-32",
        "name": "Bạt Hiflex 3.2m",
        "unit_name": "m2",
        "sell_method": "area_m2"
      },
      "sell_method": "area_m2",
      "quantity": 1,
      "width_m": 2,
      "height_m": 3,
      "unit_price": 50000,
      "discount_amount": 0,
      "price_source": "manual",
      "note": "Nội dung sau sửa"
    }
  ],
  "payment": {
    "cash_amount": 0,
    "bank_amount": 0,
    "bank_account_id": null,
    "old_debt_payment_amount": 0
  },
  "revision_reason": "Sửa sai kích thước",
  "note": "Nội dung sau sửa"
}
```

**Validation:**

- Hóa đơn gốc phải cùng organization, `order_type = invoice`.
- Chỉ cho sửa bản hóa đơn còn hiệu lực gần nhất trong chuỗi `base_code`.
- Hóa đơn đang bị user khác lock thì trả `RESOURCE_CONFLICT`.
- `revision_reason` bắt buộc.
- Input giỏ hàng và payment validate như checkout.

**Workflow:**

1. Lock hóa đơn gốc hoặc kiểm tra lock hiện có của actor.
2. Validate lại toàn bộ nội dung sau sửa.
3. Tạo hóa đơn mới với cùng `base_code`, `revision_no` tăng 1 và mã dạng `HD000123.01`.
4. Chuyển hóa đơn cũ sang `status = cancelled`, `cancel_reason_type = revised`, `replaced_by_order_id = hóa đơn mới`.
5. Hóa đơn mới lưu `revised_from_order_id = hóa đơn cũ`.
6. Tạo giao dịch đảo/bổ sung cho Inventory và Finance theo chênh lệch nghiệp vụ; không sửa trực tiếp ledger cũ.
7. Ghi `order_status_history` cho cả hóa đơn cũ và hóa đơn mới.
8. Unlock hóa đơn.

**Response data:**

```json
{
  "old_order": {
    "id": "uuid",
    "code": "HD000123",
    "status": "cancelled"
  },
  "new_order": {
    "id": "uuid",
    "code": "HD000123.01",
    "status": "completed",
    "revision_no": 1
  }
}
```

---

## 8. Order lock

### `POST /orders/{id}/lock`

Khóa hóa đơn cũ khi mở lại để sửa trong phase sau.

**Permission:** `perm.edit_order_locked`

Chi tiết lock hiện tại tham chiếu [ARCHITECTURE.md §3](./ARCHITECTURE.md#3-concurrency-lock--khóa-đơn-tranh-chấp).

### `POST /orders/{id}/unlock`

Giải phóng khóa hóa đơn.

**Permission:** `perm.edit_order_locked`

---

## 9. Error Handling

| HTTP | Code | Khi dùng |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Giỏ hàng sai, thiếu snapshot, giá trị không hợp lệ |
| 401 | `AUTH_REQUIRED` | Thiếu hoặc sai access token |
| 403 | `PERMISSION_DENIED` | Thiếu permission |
| 403 | `WORKSTATION_INVALID` | Workstation không hợp lệ |
| 404 | `RESOURCE_NOT_FOUND` | Không tìm thấy customer/product/order trong organization |
| 409 | `RESOURCE_CONFLICT` | Báo giá không còn active, đơn đang bị khóa hoặc mã chứng từ xung đột |
| 422 | `QUOTE_REOPEN_BLOCKED` | Payload mở lại báo giá còn dòng inactive/missing chưa xử lý khi checkout |
| 422 | `CHECKOUT_FAILED` | Checkout không thể hoàn tất do lỗi nghiệp vụ có thể giải thích |
| 500 | `INTERNAL_ERROR` | Lỗi hệ thống không công khai chi tiết |

---

## 10. Logging và metric

Backend nên log:

- tạo báo giá
- tạo revision báo giá
- chuyển báo giá thành hóa đơn
- checkout hóa đơn thành công/thất bại
- sửa hóa đơn tạo bản mới
- lock/unlock hóa đơn cũ

Metric gợi ý:

- số báo giá tạo mới
- số báo giá chuyển hóa đơn
- số hóa đơn checkout thành công
- lỗi checkout theo nhóm validation/payment/inventory
- lỗi validate giỏ hàng
- latency `/pos/cart/validate`
- latency `/orders/checkout`

---

← [Quay về POS README](./README.md)
