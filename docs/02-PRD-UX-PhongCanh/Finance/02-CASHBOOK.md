# CASHBOOK — UX sổ quỹ và phiếu thu/chi

> **Nguồn tham khảo UI:** KiotViet Sổ quỹ tiền mặt.

---

## 0. Ghi nhận từ KiotViet

Quan sát bổ sung ngày `05/07/2026` từ KiotViet đang mở và file xuất `SoQuy_KV05072026-185646-888.xlsx`:

- Màn chính có title theo quỹ đang chọn, ví dụ `Sổ quỹ tiền mặt`.
- Top search mặc định `Theo mã phiếu`, có chế độ tìm nâng cao:
  - theo mã phiếu
  - theo ghi chú
  - theo nội dung chuyển khoản
- Action đầu trang:
  - `+ Phiếu thu`: Tiền mặt, Ngân hàng, Ví điện tử
  - `+ Phiếu chi`: Tiền mặt, Ngân hàng, Ví điện tử
  - xuất file
  - chọn cột hiển thị
  - thiết lập/hướng dẫn
- Bộ lọc trái có:
  - Quỹ tiền: Tiền mặt, Ngân hàng, Ví điện tử, Tổng quỹ
  - Thời gian: Tháng này, Tùy chỉnh
  - Loại chứng từ: Phiếu thu, Phiếu chi
  - Loại thu chi
  - Trạng thái: Đã thanh toán, Đã hủy
  - Hạch toán kết quả kinh doanh: Tất cả, Có, Không
  - Người tạo
  - Nhân viên
  - Người nộp/nhận: loại đối tượng, tên/mã, số điện thoại
  - Công nợ đối tác: Tính vào công nợ, Không tính vào công nợ, Không có công nợ
- Summary gồm `Quỹ đầu kỳ`, `Tổng thu`, `Tổng chi`, `Tồn quỹ`.
- Bảng mặc định gồm `Mã phiếu`, `Thời gian`, `Loại thu chi`, `Người nộp/nhận`, `Giá trị`.
- Chọn cột có thêm: `Thời gian tạo`, `Người tạo`, `Nhân viên`, `Chi nhánh`, `Tên tài khoản`, `Số tài khoản`, `Mã người nộp/nhận`, `Số điện thoại`, `Địa chỉ`, `Nội dung chuyển khoản`, `Ghi chú`, `Loại sổ quỹ`, `Trạng thái`.
- File xuất 1 tháng có 241 dòng, cột xuất tối thiểu: `Mã phiếu`, `Thời gian`, `Loại thu chi`, `Người nộp/nhận`, `Giá trị`.
- File xuất tháng 06/2026 có các nhóm thực tế:
  - `Phiếu thu Tiền khách trả`: 143 dòng
  - `Phiếu chi Lương NV`: 21 dòng
  - `Phiếu chi Vận chuyển`: 17 dòng
  - `Phiếu chi Vật tư`: 15 dòng
  - `Phiếu chi Tiền trả NCC`: 13 dòng
  - `Phiếu thu/chi Chuyển/Rút`
  - `Chi phí khác`
  - các chi phí lẻ: điện, nước, nhà, rác, thuế, hoa hồng, VAT cho khách

Quan sát trước đó ngày `01/07/2026`:

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
- Ví dụ phiếu chi thủ công `CTM001180` ngày `04/07/2026`:
  - tiêu đề `Phiếu chi CTM001180`
  - trạng thái `Đã thanh toán`
  - chip `Có hạch toán`
  - người tạo, người chi, thời gian, chi nhánh
  - số tiền âm
  - loại chi `Chi Vận chuyển`
  - đối tượng nhận `Nhà cung cấp`
  - phương thức thanh toán `Tiền mặt`
  - người nhận hiển thị tên, mã NCC và số điện thoại
  - ghi chú
- Ví dụ phiếu thu tự động `TTHD011029` ngày `04/07/2026`:
  - tiêu đề `Phiếu thu TTHD011029`
  - trạng thái `Đã thanh toán`
  - chip `Không hạch toán`
  - người tạo, người thu, thời gian, chi nhánh
  - loại thu `Thu Tiền khách trả`
  - đối tượng nộp `Khách hàng`
  - phương thức thanh toán `Tiền mặt`
  - người nộp hiển thị tên và mã khách
  - có khối `Phiếu thu tự động được gắn với hóa đơn HD...`
  - bảng gắn hóa đơn gồm mã phiếu/hóa đơn, thời gian, giá trị phiếu, đã thu trước, giá trị thu, trạng thái
- Form tạo phiếu thu tiền mặt có:
  - mã phiếu tự động
  - thời gian
  - loại thu
  - người thu
  - đối tượng nộp
  - tên người nộp và `Tạo mới`
  - số tiền
  - ghi chú
  - checkbox `Hạch toán kết quả kinh doanh`
  - nút `Bỏ qua`, `Lưu & In`, `Lưu`
