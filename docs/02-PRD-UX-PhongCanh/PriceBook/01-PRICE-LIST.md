# 01-PRICE-LIST — Danh sách bảng giá

> **Trạng thái:** 🔨 Đang xây dựng  
> **Tham khảo:** KiotViet `Hàng hóa > Thiết lập giá`

---

## 1. Mục tiêu

Trang danh sách bảng giá giúp quản lý các bảng giá đang dùng cho khách hàng và nhóm khách.

Sau khi module Purchase/Supplier có dữ liệu giá vốn, PriceBook có thể dùng giá vốn làm dữ liệu tham khảo để gợi ý hoặc tính công thức giá bán. Công thức giá có thể đặt theo từng nhóm hàng và chọn nguồn giá vốn như giá bình quân hoặc giá mới nhất. Giá bán chính thức vẫn là giá đã lưu trong bảng giá.

KiotViet chỉ là nguồn import/tham khảo ban đầu. Luồng giá của QC-OMS phải được thiết kế theo cách xưởng muốn vận hành, không copy nguyên cách KiotViet nếu cách đó không đúng mong muốn.

---

## 2. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Bảng giá                                           [+ Bảng giá]              │
├──────────────────────┬───────────────────────────────────────────────────────┤
│ Bộ lọc               │ [Theo mã/tên bảng giá...]                             │
│ - Trạng thái         │                                                       │
│ - Loại bảng giá      │ Bảng danh sách bảng giá                               │
│ - Nhóm khách dùng    │                                                       │
└──────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 3. Loại bảng giá

| Loại | Quy tắc |
|---|---|
| Bảng giá chung | Luôn có đúng một bảng giá chung đang active trong mỗi xưởng |
| Bảng giá nhóm khách | Dùng để gán cho một hoặc nhiều nhóm khách |

Khách không gán nhóm dùng bảng giá chung.

---

## 4. Cột bảng

| Cột | Mô tả |
|---|---|
| Mã bảng giá | Unique trong xưởng; bấm để mở chi tiết |
| Tên bảng giá | Tên dễ hiểu cho nhân viên |
| Loại | Bảng giá chung hoặc bảng giá nhóm |
| Nhóm khách đang dùng | Danh sách nhóm khách gán bảng giá này |
| Số sản phẩm có giá | Số dòng giá đã khai báo |
| Trạng thái | Đang dùng hoặc Ngừng dùng |
| Cập nhật gần nhất | Thời gian sửa gần nhất |

---

## 5. Thao tác

| Thao tác | Hành vi |
|---|---|
| Tạo bảng giá | Tạo bảng giá mới, mặc định chưa gán nhóm khách |
| Mở chi tiết | Quản lý giá sản phẩm trong bảng |
| Đổi trạng thái | Bảng giá ngừng dùng không được gán mới cho nhóm khách |
| Gán nhóm khách | Chọn nhóm khách dùng bảng giá này |
| Cấu hình công thức | Tạo/sửa công thức gợi ý giá theo nhóm hàng khi module giá vốn đã sẵn sàng |

Quy tắc:

- Không cho tắt bảng giá chung nếu đó là bảng giá chung duy nhất.
- Nếu ngừng dùng một bảng giá đang được nhóm khách sử dụng, phải yêu cầu chọn bảng giá thay thế hoặc hủy thao tác.
- Không có chiết khấu riêng ở màn này trong Phase 1.

---

## 6. Khác KiotViet

KiotViet `Hàng hóa > Thiết lập giá` hiển thị bảng giá theo dạng lưới hàng hóa:

- chọn bảng giá ở bộ lọc bên trái, ví dụ `Bảng giá chung`
- lọc theo nhóm hàng, tồn kho, điều kiện giá bán
- bảng gồm mã hàng, tên hàng, giá vốn, giá nhập cuối, cột giá của bảng đang chọn
- ô giá có thể nhập trực tiếp trên lưới
- có import/export và ẩn hiện cột
- màn đang thấy `496 hàng hóa`

KiotViet có thể hiển thị nhiều bảng giá ngang như `BG1`, `BG2`, `BG3`. QC-OMS không dùng bố cục trải nhiều bảng giá ngang trong MVP vì dễ rối khi sản phẩm nhiều.

