# 01-PRICE-LIST — Danh sách bảng giá

> **Trạng thái:** 🔨 Đang xây dựng
> **Tham khảo:** KiotViet `Hàng hóa > Thiết lập giá`

---

## 1. Mục tiêu

Trang danh sách bảng giá giúp quản lý các bảng giá đang dùng cho khách hàng và nhóm khách.

Sau khi module Purchase/Supplier có dữ liệu giá nhập, PriceBook dùng **giá nhập cuối** làm nguồn duy nhất để tính giá bán theo công thức. Không dùng giá vốn bình quân trong PriceBook MVP để tránh rườm rà. Mỗi ô giá có thể là giá nhập tay hoặc giá đang theo công thức.

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
| Tạo bảng giá | Chỉ nhập tên bảng giá; không có phạm vi áp dụng hoặc thời gian hiệu lực |
| Mở chi tiết | Quản lý giá sản phẩm trong bảng |
| Đổi trạng thái | Bảng giá ngừng dùng không được gán mới cho nhóm khách |
| Gán nhóm khách | Chọn nhóm khách dùng bảng giá này |
| Cấu hình công thức | Tạo/sửa công thức theo nhóm hàng/bộ lọc dựa trên giá nhập cuối |

Quy tắc:

- Không cho tắt bảng giá chung nếu đó là bảng giá chung duy nhất.
- Nếu ngừng dùng một bảng giá đang được nhóm khách sử dụng, phải yêu cầu chọn bảng giá thay thế hoặc hủy thao tác.
- Tạo bảng giá không bắt buộc nhập công thức. Người dùng có thể nhập giá tay trước, hoặc vào chi tiết bảng giá để gắn công thức sau.
- Không có `ngày bắt đầu`, `ngày kết thúc`, `hiệu lực theo thời gian` trong MVP. Khi cần đổi giá theo mùa/đợt, tạo hoặc sửa bảng giá trực tiếp.
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

KiotViet hiển thị cả `Giá vốn` và `Giá nhập cuối` trên lưới thiết lập giá. Popup tạo bảng giá của KiotViet cũng đi theo kiểu đơn giản: chọn một nguồn giá rồi cộng/trừ số tiền hoặc phần trăm. QC-OMS giữ tinh thần đơn giản đó, nhưng MVP chỉ giữ `Giá nhập cuối` làm cột cố định để tính giá; bỏ cột/nguồn `Giá vốn` khỏi công thức PriceBook để thao tác đơn giản hơn.

Export bảng giá có nhiều dòng `Bảng giá chung = 0` và một dòng giá nhóm `26 = 0`. Quy tắc mới sau Owner bổ sung:

- Với bảng giá chung, giá `0` vẫn là giá đã khai báo từ dữ liệu import; không fallback chỉ vì falsy.
- Với bảng giá nhóm khách, giá `0` là một tín hiệu nghiệp vụ có chủ ý: bán theo `giá nhập gần nhất` của sản phẩm cho khách thuộc nhóm/bảng giá đó.
- Fallback về bảng giá chung chỉ xảy ra khi dòng giá không tồn tại/để trống, không phải vì giá bằng `0`.

Nói cách khác, `0` không còn được hiểu chung chung là "miễn phí" trong bảng giá nhóm. Nếu sau này thật sự cần bán miễn phí/tặng hàng, xử lý bằng giá sửa tay/chiết khấu trên POS hoặc một rule riêng, không lẫn với bảng giá nhóm.

## 7. Hướng thiết kế riêng cho QC-OMS

Phần giá cần tách thành 3 lớp để đúng nghiệp vụ quảng cáo:

| Lớp | Ý nghĩa | Ví dụ |
|---|---|---|
| Giá tay | Giá cố định do người dùng nhập trực tiếp | Bảng giá chung, bảng giá nhóm `25/30/35/40` |
| Giá theo công thức | Giá đang được tính động theo công thức đã gắn cho sản phẩm/bộ lọc | Giá nhập cuối + chi phí + lợi nhuận |
| Lịch sử giá khách | Giá sửa tay từng bán cho khách + sản phẩm | 5 giá gần nhất để chọn lại trong POS |

Nguyên tắc:

