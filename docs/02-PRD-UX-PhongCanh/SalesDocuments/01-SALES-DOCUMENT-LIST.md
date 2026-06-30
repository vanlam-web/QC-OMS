# 01-SALES-DOCUMENT-LIST — Danh sách chứng từ bán hàng

> **Trạng thái:** 🔨 Đang xây dựng  
> **Tham khảo:** KiotViet `Đơn hàng > Hóa đơn`, `Đơn hàng > Đặt hàng`

---

## 1. Mục tiêu

Trang danh sách giúp nhân viên tìm lại chứng từ bán hàng nhanh, gồm:

- Báo giá `BG...`.
- Hóa đơn bán hàng `HD...`.
- Hóa đơn sửa từ hóa đơn cũ, ví dụ `HD000123.01`.
- Chứng từ đã hủy để kiểm tra lịch sử.

Trang này không phải màn hình bán hàng. Nếu cần tạo đơn mới, người dùng đi về POS.

---

## 2. Bố cục tổng thể

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Chứng từ bán hàng                                      [Tạo tại POS] [Xuất]  │
├──────────────────────┬───────────────────────────────────────────────────────┤
│ Bộ lọc               │ [Theo mã chứng từ / khách hàng / SĐT / ghi chú...]    │
│ - Thời gian          │                                                       │
│ - Loại chứng từ      │ Bảng chứng từ                                         │
│ - Trạng thái         │                                                       │
│ - Khách hàng         │                                                       │
│ - Người bán          │                                                       │
│ - Thanh toán         │                                                       │
│ - Bảng giá           │                                                       │
└──────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 3. Bộ lọc

| Bộ lọc | Quy tắc |
|---|---|
| Tìm kiếm nhanh | Tìm theo mã chứng từ, mã khách, tên khách, SĐT nếu có, ghi chú đơn |
| Thời gian | Mặc định tháng này; có bộ lọc hôm nay, hôm qua, tháng này, tùy chỉnh |
| Loại chứng từ | Tất cả, Báo giá, Hóa đơn |
| Trạng thái | Báo giá, Hoàn thành, Đã hủy |
| Khách hàng | Chọn khách hoặc nhập nhanh tên/mã/SĐT |
| Người bán | Lọc theo nhân viên bán/chốt |
| Thanh toán | Đã trả đủ, Còn nợ, Không thu tiền |
| Bảng giá | Bảng giá chung hoặc bảng giá theo nhóm khách |

Không có bộ lọc giao hàng, COD, đối tác giao hàng, HĐĐT trong MVP.

---

## 4. Cột bảng

| Cột | Mô tả |
|---|---|
| Mã chứng từ | `BG...`, `HD...`, `HD....01`; bấm để mở chi tiết |
| Thời gian | Thời điểm lưu báo giá hoặc checkout hóa đơn |
| Loại | Báo giá hoặc Hóa đơn |
| Mã khách | Mã khách tại thời điểm lưu; khách lẻ hiển thị `Khách lẻ` |
| Khách hàng | Tên khách snapshot tại thời điểm lưu |
| Tổng tiền hàng | Tổng trước giảm/điều chỉnh |
| Giảm giá | Nếu có |
| Khách cần trả | Số tiền phải thu của chứng từ |
| Khách đã trả | Tiền đã thu cho hóa đơn này |
| Còn nợ | Chỉ hiển thị với hóa đơn còn nợ |
| Người bán | Nhân viên chốt hoặc lưu báo giá |
| Trạng thái | Báo giá, Hoàn thành, Đã hủy |
| Ghi chú | Ghi chú đơn |

Các cột có thể ẩn/hiện, nhưng bộ cột mặc định phải gọn để nhìn nhanh trên màn hình bán hàng.

---

## 5. Thao tác nhanh

| Trạng thái | Thao tác |
|---|---|
| Báo giá | Mở chi tiết, mở lại tại POS, in/xuất bill báo giá, hủy báo giá |
| Hóa đơn hoàn thành | Mở chi tiết, in lại bill, sửa hóa đơn, hủy hóa đơn |
| Hóa đơn đã hủy | Mở chi tiết, in/xem lịch sử; không cho sửa tiếp |

Quy tắc sửa hóa đơn:

- Không sửa đè hóa đơn đã chốt.
- Bấm **Sửa hóa đơn** mở chứng từ tại POS như một bản nháp sửa.
- Khi lưu lại, hệ thống tạo mã mới theo quy tắc `MaCu.01`, `MaCu.02`.
- Chứng từ cũ chuyển sang trạng thái **Đã hủy** với lý do sửa chứng từ.

---

## 6. Empty state

Khi không có kết quả:

- Hiển thị `Không tìm thấy chứng từ phù hợp`.
- Có nút bỏ lọc nhanh.
- Không tự tạo dữ liệu mẫu.

---

## 7. Quy tắc giữ khác KiotViet

- Không có trả hàng trong MVP.
- Không có giao hàng/vận đơn/COD trong MVP.
- Không có HĐĐT trong MVP.
- Không có gộp đơn.
- Không import hóa đơn từ file trong MVP.

