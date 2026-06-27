# Quy ước phát triển Backend của QC-OMS

## 1. Mục đích

Tài liệu này quy định các tiêu chuẩn kỹ thuật khi thiết kế và phát triển Backend.

Mục tiêu:

- Thống nhất cách triển khai.
- Dễ bảo trì.
- Dễ mở rộng.
- Mọi AI tạo Backend theo cùng một chuẩn.

---

# 2. Kiến trúc

Backend chỉ thực hiện nghiệp vụ đã được định nghĩa trong:

- 03-BUSINESS-NghiepVu
- 04-DATABASE

Không tự tạo Business Rule mới.

---

# 3. API Convention

- Sử dụng REST API.
- Prefix: `/api/v1/`
- Danh từ số nhiều.

Ví dụ:

```
GET    /api/v1/orders
POST   /api/v1/orders
PUT    /api/v1/orders/{id}
DELETE /api/v1/orders/{id}

```

---

# 4. Request / Response

Request

- Validate đầy đủ.
- Không tin dữ liệu từ Client.

Response

Thống nhất:

```json
{
  "success": true,
  "data": {},
  "message": "",
  "trace_id": ""
}

```

Error

```json
{
  "success": false,
  "code": "",
  "message": "",
  "trace_id": ""
}

```

---

# 5. Validation

Mọi dữ liệu đều phải validate ở Backend.

Validation phía Frontend chỉ phục vụ UX.

Backend luôn là lớp kiểm tra cuối cùng.

---

# 6. Permission

Không tin Frontend.

Mọi API đều phải kiểm tra:

- Authentication
- Authorization
- Permission

---

# 7. Workflow

Một Business Use Case

↓

Một Backend Workflow.

Không gộp nhiều nghiệp vụ vào một Workflow.

---

# 8. Transaction

Các thao tác ghi nhiều bảng phải sử dụng Transaction.

Không để dữ liệu ở trạng thái trung gian.

---

# 9. Event

Domain Event

↓

Backend xử lý.

Event Handler phải:

- Idempotent.
- Có thể chạy lại.
- Không tạo dữ liệu trùng.

---

# 10. Logging

Mọi thao tác quan trọng phải ghi Log.

Ví dụ:

- Login
- Logout
- Tạo đơn
- Sửa đơn
- Xóa đơn
- Thanh toán

---

# 11. Error Handling

Không trả lỗi hệ thống trực tiếp.

Mọi lỗi phải:

- Có Error Code.
- Có Message.
- Có Trace ID.

---

# 12. Naming

API

```
POST /orders

```

Service

```
OrderService

```

Use Case

```
CreateOrder

```

Permission

```
order.create

```

Event

```
OrderCreated

```

---

# 13. Versioning

API sử dụng version.

Ví dụ

```
/api/v1/
/api/v2/

```

Không thay đổi API cũ nếu chưa ngừng hỗ trợ.

---

# 14. Source of Truth

Backend không được tự định nghĩa:

- Business Rule
- Database Structure
- UI

Backend chỉ hiện thực hóa các tài liệu đã được phê duyệt.

---

# 15. Nguyên tắc cuối cùng

Nếu có mâu thuẫn:

DOCUMENT_[RULES.md](http://RULES.md)

↓

[ARCHITECTURE.md](http://ARCHITECTURE.md)

↓

03-BUSINESS

↓

04-DATABASE

↓

BACKEND_[CONVENTIONS.md](http://CONVENTIONS.md)

↓

05-BACKEND

Backend phải tuân theo tầng trên.

Không được tự thay đổi kiến trúc.