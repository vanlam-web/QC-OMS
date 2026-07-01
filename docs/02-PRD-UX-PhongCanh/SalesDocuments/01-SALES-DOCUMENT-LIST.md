# 01-SALES-DOCUMENT-LIST — Danh sách chứng từ bán hàng

> **Trạng thái:** 🔨 Đang xây dựng
> **Phase hiện tại:** Phase 2D readonly list/detail cho hóa đơn `HD...`
> **Tham khảo:** KiotViet `Đơn hàng > Hóa đơn`; không dùng mô hình `Đặt hàng/Giao hàng`

---

## 0. Ghi nhận từ KiotViet

Quan sát ngày `01/07/2026`:

- Màn `Hóa đơn` mặc định lọc `Tháng này` có thể không hiện kết quả dù Dashboard có hoạt động bán gần đây.
- Tìm trực tiếp mã `HD010985` mở được hóa đơn ngày `30/06/2026 17:08`.
- Khi tìm theo mã, KiotViet tự đưa thời gian về `Toàn thời gian` và bỏ chọn các filter trạng thái/loại hóa đơn.
- Danh sách có dòng tổng phía trên và các cột chính: mã hóa đơn, thời gian, mã trả hàng, mã khách hàng, khách hàng, tổng tiền hàng, giảm giá, tổng sau giảm giá, khách đã trả.

Áp dụng cho QC-OMS:

- Tìm theo mã chứng từ phải ưu tiên trả đúng chứng từ, không bị filter thời gian/trạng thái mặc định che mất.
- Empty state cần phân biệt `không có dữ liệu` với `đang bị lọc`.
- Giữ cột `khách đã trả` và `còn nợ` vì liên quan công nợ theo hóa đơn.

---

## 1. Mục tiêu

Trang danh sách giúp nhân viên tìm lại chứng từ bán hàng nhanh, gồm:

- Báo giá `BG...`.
- Hóa đơn bán hàng `HD...`.
- Hóa đơn sửa từ hóa đơn cũ, ví dụ `HD000123.01`.
- Chứng từ đã hủy để kiểm tra lịch sử.

Trang này không phải màn hình bán hàng. Nếu cần tạo đơn mới, người dùng đi về POS.

Phase 2D hiện tại chỉ triển khai:

- danh sách hóa đơn `HD...` readonly
- tìm kiếm/lọc cơ bản
- exact document-code lookup không bị che bởi filter mặc định
- bấm mã chứng từ để mở chi tiết readonly

Phase 3A kế tiếp triển khai:

- lưu/list/detail báo giá `BG...` trong cùng danh sách chứng từ, không có module/menu báo giá riêng
- mở lại báo giá tại POS thành nháp local
- checkout từ báo giá sang hóa đơn `HD...`

Chưa triển khai trong Phase 2D/3A:

- in lại bill nếu Bill Preview/print flow chưa có
- sửa hóa đơn
- hủy hóa đơn
- thao tác đảo kho/tiền/công nợ từ danh sách

QC-OMS chỉ làm luồng **bán đứt**:

- không có `Đặt hàng` kiểu KiotViet
- không có đơn giao hàng/vận đơn/COD
- không có bán hàng online hoặc kênh bán
- báo giá chỉ là bản giá gửi khách, không giữ hàng, không trừ kho, không phát sinh sản xuất, tiền hoặc công nợ
- báo giá không tự hủy/hết hạn theo thời gian

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

Không có bộ lọc giao hàng, COD, đối tác giao hàng, HĐĐT.

Khi người dùng tìm đúng mã chứng từ, hệ thống phải tìm trên toàn bộ lịch sử hoặc tự bỏ các filter thời gian/trạng thái đang che kết quả.

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

### 5.1. Phase 2D hiện tại

| Trạng thái | Thao tác |
|---|---|
| Hóa đơn hoàn thành | Mở chi tiết readonly |
| Hóa đơn đã hủy | Mở chi tiết readonly nếu dữ liệu đã có |
| Báo giá | Chưa nằm trong Phase 2D readonly hiện tại |

### 5.2. Future phase

Các thao tác sau là thiết kế tương lai, không coi là đã có ở Phase 2D:

| Trạng thái | Thao tác tương lai |
|---|---|
| Báo giá | Mở chi tiết, mở lại tại POS, in/xuất bill báo giá, hủy báo giá |
| Hóa đơn hoàn thành | In lại bill, sửa hóa đơn, hủy hóa đơn |
| Hóa đơn đã hủy | In/xem lịch sử; không cho sửa tiếp |

Quy tắc sửa/hủy hóa đơn future phase:

- Không sửa đè hóa đơn đã chốt.
- Bấm **Sửa hóa đơn** mở chứng từ tại POS như một bản nháp sửa.
- Khi lưu lại, hệ thống tạo mã mới theo quy tắc `MaCu.01`, `MaCu.02`.
- Chứng từ cũ chuyển sang trạng thái **Đã hủy** với lý do sửa chứng từ.
- Chỉ bật khi Backend có transaction an toàn để đồng bộ chứng từ, kho, sổ quỹ và công nợ.

---

## 6. Empty state

Khi không có kết quả:

- Hiển thị `Không tìm thấy chứng từ phù hợp`.
- Có nút bỏ lọc nhanh.
- Nếu người dùng đang lọc theo thời gian/trạng thái, gợi ý mở rộng thời gian hoặc bỏ lọc.
- Không tự tạo dữ liệu mẫu.

---

## 7. Quy tắc giữ khác KiotViet

- Không có trả hàng trong MVP.
- Không có giao hàng/vận đơn/COD trong MVP.
- Không có `Đặt hàng` kiểu KiotViet trong MVP.
- Không có bán hàng online/kênh bán trong MVP.
- Không có HĐĐT/thuế kế toán.
- Không có gộp đơn.
- Không import hóa đơn từ file trong MVP.
