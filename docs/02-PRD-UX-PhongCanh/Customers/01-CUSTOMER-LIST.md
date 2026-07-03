# 01-CUSTOMER-LIST — Danh sách khách hàng

> **Trạng thái:** 🔨 Đang xây dựng
> **Tham khảo:** KiotViet `Khách hàng > Khách hàng`

---

## 1. Mục tiêu

Trang danh sách khách hàng giúp tìm, tạo, sửa nhanh và kiểm tra các chỉ số chính của từng khách.

---

## 2. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Khách hàng                                      [+ Khách hàng] [Xuất file]   │
├──────────────────────┬───────────────────────────────────────────────────────┤
│ Bộ lọc               │ [Theo mã, tên, SĐT...]                                │
│ - Nhóm khách         │                                                       │
│ - Ngày tạo           │ Bảng khách hàng                                       │
│ - Trạng thái         │                                                       │
│ - Nợ hiện tại        │                                                       │
│ - Tổng bán           │                                                       │
└──────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 3. Bộ lọc

| Bộ lọc | Quy tắc |
|---|---|
| Tìm kiếm nhanh | Tìm theo mã khách, tên khách, SĐT nếu có; hỗ trợ không dấu |
| Nhóm khách | Tất cả hoặc một nhóm khách cụ thể |
| Ngày tạo | Toàn thời gian, tháng này, hôm nay, tùy chỉnh |
| Trạng thái | Đang hoạt động, Ngừng hoạt động |
| Nợ hiện tại | Tất cả, còn nợ, không nợ; có thể lọc khoảng tiền |
| Tổng bán | Lọc khoảng tổng doanh thu |

Tham khảo KiotViet có thêm loại khách, giới tính, sinh nhật, người tạo, giao dịch cuối, khu vực giao hàng và loại đối tác.

Export KiotViet ngày `2026-07-01` có `528` khách hàng:

- `503` khách không có SĐT
- `25` khách có SĐT và không thấy SĐT trùng trong export
- `367` khách không gán nhóm khách
- các nhóm khách đang dùng là `25`, `26`, `30`, `35`, `40`
- `78` khách có nợ hiện tại, tổng nợ khoảng `225,781,565`

Các số này củng cố quyết định: SĐT không bắt buộc, nếu có thì unique; nhóm khách quyết định bảng giá; khách không nhóm dùng bảng giá chung.

Quyết định Owner ngày `2026-07-03`:

- Hồ sơ khách MVP có trường `MST` để phục vụ khách công ty/tổ chức.
- Các trường bổ sung khác của KiotViet chưa cần đưa vào MVP nếu chưa phục vụ bán hàng, áp giá hoặc công nợ.
- Nếu khách không có nhóm khách, hệ thống áp dụng `Bảng giá chung`.
- Chi tiết khách tham khảo KiotViet nhưng chỉ giữ phần cần vận hành: thông tin chính, bảng giá áp dụng, lịch sử bán nếu có API đúng, và nợ cần thu.

QC-OMS MVP lược bỏ:

- giới tính, sinh nhật
- điểm thưởng/thẻ thành viên
- khu vực giao hàng nếu chưa làm module giao hàng
- Facebook/email/company trên danh sách chính
- CCCD/CMND, hộ chiếu, tài khoản ngân hàng
- địa chỉ nhận hàng nếu chưa làm module giao hàng

`MST` không cần là cột mặc định trên danh sách chính nếu làm chật bảng, nhưng phải có trong form tạo/sửa và chi tiết khách.

---

## 4. Cột bảng

Danh sách ưu tiên các cột phục vụ bán hàng, áp giá và thu nợ nhanh:

| Cột | Mô tả |
|---|---|
| Mã khách hàng | Bắt buộc, unique; bấm để mở chi tiết |
| Tên khách hàng | Bắt buộc |
| SĐT | Có thể trống; nếu có thì unique |
| Nhóm khách hàng | Quyết định bảng giá mặc định |
| Bảng giá áp dụng | Bảng giá nhóm hoặc Bảng giá chung |
| Nợ hiện tại | Tổng còn nợ hiện tại theo hóa đơn |
| Tổng bán | Tổng hóa đơn hoàn thành, không tính chứng từ đã hủy |
| Ngày giao dịch cuối | Lần bán gần nhất |
| Trạng thái | Đang hoạt động hoặc Ngừng hoạt động |
| Ghi chú | Ghi chú nội bộ |

Phần tổng phía trên danh sách hiển thị:

- tổng số khách theo bộ lọc
- tổng nợ hiện tại
- tổng bán
- tổng bán trừ trả hàng

Trong MVP chưa có nghiệp vụ trả hàng bán, nên `Tổng bán trừ trả hàng` có thể bằng `Tổng bán` hoặc ẩn nhãn này để tránh gây hiểu nhầm.

---

## 5. Thao tác

| Thao tác | Hành vi |
|---|---|
| Thêm khách hàng | Mở form chi tiết ở chế độ thêm mới |
| Mở chi tiết | Bấm mã/tên khách để mở trang chi tiết |
| Đổi trạng thái | Ngừng hoạt động khách không còn xuất hiện trong tìm kiếm POS mặc định |
| Xuất file | Xuất danh sách đang lọc để đối chiếu |

Khi tạo khách:

- Tên khách hàng bắt buộc.
- Mã khách hàng bắt buộc về dữ liệu, nhưng nếu người dùng để trống thì hệ thống tự sinh.
- SĐT không bắt buộc.
- MST không bắt buộc.
- Nếu có SĐT, hệ thống chuẩn hóa và kiểm tra không trùng.
- Nếu có nhóm khách, lần bán sau dùng bảng giá của nhóm khách; nếu không có nhóm thì dùng bảng giá chung.

Tìm theo mã khách chính xác phải mở được khách dù bộ lọc ngày tạo/trạng thái hiện tại đang che kết quả. Nếu khách bị ngừng hoạt động, UI hiển thị rõ trạng thái thay vì báo không tìm thấy.

---

## 6. Empty state

Khi không tìm thấy khách:

- Hiển thị `Không tìm thấy khách hàng phù hợp`.
- Có nút bỏ lọc nhanh.
- Có nút tạo khách hàng mới.
