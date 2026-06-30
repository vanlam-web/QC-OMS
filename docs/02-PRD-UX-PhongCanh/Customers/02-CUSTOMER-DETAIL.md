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
│ [Thông tin] [Lịch sử bán] [Nợ cần thu]                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

Gợi ý từ KiotViet: chi tiết khách nên mở được trực tiếp từ danh sách hoặc bằng mã khách. Header luôn cho thấy mã, tên, trạng thái, tổng nợ và tổng bán để nhân viên biết nhanh khách đang ở tình trạng nào.

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
- Thông tin pháp lý nội bộ nếu cần: tên đơn vị, mã số thuế, địa chỉ pháp lý.
- Ghi chú.

Quy tắc:

- Mã khách hàng có thể tự sinh khi tạo mới nếu người dùng để trống.
- Mã khách hàng được phép sửa, nhưng phải unique và đúng định dạng.
- SĐT được phép trống.
- Nếu có SĐT, phải chuẩn hóa và không trùng khách khác.
- Khi đổi nhóm khách, lần bán sau dùng bảng giá của nhóm mới.
- Nếu khách đang mở ở POS, POS sẽ cập nhật giá tự động cho các dòng chưa sửa giá thủ công sau khi hồ sơ được lưu và đồng bộ.

---

## 4. Tab Cấu hình gửi bill

Cho phép bật/tắt hỗ trợ gửi bill và chọn kênh:

- Zalo cá nhân.
- Nhóm Zalo.
- Facebook/Messenger.

Quy tắc:

- Nếu chưa bật hoặc cấu hình thiếu dữ liệu, POS không hiện popup gửi bill.
- Hệ thống chỉ hỗ trợ mở đúng nơi gửi và chuẩn bị ảnh bill; nhân viên vẫn kiểm tra và bấm gửi.
- Không lưu lịch sử gửi bill trong MVP.

---

## 5. Tab Lịch sử bán

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

KiotViet hiển thị lịch sử bán/trả hàng chung. QC-OMS MVP chỉ hiển thị báo giá/hóa đơn vì chưa làm nghiệp vụ trả hàng bán.

---

## 6. Tab Nợ cần thu

Hiển thị công nợ theo hóa đơn hoặc phát sinh công nợ:

- Mã hóa đơn.
- Ngày phát sinh.
- Loại phát sinh: bán hàng, thu tiền, hủy/sửa chứng từ.
- Tổng cần trả.
- Đã trả.
- Còn nợ.
- Dư nợ khách hàng sau phát sinh.
- Ngày thu gần nhất, nếu có.
- Trạng thái nợ.

Thao tác:

- Thu nợ mở form thu nợ theo quy tắc Finance.
- Tiền thu nợ mặc định phân bổ vào hóa đơn cũ nhất trước.
- Không tạo công nợ âm/khách trả trước trong MVP.

Tab này là lối xem nhanh công nợ theo khách. Nguồn dữ liệu vẫn phải khớp với module Finance/Customer Debt và phiếu thu trong Sổ quỹ.

---

## 7. Các tab chưa làm MVP

KiotViet có thêm nhiều tab như lịch sử đặt hàng, công nợ, lịch sử mua dịch vụ, lịch sử tích điểm. QC-OMS MVP không làm riêng nếu chưa có nghiệp vụ tương ứng:

- xuất hóa đơn/HĐĐT/VAT: bỏ khỏi scope hiện tại; không tạo tab hoặc luồng phát hành hóa đơn điện tử
- địa chỉ nhận hàng/giao hàng: bỏ khỏi MVP vì QC-OMS không làm vận đơn, COD hoặc bán giao hàng
- lịch sử đặt hàng: bỏ theo mô hình KiotViet; nếu cần gửi giá trước thì dùng Báo giá, không phải đơn đặt hàng
- lịch sử mua dịch vụ: bỏ
- lịch sử tích điểm: bỏ
- công nợ tổng: đã được bao phủ bởi `Nợ cần thu` và module Finance

---

## 8. Trạng thái khách hàng

| Trạng thái | Hành vi |
|---|---|
| Đang hoạt động | Tìm được trong POS và danh sách khách |
| Ngừng hoạt động | Không hiện trong tìm kiếm POS mặc định; vẫn xem được trong danh sách khách bằng bộ lọc |

Ngừng hoạt động không xóa lịch sử bán hàng, công nợ hoặc chứng từ cũ.