- POS dùng giá hiệu lực của ô bảng giá: nếu là giá tay thì lấy giá tay; nếu là giá theo công thức thì tính theo `giá nhập cuối` mới nhất.
- Công thức chỉ dùng `giá nhập cuối`, không chọn giá vốn bình quân.
- Khi giá nhập cuối thay đổi, giá theo công thức thay đổi theo. Hệ thống phải ghi nhớ ô giá đang theo công thức nào cho tới khi người dùng nhập giá tay hoặc áp công thức khác.
- Khi người dùng nhập giá trực tiếp vào ô giá, ô đó chuyển sang `giá tay` và không còn tự đổi theo công thức.
- Khi người dùng áp công thức khác cho cùng ô/bộ lọc, công thức mới thay công thức cũ.
- Giá cuối luôn làm tròn lên theo `1,000đ`; không cần UI chọn cách làm tròn.
- Nếu nhân viên sửa giá trên POS, lịch sử giá theo khách + sản phẩm được lưu để gợi ý lần sau, không cập nhật ngược bảng giá.

## 8. Công thức giá đơn giản theo cột

QC-OMS tham khảo lưới KiotViet: cột cố định bên trái và ô giá có thể nhập trực tiếp. Công thức cũng gần cách KiotViet cho cộng/trừ số tiền hoặc phần trăm, nhưng được tách rõ thành `Chi phí`, `Lợi nhuận` và điều chỉnh từng bảng giá để phù hợp xưởng quảng cáo. QC-OMS không làm kiểu Excel tự do.

Các cột cố định:

```text
Mã hàng | Tên hàng | Giá nhập cuối | Chi phí | Lợi nhuận | Bảng giá chung | 25 | 26 | 30 | 35 | 40
```

Trong đó:

- `Mã hàng`, `Tên hàng`, `Giá nhập cuối` là chỉ đọc.
- `Chi phí` và `Lợi nhuận` có thể bấm vào để nhập cấu hình.
- Các cột bảng giá chỉ cho cộng thêm số tiền hoặc phần trăm so với kết quả trước đó.

### Công thức tổng

```text
Giá tạm = Giá nhập cuối + Chi phí + Lợi nhuận
Giá từng bảng = Giá tạm + Điều chỉnh bảng giá
Giá cuối = làm tròn lên 1,000đ
```

Không còn khái niệm `Giá nền` riêng trong UI. Về mặt tính toán, `Giá nhập cuối + Chi phí` chính là phần trước lợi nhuận, nhưng nhân viên chỉ thấy 2 cột dễ hiểu: `Chi phí` và `Lợi nhuận`.

### Cột Chi phí

Khi bấm vào ô `Chi phí`, người dùng chọn một trong hai kiểu:

| Kiểu | Cách nhập | Ví dụ |
|---|---|---|
| Giá cố định | Nhập một số tiền cụ thể | `+ 15,000đ` |
| Công thức | `+ số tiền` và/hoặc `+ % giá nhập cuối` | `+ 5,000đ + 8%` |

Rule:

- Chi phí không có điều kiện nhỏ/lớn/bằng trong MVP.
- Chi phí chỉ có cộng tiền và cộng phần trăm.
- Nếu không nhập chi phí thì hiểu là `0`.

Ví dụ:

```text
Giá nhập cuối: 100,000
Chi phí: +5,000 + 8%
Chi phí tính ra: 13,000
```

### Cột Lợi nhuận

Khi bấm vào ô `Lợi nhuận`, người dùng chọn một trong hai kiểu:

| Kiểu | Cách nhập | Ví dụ |
|---|---|---|
| Giá cố định | Nhập một số tiền cụ thể | `+ 40,000đ` |
| Công thức điều kiện | Theo bậc `nhỏ hơn / lớn hơn / bằng` | Nếu giá nhập cuối <= 100,000 thì +25,000 |

Rule điều kiện chỉ cần hỗ trợ:

- `<`
- `<=`
- `>`
- `>=`
- `=`
- khoảng `từ ... đến ...`

Mỗi dòng điều kiện trả ra một giá trị lợi nhuận dạng:

- `+ số tiền`
- hoặc `+ % giá nhập cuối`
- hoặc `+ số tiền + % giá nhập cuối`

Không cho nhập công thức tự do `+ - x /` ở MVP để tránh khó dùng và khó kiểm soát.

Ví dụ lợi nhuận nhóm Fom:

```text
Nếu giá nhập cuối <= 100,000: +25,000
Nếu giá nhập cuối > 100,000 và <= 200,000: +40,000
Nếu giá nhập cuối > 200,000 và <= 400,000: +60,000
Nếu giá nhập cuối > 400,000: +90,000
```

### Cột bảng giá

Khi bấm vào một cột bảng giá, chỉ cho chọn:

| Kiểu | Ví dụ |
|---|---|
| Cộng/trừ số tiền | `+20,000đ`, `-5,000đ` |
| Cộng/trừ phần trăm | `+10%`, `-5%` |

