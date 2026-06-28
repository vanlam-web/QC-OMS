# AUTH — Phân quyền Permission-based Access Control

> **Trạng thái:** ✅ Chốt mô hình nền tảng Giai đoạn 0; bổ sung permission theo từng module
> **Nguồn:** Di chuyển từ `02-PRD-UX-PhongCanh/POS/01-POS-LAYOUT.md` (Section VI)

---

## 1. MÔ HÌNH

| Mô hình | Trạng thái |
|---|---|
| **Role cứng** (Admin / Staff / Manager cố định) | ❌ **KHÔNG dùng** |
| **Permission-based** (tick chọn tính năng cho từng tài khoản) | ✅ **Đang dùng** |

---

## 2. QUY TRÌNH TẠO VÀ CẤP QUYỀN

```
Trang Quản lý tài khoản (back-office, ngoài POS)
    ↓
Admin click [Tạo tài khoản mới] hoặc [Sửa tài khoản]
    ↓
Hiển thị form: Email / Tên hiển thị / Mật khẩu ban đầu / ...
    ↓
Bảng danh sách quyền — mỗi tính năng có 1 ô tick chọn:
    ☑ perm.view_shift_report
    ☑ perm.access_admin_panel
    ☐ perm.manage_inventory
    ☐ perm.edit_price_book
    ...
    ↓
    Lưu → Backend cập nhật quan hệ user_permissions
```

---

## 3. ĐẶC ĐIỂM KỸ THUẬT

| Đặc điểm | Mô tả |
|---|---|
| **Lưu trữ** | Quan hệ `user_permissions`; schema tại `04-DATABASE/System/AUTH-PERMISSIONS.md` |
| **Số lượng quyền/tài khoản** | Không giới hạn — 1 tài khoản có thể được tick nhiều quyền |
| **Thay đổi quyền** | Áp dụng **realtime** — tài khoản bị bỏ quyền sẽ mất truy cập trong vòng 1 chu kỳ Realtime push |
| **Mặc định khi tạo mới** | Tài khoản mặc định **không có quyền gì** — Admin phải tick thủ công |
| **Audit** | Mỗi lần đổi quyền ghi `actor_user_id`, `target_user_id`, before/after, `trace_id`, `created_at` |

> Database Source of Truth: [AUTH-PERMISSIONS.md](../../04-DATABASE/System/AUTH-PERMISSIONS.md). Không ghi dữ liệu ứng dụng trực tiếp vào `auth.users`.

---

## 4. SEED PERMISSIONS — DANH SÁCH QUYỀN KHỞI ĐIỂM

| Mã quyền | Tính năng tương ứng | Khối UI |
|---|---|---|
| `perm.view_shift_report` | Xem báo cáo ca (tiền mặt/CK) | K01 Profile |
| `perm.access_admin_panel` | Truy cập trang Quản lý (back-office) | K01 Profile |
| `perm.create_order` | Tạo đơn hàng mới | K02-A |
| `perm.edit_order_locked` | Sửa đơn đang có khóa tranh chấp | K02-A |
| `perm.apply_discount` | Áp dụng chiết khấu / đổi bảng giá | K03-A |
| `perm.refund_order` | Hoàn tiền / hủy đơn đã thanh toán | K03-D |
| `perm.manage_inventory` | CRUD kho (nhập / xuất / kiểm kê) | Module Kho |
| `perm.edit_price_book` | Sửa bảng giá sản phẩm | Back-office |
| `perm.manage_users` | Tạo / sửa / xóa tài khoản | Trang Quản lý tài khoản |

> Danh sách trên là **khởi điểm**. Khi phát triển thêm khối chức năng mới, phải bổ sung mã quyền tương ứng vào bảng seed này trước khi viết UI.

---

## 5. RÀNG BUỘC TRIỂN KHAI UI

- Khi tài khoản không có quyền tương ứng → **không render DOM** (không dùng `display:none`) cho nút/tính năng đó, để tránh lộ đường dẫn hoặc logic qua DevTools.
- Phím tắt kích hoạt tính năng không có quyền → chặn sự kiện + Toast cảnh báo `Không có quyền truy cập`.
- Kiểm tra quyền nên đặt trong **Store** (centralized) chứ không rải rác trong component UI.

Backend vẫn phải kiểm tra permission trên mọi endpoint được bảo vệ. Chi tiết API xem [FOUNDATION-API.md](../FOUNDATION-API.md).

Máy trạm được quản lý độc lập với user. Sau khi đăng nhập, user chọn máy trạm active trên thiết bị đang sử dụng; không gán cứng mã máy trạm vào tài khoản.

---

← [Quay về POS README](./README.md)