Export KiotViet ngày `2026-07-01` có các cột bảng giá thật:

- `Bảng giá chung`
- `25`
- `26`
- `30`
- `35`
- `40`

Các nhóm khách trong export Khách hàng cũng dùng đúng các nhãn `25`, `26`, `30`, `35`, `40`, nên QC-OMS có thể import/migrate ban đầu theo các bảng giá này. UI vẫn nên cho đặt tên dễ hiểu hơn nếu Owner đổi tên sau.

QC-OMS ưu tiên:

- danh sách bảng giá riêng
- mở một bảng giá để sửa chi tiết
- POS tự resolve giá theo khách/nhóm khách
- lịch sử 5 giá gần đây theo khách + sản phẩm là nút gợi ý trong POS, không phải 5 cột trong bảng giá

KiotViet `Khuyến mại` có dữ liệu thật dạng `Hàng hóa - Giá bán theo số lượng mua` cho một số vật tư PVC/CPVC. QC-OMS MVP không làm module khuyến mại/campaign riêng. Nếu sau này cần bán theo bậc số lượng, đặc tả lại như quy tắc giá trong PriceBook, không kéo nguyên module marketing/khuyến mại retail vào POS.

Giá vốn trong KiotViet hiển thị để tham khảo trên lưới thiết lập giá. QC-OMS cũng cần hiển thị giá vốn khi đã có dữ liệu Purchase, nhưng không cho phép sửa giá vốn trực tiếp từ bảng giá.

Export bảng giá có nhiều dòng `Bảng giá chung = 0` và một dòng giá nhóm `26 = 0`. Theo quyết định hiện tại, giá `0` là giá hợp lệ nếu được khai báo; fallback về bảng giá chung chỉ xảy ra khi dòng giá không tồn tại/để trống trong schema QC-OMS, không phải vì giá bằng `0`.

Công thức giá theo nhóm hàng là hướng cần giữ cho phase PriceBook nâng cao:

- mỗi nhóm hàng có thể có công thức riêng
- công thức có thể chọn nguồn `giá vốn bình quân` hoặc `giá vốn mới nhất`
- công thức chỉ tạo giá đề xuất/cập nhật hàng loạt khi người dùng chủ động áp dụng
- không tự đổi giá POS nếu chỉ có phiếu nhập mới làm thay đổi giá vốn

## 7. Hướng thiết kế riêng cho QC-OMS

Phần giá cần tách thành 3 lớp để đúng nghiệp vụ quảng cáo:

| Lớp | Ý nghĩa | Ví dụ |
|---|---|---|
| Giá đã lưu | Giá chính thức POS dùng khi bán | Bảng giá chung, bảng giá nhóm `25/30/35/40` |
| Công thức gợi ý | Công thức tạo giá đề xuất theo nhóm hàng | Giá vốn bình quân x hệ số + chi phí |
| Lịch sử giá khách | Giá sửa tay từng bán cho khách + sản phẩm | 5 giá gần nhất để chọn lại trong POS |

Nguyên tắc đề xuất:

- POS luôn dùng giá đã lưu trong bảng giá làm mặc định.
- Công thức không tự chạy ngầm làm đổi giá bán; người dùng phải bấm áp dụng/cập nhật.
- Công thức có thể chạy theo nhóm hàng, không bắt buộc mọi sản phẩm dùng cùng một cách tính.
- Một sản phẩm có thể cần giá theo `m2`, `m tới`, `tấm`, `cái` hoặc combo; công thức phải hiểu đúng cách bán của sản phẩm.
- Giá vốn từ nhập hàng là dữ liệu tham khảo cho công thức, không phải giá bán.
- Nếu nhân viên sửa giá trên POS, lịch sử giá theo khách + sản phẩm được lưu để gợi ý lần sau, không cập nhật ngược bảng giá.

Phần còn cần bàn/chốt trước khi implement PriceBook nâng cao:

- nhóm hàng nào cần công thức riêng
- công thức tối thiểu cho từng nhóm hàng chính
- có cần làm tròn giá theo bậc 1.000/5.000/10.000 hay không
- khi công thức ra giá mới, áp dụng ngay cho cả bảng hay chỉ tạo danh sách đề xuất để Owner duyệt