- Loại thu KV thấy được: `Thu nhập khác`, `Chuyển/Rút`, `Chi phí cố định`, `Góp vốn`, `Khách trả nợ`, `Tạo mới`.
- Form tạo phiếu chi tiền mặt có cấu trúc tương tự, đổi thành loại chi/người chi/đối tượng nhận/người nhận.
- Loại chi KV thấy được gồm nhóm hệ thống và các mục: `Chi phí khác`, `Chuyển/Rút`, `Chi phí điện`, `Chi phí hội nghị, sự kiện, công tác phí`, `Chi phí nhân công`, `Chi phí nước`, `Chi phí phần mềm, dịch vụ quản trị, tư vấn`, `Chi phí quảng cáo`, cùng các loại thực tế từ file xuất như lương, vận chuyển, vật tư, tiền trả NCC, tiền nhà, rác, thuế, hoa hồng, VAT cho khách.

Áp dụng cho QC-OMS:

- Tìm theo mã phiếu phải mở rộng/bỏ filter thời gian nếu filter hiện tại che kết quả.
- Phiếu thu từ hóa đơn/thu nợ phải hiển thị liên kết chứng từ gốc và phân bổ vào hóa đơn.
- Phiếu chi thủ công cần lưu cờ có tính vào báo cáo kinh doanh hay không.
- Người nộp/nhận có thể là khách hàng, nhà cung cấp, nhân viên hoặc đối tượng tự do.
- `Ví điện tử` có trong KiotViet nhưng QC-OMS MVP vẫn chưa đưa vào nếu Owner chưa chốt nghiệp vụ riêng; cần thiết kế mở để thêm sau.

Hiện trạng detail inline sau PR #91 ngày `06/07/2026`:

- Click mã phiếu mở sub-panel ngay dưới dòng.
- Panel có tab `Thông tin`, tiêu đề `Phiếu thu/chi <mã>`, chip `Đã thanh toán/Đã hủy`, chip `Có hạch toán/Không hạch toán`. QC-OMS không hiển thị `Chi nhánh trung tâm` vì MVP không quản lý theo chi nhánh.
- Nhật ký chỉ hiển thị `Người tạo` và `Thời gian`; mặc định `Người tạo` chính là người thu/chi nếu backend chưa tách trường riêng.
- Grid thông tin chính chia 4 cột: số tiền, loại thu/chi, đối tượng nộp/nhận, phương thức thanh toán. Các dòng phụ bên dưới hiển thị người nộp/nhận dạng link và quỹ/tài khoản nhận hoặc chi.
- Ghi chú hiển thị phía trên khối chứng từ liên kết. Ghi chú hệ thống dạng `Checkout HD...` không hiển thị như ghi chú thủ công; mã hóa đơn trong chuỗi này chỉ dùng để suy luận chứng từ liên kết khi API chưa trả `allocations`.
- Nếu API trả `allocations`, panel hiển thị câu liên kết chứng từ và bảng con: mã chứng từ, thời gian, giá trị phiếu, đã thu/trả trước, giá trị thu/chi, trạng thái.
- Nếu không có `allocations` nhưng ghi chú/source chứa mã `HD...` hoặc `PN...`, panel vẫn hiển thị dòng chứng từ liên kết suy luận để người dùng thấy phiếu thu/chi gắn với hóa đơn/phiếu nhập nào. Nếu không có dữ liệu liên kết, bảng con hiển thị trạng thái rỗng.
- Không hiển thị dòng `Tiền chưa phân bổ: 0` trong detail.
- Footer chỉ chứa actions: `Hủy` canh trái; `Chỉnh sửa` và `In` canh phải. Nhãn và icon trong từng nút luôn nằm trên một hàng, không wrap xuống dòng. Các nút này đang disabled nếu chưa có API/hành vi an toàn cho dòng detail.

Field còn thiếu để giống KV tuyệt đối: chi nhánh thật theo phiếu, tài khoản ngân hàng nguồn/đích đầy đủ, loại thu/chi chi tiết theo `voucher_type`, mã/tên/số điện thoại đối tượng đầy đủ trong detail. Không hiển thị `Người thu`/`Người chi` riêng khi backend chưa cần tách trường này.

---

## 1. Mục đích

Màn Sổ quỹ cho phép xem dòng tiền vào/ra và tạo phiếu thu/chi thủ công.

Hiện trạng sau các slice sổ quỹ ngày `06/07/2026`:

- `/finance` là màn sổ quỹ chính; thân trang chỉ còn bảng sổ quỹ, inline detail dòng sổ và form phiếu thu/chi khi mở.
- Các khối `Tài khoản quỹ`, `Công nợ khách hàng`, `Phiếu thu/chi` đã ẩn khỏi thân trang để tránh rối layout.
- Header có ô `Tìm công nợ` theo kiểu search chung; nút `+ Phiếu thu`, `+ Phiếu chi`, `Xuất file` nằm cùng hàng, nhãn không wrap xuống dòng, và canh phải trước cụm tài khoản/giao diện của shell.
- Summary `Quỹ đầu kỳ`, `Tổng thu`, `Tổng chi`, `Tồn quỹ` nằm trong khu vực chính bên phải, ngay trên bảng sổ quỹ, và lấy từ `summary` của API sổ quỹ theo filter.
- `Tồn quỹ` dùng `summary.ending_balance`, không dùng tổng số dư hiện tại của tất cả tài khoản.
- Bộ lọc sổ quỹ tự áp dụng khi chọn giá trị; không có nút `Lọc sổ` hoặc `Đặt lại bộ lọc`.
- Bảng dùng layout KiotViet-like nhưng màu sắc/border/spacing theo design system QC-OMS, không copy màu KiotViet: có checkbox chọn dòng, cột đánh dấu sao, mã phiếu dạng link, thời gian, loại thu chi, người nộp/nhận, loại sổ quỹ và giá trị. Sao từng dòng lưu ưu tiên cục bộ; sao ở header lọc các dòng ưu tiên trong trang hiện tại.
- Surface bảng dùng viền/padding ngoài mỏng để bảng sát khung hơn; vẫn giữ border và hover theo design system.

MVP của QC-OMS hỗ trợ:

- tiền mặt
- tài khoản ngân hàng

Không dùng ví điện tử trong MVP nếu chưa có nghiệp vụ riêng.

---

## 2. Bố cục

```text
┌────────────────────────────────────────────────────────────────────────────────────┐
│ Sổ quỹ                            [Tìm công nợ +] [+ Phiếu thu] [+ Phiếu chi] [Xuất]│
├───────────────────────┬────────────────────────────────────────────────────────────┤
│ Thời gian             │ Quỹ đầu kỳ | Tổng thu | Tổng chi | Tồn quỹ                 │
│ Quỹ tiền              │ [ ] | ☆ | Mã phiếu | Thời gian | Loại thu chi | Người      │
│ Loại chứng từ         │     |   | Loại sổ quỹ | Giá trị                             │
│ Trạng thái            │ CTM001170 | ... | Chi phí khác | Tý | Tiền mặt | -50,000    │
│ Hạch toán KQKD        │ TTHD010973| ... | Thu tiền khách trả | KL2 | Ngân hàng      │
│                       │ Pagination                                                 │
└───────────────────────┴────────────────────────────────────────────────────────────┘
```

---

## 3. Bộ lọc MVP

| Bộ lọc | Giá trị |
|---|---|
| Quỹ tiền | Radio list chọn một: quỹ tiền mặt mặc định, từng tài khoản ngân hàng, tổng quỹ |
| Thời gian | Hôm nay, hôm qua, tuần này, tuần trước, 7 ngày qua, tháng này, tháng trước, 30 ngày qua, quý này, quý trước, năm nay, năm trước, toàn thời gian, tùy chỉnh |
| Loại chứng từ | Checkbox group: `Phiếu thu`, `Phiếu chi`; mặc định không tick nghĩa là xem cả hai |
| Loại thu chi | Chưa có trong UI hiện tại; thuộc slice sau |
| Trạng thái | Checkbox group: `Đã thanh toán` tick mặc định, `Đã hủy` không tick; tick cả hai hoặc không tick gì tương đương xem tất cả |
| Hạch toán KQKD | Segmented radio tabs: `Tất cả`, `Có`, `Không` |
| Người tạo | Chưa có trong UI hiện tại; thuộc slice sau |
| Người nộp/nhận | Chưa có trong filter UI hiện tại; detail vẫn hiển thị người nộp/nhận |
| Công nợ đối tác | Có trong form phiếu thu/chi thủ công; filter list thuộc slice sau |

Ghi chú:

- Filter hiện tại tự gọi lại danh sách sổ quỹ khi đổi thời gian, quỹ tiền, loại chứng từ, trạng thái, hạch toán KQKD.
- UI filter dùng hình thái giống KiotViet cho những phần đã đủ API: quỹ tiền là radio list, loại chứng từ/trạng thái là checkbox group, hạch toán KQKD là segmented tabs. Màu sắc vẫn theo design system QC-OMS.
- `Công nợ đối tác` cần dùng cho phiếu liên quan khách hàng/nhà cung cấp; hiện đã có trường khi tạo phiếu thủ công, chưa có filter list.
- `Người nộp/nhận` cần tìm được theo tên, mã và số điện thoại ở slice sau.
- Nếu tìm đúng mã phiếu, hệ thống phải bỏ qua filter tháng hiện tại khi filter đó che kết quả; hiện UI sổ quỹ chưa có ô tìm mã phiếu riêng.