Không cho điều kiện ở cột bảng giá trong MVP. Điều kiện nằm ở `Lợi nhuận`, còn bảng giá chỉ là điều chỉnh cuối cùng cho nhóm khách.

Ví dụ:

```text
Bảng giá chung: +20,000
25: +0
30: -5,000
35: -10,000
40: -15,000
```

### Gán công thức theo bộ lọc đã lưu

Người dùng có thể lọc sản phẩm rồi bấm `Tạo công thức cho bộ lọc này`.

Đề xuất điều kiện lọc:

| Điều kiện | Khuyến nghị |
|---|---|
| Nhóm hàng | Điều kiện chính |
| Tên hàng chứa từ khóa | Điều kiện phụ, dùng để lọc nhanh theo cách nhân viên quen tìm |
| Mã hàng chứa từ khóa | Điều kiện phụ, dùng khi mã hàng đã có quy ước rõ |
| Đơn vị/cách bán | Điều kiện phụ |

Không nên gán công thức chỉ bằng tên hoặc mã nếu có thể gắn nhóm hàng. Ví dụ lọc tên chứa `fom 5mm` dùng được, nhưng nên kết hợp với nhóm hàng `Fomex` để tránh bắt nhầm sản phẩm.

Quy tắc ưu tiên nếu nhiều công thức cùng khớp một sản phẩm:

1. Công thức gắn trực tiếp cho sản phẩm.
2. Công thức theo nhóm hàng + điều kiện phụ.
3. Công thức mặc định của nhóm hàng.
4. Không có công thức thì giữ giá đã lưu/nhập tay.

### Giá theo công thức tự cập nhật khi giá nhập cuối thay đổi

Khi phiếu nhập làm thay đổi `giá nhập cuối`, hệ thống phải tính lại được giá theo công thức đang lưu.

Mặc định:

- ô giá đang theo công thức tự cho ra giá mới khi POS/PriceBook đọc dữ liệu
- hệ thống vẫn nên hiển thị chênh lệch để Owner biết giá nào vừa đổi theo giá nhập
- không cần bấm áp dụng lại chỉ vì `giá nhập cuối` thay đổi
- nếu muốn dừng biến động theo công thức, người dùng nhập giá tay vào ô đó
- nếu muốn đổi cách tính, người dùng áp công thức khác cho ô/bộ lọc đó

Riêng rule bảng giá nhóm có giá `0` lấy theo `giá nhập gần nhất` là rule đọc động khi POS resolve giá. Khi giá nhập gần nhất thay đổi, POS có thể lấy giá nhập mới nhất ở lần bán sau mà không cần ghi đè lại ô giá `0`. Nếu sản phẩm chưa có giá nhập gần nhất, POS giữ giá `0` và không cần cảnh báo.

### Preview trước khi gắn công thức hàng loạt

Khi gắn công thức cho nhiều sản phẩm theo bộ lọc, phải có màn xem trước:

- giá hiện tại
- chế độ hiện tại: giá tay hay công thức
- giá nhập cuối
- chi phí tính ra
- lợi nhuận tính ra
- điều chỉnh bảng giá
- giá mới sau làm tròn
- chênh lệch
- công thức sắp gắn
- checkbox chọn dòng cần gắn công thức

Chỉ khi bấm `Gắn công thức`, các ô được chọn mới chuyển sang chế độ giá theo công thức. Từ đó về sau các ô này tự tính theo `giá nhập cuối` cho tới khi bị nhập giá tay hoặc gắn công thức khác.

### Trạng thái chốt

Đã chốt:

- PriceBook MVP chỉ dùng `giá nhập cuối` để tính công thức, không dùng giá vốn bình quân.
- Tạo bảng giá chỉ cần tên; không có phạm vi áp dụng hoặc thời gian hiệu lực.
- Không có UI chọn làm tròn; luôn làm tròn lên `1,000đ`.
- Không dùng `Giá nền` như một nhóm riêng trong UI; thay bằng `Chi phí` và `Lợi nhuận`.
- `Chi phí` chọn một trong hai kiểu: giá cố định hoặc công thức `+ số tiền + %`.
- `Lợi nhuận` chọn một trong hai kiểu: giá cố định hoặc công thức điều kiện theo giá nhập cuối.
- Cột bảng giá chỉ cộng/trừ số tiền hoặc phần trăm.
- Ô giá có thể là giá tay hoặc giá theo công thức.
- Giá nhập cuối thay đổi thì ô giá theo công thức tự ra giá mới.
- Ô giá nhớ công thức đang áp dụng cho tới khi người dùng nhập giá tay hoặc gắn công thức khác.
