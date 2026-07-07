# FOUNDATION API — Auth, Profile, Permission và Workstation

> **Mốc chốt:** Giai đoạn 0.
> **Base path:** `/api/v1`
> **Database:** [AUTH-PERMISSIONS.md](../04-DATABASE/System/AUTH-PERMISSIONS.md)

---

## 1. AUTHENTICATION

Đăng nhập, phục hồi session, đổi mật khẩu của chính user và đăng xuất sử dụng Supabase Auth SDK. Không tạo endpoint REST bọc lại các thao tác này trong Giai đoạn 0.

Mọi endpoint được bảo vệ nhận:

```http
Authorization: Bearer <supabase_access_token>
X-Workstation-Id: <uuid>
X-Request-Id: <client-generated-id>   # không bắt buộc
```

Quy tắc:

- `Authorization` bắt buộc, trừ health check.
- `X-Workstation-Id` bắt buộc với request nghiệp vụ sau khi user đã chọn máy trạm; `/me` và danh sách workstation cho phép thiếu trong lần khởi tạo đầu tiên.
- Backend xác thực workstation active và cùng organization với user.
- Nếu thiếu `X-Request-Id`, Backend tự sinh `trace_id`.

---

## 2. RESPONSE CHUẨN

Thành công:

```json
{
  "success": true,
  "data": {},
  "message": "",
  "trace_id": "uuid"
}
```

Lỗi:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Thông báo an toàn cho người dùng",
  "trace_id": "uuid"
}
```

Danh sách có phân trang:

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "page_size": 20,
    "total": 0
  },
  "message": "",
  "trace_id": "uuid"
}
```

---

## 3. ERROR CODE CHUNG

| HTTP | Code | Khi dùng |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Input không hợp lệ |
| 401 | `AUTH_REQUIRED` | Thiếu hoặc sai access token |
| 403 | `PERMISSION_DENIED` | Không có permission yêu cầu |
| 403 | `ACCOUNT_INACTIVE` | Profile đã bị vô hiệu hóa |
| 403 | `WORKSTATION_INVALID` | Máy trạm không tồn tại, inactive hoặc khác organization |
| 404 | `RESOURCE_NOT_FOUND` | Không tìm thấy resource trong phạm vi tenant |
| 409 | `RESOURCE_CONFLICT` | Email/code hoặc trạng thái bị trùng/xung đột |
| 429 | `RATE_LIMITED` | Vượt giới hạn request |
| 500 | `INTERNAL_ERROR` | Lỗi không công khai chi tiết |

Validation lỗi có thể trả thêm `details.fields`, nhưng không trả stack trace hoặc lỗi SQL.

---

## 4. HEALTH CHECK

### `GET /health`

**Auth:** Không yêu cầu.

**Mục đích:** Liveness của Edge Function; không kiểm tra sâu Database để tránh biến health endpoint thành nguồn tải.

**Response data:**

```json
{
  "status": "ok",
  "service": "qc-oms-api",
  "version": "git-sha"
}
```

Không trả environment variable, connection string hoặc thông tin hạ tầng.

---

## 5. HỒ SƠ HIỆN TẠI

### `GET /me`

**Auth:** Bắt buộc; không yêu cầu permission chức năng.

**Workflow:**

1. Xác thực access token.
2. Tải profile theo user ID.
3. Từ chối profile không tồn tại hoặc inactive.
4. Tải danh sách permission active.
5. Nếu có `X-Workstation-Id`, kiểm tra workstation.
6. Trả dữ liệu phiên ứng dụng.