---

## 4. Summary

| Card | Ý nghĩa |
|---|---|
| Quỹ đầu kỳ | Số dư đầu kỳ theo filter hiện tại |
| Tổng thu | Tổng dòng thu theo tài khoản/thời gian đang lọc |
| Tổng chi | Tổng dòng chi theo tài khoản/thời gian đang lọc |
| Tồn quỹ | `ending_balance` từ API theo filter hiện tại |

Nếu chọn `Tổng quỹ`, UI vẫn cần tách chi tiết theo từng tài khoản trong drilldown hoặc report phụ, không chỉ hiển thị một con số chung khi đối soát.

---

## 5. Bảng sổ quỹ

| Cột | Ghi chú |
|---|---|
| Mã phiếu | Link mở chi tiết phiếu |
| Thời gian | Ngày giờ ghi sổ |
| Loại thu chi | Tên loại thu/chi |
| Người nộp/nhận | Khách, nhân viên hoặc ghi chú |
| Loại sổ quỹ | Hiển thị loại quỹ như `Tiền mặt` hoặc `Ngân hàng` |
| Giá trị | Thu dương, chi âm |
| Hạch toán | Có/không tính vào báo cáo kinh doanh nếu cần |
| Trạng thái | Đã ghi sổ/đã hủy |

### Chọn cột

MVP nên cho cấu hình cột tương tự KV, nhưng có thể làm theo mức ưu tiên:

1. Cột mặc định hiện tại: checkbox chọn dòng, đánh dấu sao, mã phiếu, thời gian, loại thu chi, người nộp/nhận, loại sổ quỹ, giá trị.
2. Cột mở rộng: thời gian tạo, người tạo, nhân viên, mã người nộp/nhận, số điện thoại, địa chỉ, nội dung chuyển khoản, ghi chú, loại sổ quỹ, hạch toán KQKD.
3. Chi nhánh chỉ hiển thị khi hệ thống có nhiều chi nhánh.

Hiện trạng UI: chưa có nút `Cột`; cột mặc định cố định để tránh làm rối giai đoạn layout.

### Xuất file

Xuất file tối thiểu phải có các cột giống file KV mẫu:

- mã phiếu
- thời gian
- loại thu chi
- người nộp/nhận
- giá trị

Sau đó thêm các cột QC-OMS cần đối soát: quỹ/tài khoản, trạng thái, ghi chú, người tạo, hạch toán KQKD.

Hiện trạng UI: nút `Xuất file` nằm cạnh `+ Phiếu thu` và `+ Phiếu chi` ở header.

---

## 6. Phiếu thu/chi thủ công

### Tạo phiếu thu

Form tối thiểu:

- quỹ/tài khoản nhận tiền
- mã phiếu tự động từ backend
- thời gian ghi theo backend hiện tại
- loại thu
- người thu là actor hiện tại nếu chưa có field riêng
- đối tượng nộp: khách hàng, nhà cung cấp, nhân viên, khác, không có
- tên/mã/số điện thoại người nộp nếu có
- số tiền
- lý do/ghi chú
- hạch toán kết quả kinh doanh
- công nợ đối tác: không có, có đối tác nhưng không tính công nợ, hoặc tính vào công nợ

### Tạo phiếu chi

Form tối thiểu:

- quỹ/tài khoản chi tiền
- mã phiếu tự động từ backend
- thời gian ghi theo backend hiện tại
- loại chi
- người chi là actor hiện tại nếu chưa có field riêng
- đối tượng nhận: khách hàng, nhà cung cấp, nhân viên, khác, không có
- tên/mã/số điện thoại người nhận nếu có
- số tiền
- lý do/ghi chú
- hạch toán kết quả kinh doanh
- công nợ đối tác: không có, có đối tác nhưng không tính công nợ, hoặc tính vào công nợ

### Sửa phiếu

- Chỉ phiếu thủ công có nút sửa.
- Sửa phiếu tạo phiên bản mới `MaCu.01`.
- Phiếu cũ chuyển trạng thái đã hủy nhưng vẫn xem được.
- Hiện trạng UI chính không hiển thị bảng phiếu thu/chi phụ; sửa/hủy phiếu thủ công giữ ở luồng voucher và detail/future surface, không nằm trên bảng phụ trong thân trang.

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
6. `Tồn quỹ` trong summary phải đổi theo filter sổ quỹ, không cố định theo tổng số dư tài khoản hiện tại.
7. Bộ lọc đang có phải tự áp dụng khi đổi giá trị, không cần nút áp dụng/reset.

---

← [Quay về Finance README](./README.md)
