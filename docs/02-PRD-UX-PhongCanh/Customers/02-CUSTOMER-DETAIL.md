# 02-CUSTOMER-DETAIL — Chi tiết khách hàng

> **Trạng thái:** 🔨 Đang xây dựng

---

## 1. Mục tiêu

Trang chi tiết khách hàng gom toàn bộ thông tin cần để bán hàng, áp giá, gửi bill và kiểm tra công nợ.

---

## 2. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ KH000123 - Công ty A                    Dư nợ: ...    Tổng bán: ...         │
│ [Lưu] [Ngừng hoạt động]                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Thông tin] [Xuất hóa đơn] [Cấu hình gửi bill] [Lịch sử bán] [Dư nợ]        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tab Thông tin

Trường bắt buộc:

- Mã khách hàng.
- Tên khách hàng.

Trường tùy chọn:

- SĐT.
- Email.
- Địa chỉ.
- Tỉnh/Thành phố, Phường/Xã.
- Nhóm khách hàng.
- Ghi chú.

Quy tắc:

- Mã khách hàng có thể tự sinh khi tạo mới nếu người dùng để trống.
- Mã khách hàng được phép sửa, nhưng phải unique và đúng định dạng.
- SĐT được phép trống.
- Nếu có SĐT, phải chuẩn hóa và không trùng khách khác.
- Khi đổi nhóm khách, lần bán sau dùng bảng giá của nhóm mới.
- Nếu khách đang mở ở POS, POS sẽ cập nhật giá tự động cho các dòng chưa sửa giá thủ công sau khi hồ sơ được lưu và đồng bộ.

---

## 4. Tab Xuất hóa đơn

Thông tin gồm:

- Loại khách: cá nhân hoặc tổ chức/hộ kinh doanh.
- Tên người mua.
- Tên đơn vị, nếu có.
- Mã số thuế.
- Địa chỉ xuất hóa đơn.
- Email/SĐT nhận hóa đơn nếu có.
- Tên ngân hàng và số tài khoản để đối chiếu thanh toán.

MVP chưa phát hành hóa đơn điện tử. Tab này chỉ lưu thông tin để chuẩn bị dữ liệu.

---

## 5. Tab Cấu hình gửi bill

Cho phép bật/tắt hỗ trợ gửi bill và chọn kênh:

- Zalo cá nhân.
- Nhóm Zalo.
- Facebook/Messenger.

Quy tắc:

- Nếu chưa bật hoặc cấu hình thiếu dữ liệu, POS không hiện popup gửi bill.
- Hệ thống chỉ hỗ trợ mở đúng nơi gửi và chuẩn bị ảnh bill; nhân viên vẫn kiểm tra và bấm gửi.
- Không lưu lịch sử gửi bill trong MVP.

---

## 6. Tab Lịch sử bán

Hiển thị danh sách chứng từ của khách:

- Mã chứng từ.
- Thời gian.
- Loại: báo giá hoặc hóa đơn.
- Người bán.
- Tổng tiền.
- Khách đã trả.
- Còn nợ.
- Trạng thái.

Bấm mã chứng từ mở chi tiết tại module SalesDocuments.

Không hiển thị nghiệp vụ trả hàng trong MVP.

---

## 7. Tab Dư nợ

Hiển thị công nợ theo hóa đơn:

- Mã hóa đơn.
- Ngày phát sinh.
- Tổng cần trả.
- Đã trả.
- Còn nợ.
- Ngày thu gần nhất.
- Trạng thái nợ.

Thao tác:

- Thu nợ mở form thu nợ theo quy tắc Finance.
- Tiền thu nợ mặc định phân bổ vào hóa đơn cũ nhất trước.
- Không tạo công nợ âm/khách trả trước trong MVP.

---

## 8. Trạng thái khách hàng

| Trạng thái | Hành vi |
|---|---|
| Đang hoạt động | Tìm được trong POS và danh sách khách |
| Ngừng hoạt động | Không hiện trong tìm kiếm POS mặc định; vẫn xem được trong danh sách khách bằng bộ lọc |

Ngừng hoạt động không xóa lịch sử bán hàng, công nợ hoặc chứng từ cũ.

