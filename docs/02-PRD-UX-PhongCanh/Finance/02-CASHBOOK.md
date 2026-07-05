# CASHBOOK — UX sổ quỹ và phiếu thu/chi

> **Nguồn tham khảo UI:** KiotViet Sổ quỹ tiền mặt.

---

## 0. Ghi nhận từ KiotViet

Quan sát ngày `01/07/2026`:

- Bộ lọc mặc định `Tháng này` trống vì đầu tháng mới, không dùng làm căn cứ đánh giá dữ liệu.
- Chọn `Toàn thời gian` trên quỹ `Tiền mặt` có `4,161 phiếu thu chi`.
- Summary toàn thời gian tiền mặt hiển thị `Quỹ đầu kỳ`, `Tổng thu`, `Tổng chi`, `Tồn quỹ`.
- Ví dụ phiếu thu tự động `TTHD010973`:
  - trạng thái `Đã thanh toán`
  - `Không hạch toán`
  - người tạo/người thu
  - chi nhánh nếu sau này có nhiều chi nhánh; MVP một chi nhánh ngầm nên không hiển thị bộ lọc này
  - phương thức thanh toán `Tiền mặt`
  - người nộp là khách hàng
  - ghi rõ phiếu thu tự động gắn với hóa đơn `HD010973`
  - có bảng phân bổ: mã hóa đơn, giá trị phiếu, đã thu trước, giá trị thu, trạng thái
- Ví dụ phiếu chi thủ công `CTM001170`:
  - trạng thái `Đã thanh toán`
  - `Có hạch toán`
  - người tạo/người chi
  - phương thức thanh toán `Tiền mặt`
  - đối tượng nhận `Khác`
  - người nhận có tên và SĐT
  - có ghi chú chi, ví dụ `Xăng xe`

Áp dụng cho QC-OMS:

- Tìm theo mã phiếu phải mở rộng/bỏ filter thời gian nếu filter hiện tại che kết quả.
- Phiếu thu từ hóa đơn/thu nợ phải hiển thị liên kết chứng từ gốc và phân bổ vào hóa đơn.
- Phiếu chi thủ công cần lưu cờ có tính vào báo cáo kinh doanh hay không.
- Người nộp/nhận có thể là khách hàng, nhà cung cấp, nhân viên hoặc đối tượng tự do.

---

## 1. Mục đích

Màn Sổ quỹ cho phép xem dòng tiền vào/ra và tạo phiếu thu/chi thủ công.

MVP của QC-OMS hỗ trợ:

- tiền mặt
- tài khoản ngân hàng

Không dùng ví điện tử trong MVP nếu chưa có nghiệp vụ riêng.

---

## 2. Bố cục

```text
┌────────────────────────────────────────────────────────────────────────────────────┐
│ Sổ quỹ                                     [Tìm mã phiếu] [+ Thu] [+ Chi] [Cột]    │
├───────────────────────┬────────────────────────────────────────────────────────────┤
│ Quỹ tiền              │ Tổng thu              Tổng chi              Tồn quỹ        │
│ ○ Tiền mặt            │ 32,358,370           -19,857,000            25,761,570     │
│ ○ MB Bank             ├────────────────────────────────────────────────────────────┤
│ ○ Vietcombank         │ □ ☆ Mã phiếu | Thời gian | Loại thu chi | Người | Giá trị │
│ ○ Tổng quỹ            │ CTM001170 | ... | Chi phí khác      | Tý    | -50,000     │
│                       │ TTHD010973| ... | Thu tiền khách trả| KL2   | 114,000     │
│ Thời gian             │                                                            │
│ Loại chứng từ         │                                                            │
│ Trạng thái            │                                                            │
└───────────────────────┴────────────────────────────────────────────────────────────┘
```

---

## 3. Bộ lọc MVP

| Bộ lọc | Giá trị |
|---|---|
| Quỹ tiền | Tiền mặt, từng tài khoản ngân hàng, tổng quỹ |
| Thời gian | Hôm nay, tháng này, tùy chỉnh |
| Loại chứng từ | Phiếu thu, phiếu chi |
| Loại thu chi | Thu bán hàng, thu nợ, thu khác, chi mua vật tư, chi hoàn tiền, chi phí vận hành, chi khác |
| Trạng thái | Đã ghi sổ, đã hủy |
| Hạch toán KQKD | Tất cả, có hạch toán, không hạch toán |
| Người tạo | Nhân viên |
| Người nộp/nhận | Khách/nhà cung cấp/người nhận nếu có |

---

## 4. Summary

| Card | Ý nghĩa |
|---|---|
| Tổng thu | Tổng dòng thu theo tài khoản/thời gian đang lọc |
| Tổng chi | Tổng dòng chi theo tài khoản/thời gian đang lọc |
| Tồn quỹ | Số dư hiệu lực theo tài khoản đang chọn |

Nếu chọn `Tổng quỹ`, UI vẫn cần tách chi tiết theo từng tài khoản trong drilldown hoặc report phụ, không chỉ hiển thị một con số chung khi đối soát.

---

## 5. Bảng sổ quỹ

| Cột | Ghi chú |
|---|---|
| Mã phiếu | Link mở chi tiết phiếu |
| Thời gian | Ngày giờ ghi sổ |
| Loại thu chi | Tên loại thu/chi |
| Người nộp/nhận | Khách, nhân viên hoặc ghi chú |
| Quỹ/tài khoản | Tiền mặt hoặc tên ngân hàng |
| Giá trị | Thu dương, chi âm |
| Hạch toán | Có/không tính vào báo cáo kinh doanh nếu cần |
| Trạng thái | Đã ghi sổ/đã hủy |

---

## 6. Phiếu thu/chi thủ công

### Tạo phiếu thu

Form tối thiểu:

- quỹ/tài khoản nhận tiền
- loại thu
- số tiền
- người nộp nếu có
- lý do/ghi chú

### Tạo phiếu chi

Form tối thiểu:

- quỹ/tài khoản chi tiền
- loại chi
- số tiền
- người nhận nếu có
- lý do/ghi chú

### Sửa phiếu

- Chỉ phiếu thủ công có nút sửa.
- Sửa phiếu tạo phiên bản mới `MaCu.01`.
- Phiếu cũ chuyển trạng thái đã hủy nhưng vẫn xem được.

---

## 7. Phiếu sinh từ POS/thu nợ

Các phiếu sinh từ checkout POS hoặc thu nợ khách:

- hiển thị trong sổ quỹ
- mở xem chi tiết được
- không có nút sửa rời
- nếu cần sửa phải đi qua nghiệp vụ gốc
- chi tiết phiếu phải hiển thị chứng từ gốc và các hóa đơn được phân bổ nếu có

---

## 8. Acceptance Criteria UX

1. Người dùng lọc được sổ quỹ theo tiền mặt hoặc từng tài khoản ngân hàng.
2. Thu/chi hiển thị khác màu và dễ phân biệt.
3. Tạo phiếu thu/chi thủ công không đi qua duyệt nhiều bước trong MVP.
4. Phiếu thủ công sửa theo bản mới, không sửa đè.
5. Phiếu từ POS/thu nợ không có nút sửa rời.

---

← [Quay về Finance README](./README.md)