**Response data:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "Thu ngân 1"
  },
  "organization": {
    "id": "uuid",
    "code": "VAN-LAM",
    "name": "Xưởng Văn Lâm"
  },
  "workstation": {
    "id": "uuid",
    "code": "POS-01",
    "name": "Quầy thu ngân 1"
  },
  "permissions": ["perm.create_order"]
}
```

`workstation` trả `null` nếu request khởi tạo chưa gửi header.

---

## 6. WORKSTATIONS

### `GET /workstations`

**Auth:** Bắt buộc; không yêu cầu permission chức năng.

**Output:** Danh sách workstation `active` cùng organization, sắp xếp theo `code`.

Chỉ trả `id`, `code`, `name`; không trả thông tin nội bộ không cần cho màn hình chọn máy.

### `POST /workstations`

**Permission:** `perm.manage_users` trong Giai đoạn 0.

**Input:**

```json
{
  "code": "POS-01",
  "name": "Quầy thu ngân 1"
}
```

Backend tự gán organization của actor. Code được trim, viết hoa và phải duy nhất trong organization.

### `PATCH /workstations/{id}`

**Permission:** `perm.manage_users`.

Cho phép sửa `code`, `name`, `status`. Không xóa vật lý workstation đã có lịch sử.

---

## 7. QUẢN LÝ USER

Mọi endpoint trong mục này yêu cầu `perm.manage_users`.

### `GET /users`

Query hỗ trợ:

- `search`: tìm theo display name hoặc email;
- `status`: `active` hoặc `inactive`;
- `page`, `page_size`; `page_size` tối đa 100.

Chỉ trả user trong cùng organization với actor.

### `GET /users/{id}`

Trả profile, email, trạng thái và permission của một user cùng organization.

### `POST /users`

**Input:**

```json
{
  "email": "cashier@example.com",
  "username": "cashier-01",
  "phone": "0947900909",
  "password": "temporary-secret",
  "display_name": "Thu ngân 1",
  "permissions": ["perm.create_order"]
}
```

**Validation:**

- Email hợp lệ và chưa tồn tại.
- `username` cho phép trống; nếu gửi thì trim, không rỗng, tối đa 100 ký tự.
- `phone` cho phép trống; nếu gửi thì trim, chỉ gồm ký tự điện thoại phổ biến, 8-20 ký tự.
- Password đáp ứng policy Auth của môi trường.
- `display_name` sau trim không rỗng, tối đa 100 ký tự.
- Mọi permission code tồn tại và đang active.
- Actor có `perm.manage_users` được gán mọi permission code active trong cùng organization.
- Không được vô hiệu hóa user quản trị cuối cùng hoặc xóa `perm.manage_users` khỏi user quản trị cuối cùng của organization.

**Workflow:**

1. Kiểm tra input và permission actor.
2. Tạo Supabase Auth user bằng Admin API.
3. Tạo profile cùng organization actor.
4. Gán permissions.
5. Ghi permission audit log.
6. Nếu bước Database thất bại, cleanup Auth user vừa tạo hoặc ghi trạng thái retry có kiểm soát.

Không log hoặc trả lại password.

### `PATCH /users/{id}`

**Input:**

```json
{
  "display_name": "Thu ngân ca sáng",
  "status": "active"
}
```

Không dùng endpoint này để thay permission hoặc password.

Khi chuyển sang `inactive`, Backend phải làm mất hiệu lực truy cập ứng dụng sớm nhất có thể; mọi request tiếp theo bị `/me` và permission middleware từ chối.

### `PUT /users/{id}/permissions`

Thay thế toàn bộ permission hiện tại bằng danh sách mới.

**Input:**

```json
{
  "permissions": [
    "perm.create_order",
    "perm.apply_discount"
  ]
}
```

**Workflow transaction:**

1. Lock tập permission của target user.
2. Validate target cùng organization.
3. Validate toàn bộ code và quyền được phép gán.
4. Tính before/after.
5. Thay thế `user_permissions`.
6. Ghi một `permission_audit_logs` với action `replace`.
7. Commit và để Realtime phát tín hiệu cho target user.

Request gửi lại cùng danh sách phải cho kết quả giống nhau và không làm thay đổi quyền ngoài ý muốn.

---

## 8. PERMISSION CATALOG

### `GET /permissions`

**Permission:** `perm.manage_users`.

Trả danh mục permission active, nhóm theo module để dựng bảng tick quyền. Danh mục là read-only trên UI.

---

## 9. RATE LIMIT VÀ AUDIT

- Endpoint tạo/sửa user và permission phải có rate limit thấp hơn endpoint đọc.
- Mọi thay đổi user, workstation và permission ghi log với actor, target/resource, trace ID và thời gian.
- Không log password, access token hoặc refresh token.

---

## 10. ACCEPTANCE TEST GIAI ĐOẠN 0

1. User active đăng nhập và gọi `/me` thành công.
2. User inactive bị từ chối dù access token còn hạn.
3. User không có `perm.manage_users` không gọi được API quản trị.
4. Admin không đọc/sửa user thuộc organization khác.
5. Thay permission tạo đúng audit log và target user nhận tín hiệu refetch.
6. Workstation sai organization bị từ chối.
7. Không thể vô hiệu hóa hoặc tước quyền user quản trị cuối cùng.
8. Response lỗi luôn có `code` và `trace_id`, không lộ chi tiết hệ thống.
