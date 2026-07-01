# 01-USERS-PERMISSIONS — Quản lý tài khoản và quyền

> **Trạng thái:** 🔨 Đang xây dựng  
> **Nguồn kỹ thuật:** `05-BACKEND-MayChu/POS/AUTH.md`, `05-BACKEND-MayChu/FOUNDATION-API.md`

---

## 1. Mục tiêu

Trang này giúp chủ xưởng/quản trị tạo tài khoản nhân viên và cấp quyền đúng phần việc.

QC-OMS dùng permission-based access control:

- không dùng role cứng làm nguồn authorization
- mỗi tài khoản được tick các quyền cụ thể
- backend vẫn kiểm tra quyền trên mọi API

Ghi chú từ KiotViet audit ngày `2026-07-01`:

- KiotViet có `Danh sách nhân viên` với 5 nhân viên thật trong tài khoản đang rà.
- Các cột chính gồm mã nhân viên, mã chấm công, tên nhân viên, SĐT, CMND/CCCD, nợ và tạm ứng, ghi chú.
- Có bộ lọc trạng thái đang làm việc/đã nghỉ, phòng ban, chức danh.
- KiotViet còn có `Bảng chấm công`, `Bảng lương`, `Bảng hoa hồng` và `Thiết lập nhân viên`.
- `Bảng chấm công` có ca làm, lịch tuần, trạng thái đúng giờ/đi muộn/chấm công thiếu/nghỉ làm.
- `Bảng lương` có 23 bảng lương nhưng tổng lương/đã trả/còn cần trả đang là `0`, chủ yếu trạng thái tạm tính.
- `Bảng hoa hồng` có cấu hình theo hàng hóa/nhân viên áp dụng nhưng không có kết quả phù hợp trong lượt rà.
- `Thiết lập nhân viên` gồm khởi tạo, chấm công, tính lương, ngày làm/nghỉ, Zalo mini app và máy chấm công.
- QC-OMS chỉ lấy phần cần cho đăng nhập, quyền và ghi nhận người thao tác. Không copy các trường HR/kế toán nhân sự như mã chấm công, CMND/CCCD, nợ/tạm ứng, phòng ban/chức danh nếu chưa có nghiệp vụ rõ.

---

## 2. Bố cục

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Tài khoản & quyền                                      [+ Tài khoản]         │
├──────────────────────┬───────────────────────────────────────────────────────┤
│ Bộ lọc               │ Email | Tên hiển thị | Trạng thái | Quyền chính       │
│ - Trạng thái         │ ...                                                   │
│ - Quyền              │                                                       │
└──────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 3. Danh sách tài khoản

### Bộ lọc

| Bộ lọc | Quy tắc |
|---|---|
| Tìm kiếm | Email hoặc tên hiển thị |
| Trạng thái | Active, inactive, tất cả |
| Quyền | Lọc tài khoản có một quyền cụ thể |

### Cột bảng

| Cột | Mô tả |
|---|---|
| Email | Email đăng nhập |
| Tên hiển thị | Tên hiện trên POS/báo cáo |
| Trạng thái | Active hoặc inactive |
| Quyền chính | Tóm tắt nhóm quyền được tick |
| Cập nhật gần nhất | Nếu có |
| Thao tác | Mở chi tiết |

Không hiển thị mật khẩu hoặc token.

---

## 4. Tạo tài khoản

Form tạo mới:

- email
- tên hiển thị
- mật khẩu tạm
- danh sách quyền tick chọn

Quy tắc:

- Tài khoản mới mặc định không có quyền nếu chưa tick.
- Email phải hợp lệ và chưa tồn tại.
- Mật khẩu tạm không hiển thị lại sau khi lưu.
- Sau khi tạo, admin gửi mật khẩu tạm cho nhân viên bằng kênh nội bộ; QC-OMS không tự gửi email trong MVP/current scope.

---

## 5. Chi tiết tài khoản

Chi tiết gồm các tab:

- Thông tin
- Quyền
- Lịch sử đổi quyền

### Tab Thông tin

- email chỉ đọc
- tên hiển thị
- trạng thái active/inactive

Không xóa vật lý tài khoản đã có lịch sử. Khi nhân viên nghỉ hoặc không dùng nữa, chuyển inactive.

### Tab Quyền

Hiển thị permission theo nhóm:

| Nhóm | Ví dụ quyền |
|---|---|
| POS | tạo hóa đơn, sửa hóa đơn đã chốt, áp bảng giá/chiết khấu |
| Hàng hóa/Kho | quản lý hàng hóa, kiểm kho, điều chỉnh vật tư |
| Tài chính | sổ quỹ, thu nợ, phiếu thu/chi, đối soát |
| Bảng giá | sửa bảng giá |
| Báo cáo | xem báo cáo |
| Hệ thống | quản lý tài khoản và máy trạm |

UI có thể có preset gợi ý như `Thu ngân`, `Kho`, `Quản lý`, nhưng preset chỉ là thao tác tick nhanh. Nguồn quyền cuối cùng vẫn là danh sách permission cụ thể.

### Tab Lịch sử đổi quyền

Mỗi dòng hiển thị:

- thời gian
- người thay đổi
- quyền trước
- quyền sau
- hành động: grant, revoke, replace

Không cho sửa/xóa lịch sử.

---

## 6. Máy trạm

Máy trạm/quầy POS quản lý riêng với tài khoản:

- mã máy trạm
- tên máy trạm
- trạng thái active/inactive
- lần hoạt động gần nhất nếu có

Một nhân viên có thể đăng nhập ở máy khác nếu có quyền. Máy trạm không gắn cứng vào user.

---

## 7. Quy Tắc Bảo Mật UX

- Nút/tính năng không có quyền thì không render DOM.
- Phím tắt không có quyền phải bị chặn và hiện toast `Không có quyền truy cập`.
- Khi quyền bị thu hồi realtime, UI refetch `/me` và thoát khỏi màn không còn quyền.
- Không hiện service role key, token hoặc mật khẩu trong UI/log.
- Không cho vô hiệu hóa tài khoản quản trị cuối cùng hoặc gỡ quyền `perm.manage_users` khỏi quản trị cuối cùng.

---

## 8. Ngoài Scope Hiện Tại

- Chấm công.
- Mã chấm công.
- Lịch làm việc.
- Ca làm việc.
- Bảng lương.
- Hoa hồng.
- Thiết lập lương/thưởng/phụ cấp.
- KPI/hiệu suất nhân sự sâu.
- Phân ca nhân viên.
- Máy chấm công.
- Zalo mini app cho nhân viên.
- CMND/CCCD nhân viên.
- Nợ/tạm ứng nhân viên.
- Phòng ban/chức danh như module HR riêng.
- Role cứng làm nguồn authorization.

Doanh thu theo nhân viên nếu cần nằm trong Reports, không phải module lương/hoa hồng.

---

## 9. Acceptance Criteria UX

1. Admin tạo được tài khoản mới với email, tên hiển thị, mật khẩu tạm và permission.
2. Admin sửa được tên hiển thị, trạng thái và permission.
3. Tài khoản inactive không truy cập được ứng dụng.
4. Lịch sử đổi quyền hiển thị trước/sau và người thay đổi.
5. UI không hiển thị module chấm công/lương/hoa hồng.
6. Máy trạm được quản lý riêng, không gắn cứng với user.

---

← [Quay về System README](./README.md)
