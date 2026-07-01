# 02-PRICE-LIST-DETAIL — Chi tiết bảng giá

> **Trạng thái:** 🔨 Đang xây dựng

---

## 1. Mục tiêu

Trang chi tiết bảng giá cho phép xem và sửa giá bán theo lưới sản phẩm, đồng thời cấu hình công thức đơn giản cho `Chi phí`, `Lợi nhuận` và điều chỉnh theo từng bảng giá.

---

## 2. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Bảng giá: Đại lý                       [Lưu] [Ngừng dùng] [Thêm sản phẩm]   │
│ Mã: BG_DAILY                           Nhóm dùng: Đại lý, Khách quen        │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Theo mã/tên hàng...] [Nhóm hàng] [Trạng thái hàng] [Tạo CT cho bộ lọc]      │
│                                                                              │
│ Mã hàng | Tên hàng | Giá nhập cuối | Chi phí | Lợi nhuận | Chung | 25 | 30...│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Cột bảng

| Cột | Mô tả |
|---|---|
| Mã hàng | Mã sản phẩm |
| Tên hàng | Tên sản phẩm |
| Giá nhập cuối | Cột cố định, chỉ đọc, lấy từ lần nhập mua gần nhất |
| Chi phí | Bấm vào để nhập giá cố định hoặc công thức chi phí |
| Lợi nhuận | Bấm vào để nhập giá cố định hoặc công thức lợi nhuận có điều kiện |
| Bảng giá chung | Điều chỉnh cuối cùng cho bảng giá chung |
| Bảng giá nhóm `25/26/30/35/40` | Điều chỉnh cuối cùng cho từng bảng giá nhóm |
| Trạng thái hàng | Đang bán hoặc ngưng bán |

Các cột cố định tối thiểu là `Mã hàng`, `Tên hàng`, `Giá nhập cuối`. Các cột còn lại có thể cuộn ngang nếu màn hình nhỏ.

Gợi ý từ KiotViet: lưới thiết lập giá có cột mã hàng, tên hàng, giá nhập cuối và ô giá nhập trực tiếp. QC-OMS giữ cách thao tác trên lưới, nhưng bỏ nguồn `Giá vốn` để đơn giản.

---

## 4. Quy tắc nhập giá

- Giá phải là số không âm.
- Với sản phẩm bán theo `m tới`, giá là giá cho `1 m tới`.
- Với sản phẩm bán theo `m2`, giá là giá cho `1 m2`.
- Với sản phẩm bán theo số lượng, giá là giá cho một đơn vị bán.
- Nếu bảng giá nhóm không có giá cho sản phẩm, POS fallback về bảng giá chung.
- Sản phẩm ngưng bán vẫn có thể thấy trong bảng giá khi bật bộ lọc trạng thái, nhưng không xuất hiện trong POS.
- Với bảng giá nhóm khách, nếu nhập giá `0`, hệ thống hiểu là `Theo giá nhập gần nhất` cho sản phẩm đó trong bảng giá nhóm này.
- Với bảng giá chung, giá `0` giữ nguyên là dữ liệu import/giá đã khai báo; không tự chuyển thành fallback.

---

## 5. Thêm sản phẩm vào bảng giá

Khi bấm **Thêm sản phẩm**:

- Tìm theo mã hoặc tên sản phẩm.
- Mặc định chỉ hiện sản phẩm đang bán.
- Có tùy chọn hiện sản phẩm ngưng bán để chỉnh dữ liệu cũ.
- Nếu sản phẩm đã có trong bảng giá, không thêm trùng; focus về dòng hiện có.

---

## 6. Lưu thay đổi

Khi bấm **Lưu**:

- Kiểm tra giá hợp lệ.
- Lưu toàn bộ dòng thay đổi.
- Hiển thị thông báo số dòng đã cập nhật.
- Không tự ghi vào lịch sử giá theo khách + sản phẩm.

Lịch sử giá theo khách + sản phẩm chỉ phát sinh khi POS lưu chứng từ bán có giá sửa tay.

Nếu người dùng thoát trang khi còn dòng giá chưa lưu, UI phải cảnh báo mất thay đổi.

Nếu một sản phẩm trong bảng giá chung có giá bằng `0`, POS vẫn dùng đúng giá `0` nếu đó là giá được khai báo. Trường hợp muốn fallback về bảng giá chung phải để dòng giá trống/không khai báo, không dùng `0` làm tín hiệu fallback.

Nếu một sản phẩm trong bảng giá nhóm khách có giá bằng `0`, POS không hiểu là miễn phí. POS lấy `giá nhập gần nhất` làm giá mặc định cho khách thuộc nhóm/bảng giá đó. Nếu chưa có giá nhập gần nhất thì giá mặc định vẫn là `0` và không cần cảnh báo. UI nên hiển thị badge hoặc text rõ, ví dụ:

```text
0 -> Theo giá nhập gần nhất, chưa có thì 0
```

Màn này có thao tác cập nhật/gợi ý giá từ công thức theo nhóm hàng/bộ lọc. Công thức chỉ lấy `giá nhập cuối`, sau đó tính `Chi phí`, `Lợi nhuận` và điều chỉnh theo từng bảng giá.

Giá cuối luôn làm tròn lên `1,000đ`. UI không cần hiển thị lựa chọn làm tròn.

Khi giá nhập cuối thay đổi, hệ thống tính lại giá theo công thức và hiển thị chênh lệch. Mặc định người dùng phải bấm áp dụng thì giá đã lưu trong bảng giá mới thay đổi; POS chỉ dùng giá đã lưu.

### 6.1. Cột Chi phí

Khi bấm vào ô `Chi phí`, người dùng chọn một trong hai kiểu:

| Kiểu | Cách nhập | Ví dụ |
|---|---|---|
| Giá cố định | Nhập số tiền | `+ 15,000đ` |
| Công thức | Nhập `+ số tiền` và/hoặc `+ % giá nhập cuối` | `+ 5,000đ + 8%` |

Chi phí không có điều kiện trong MVP.

### 6.2. Cột Lợi nhuận

Khi bấm vào ô `Lợi nhuận`, người dùng chọn một trong hai kiểu:

| Kiểu | Cách nhập | Ví dụ |
|---|---|---|
| Giá cố định | Nhập số tiền | `+ 40,000đ` |
| Công thức điều kiện | Theo bậc giá nhập cuối | Nếu giá nhập cuối <= 100,000 thì +25,000 |

Điều kiện hỗ trợ:

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

### 6.3. Cột bảng giá

Khi bấm vào cột `Bảng giá chung`, `25`, `26`, `30`, `35`, `40`, chỉ cho nhập:

- cộng/trừ số tiền
- hoặc cộng/trừ phần trăm

Không có điều kiện ở cột bảng giá trong MVP. Điều kiện nằm ở `Lợi nhuận`.

Ví dụ:

```text
Bảng giá chung: +20,000đ
25: +0đ
30: -5,000đ
35: -10,000đ
40: -15,000đ
```

### 6.4. Ví dụ Fom

```text
Áp dụng cho: Nhóm hàng Fom
Giá nhập cuối: 100,000

Chi phí: +5,000 + 8% = 13,000

Lợi nhuận:
- Nếu giá nhập cuối <= 100,000: +25,000
- Nếu giá nhập cuối > 100,000 và <= 200,000: +40,000
- Nếu giá nhập cuối > 200,000: +60,000

Giá tạm = 100,000 + 13,000 + 25,000 = 138,000

Bảng giá chung: 138,000 + 20,000 = 158,000
25: 138,000 + 0 = 138,000
30: 138,000 - 5,000 = 133,000
40: 138,000 - 15,000 = 123,000
```

### 6.5. Gán công thức theo bộ lọc

Trong màn chi tiết bảng giá, người dùng có thể lọc danh sách sản phẩm rồi bấm `Tạo công thức cho bộ lọc này`.

Bộ lọc được lưu thành một rule công thức. Đề xuất UI:

```text
[Nhóm hàng: Fomex] [Tên/mã chứa: 5mm] [Cách bán: tấm]
    -> [Tạo công thức cho bộ lọc này]
```

Khi lưu rule, hệ thống lưu:

- tên công thức dễ hiểu
- điều kiện lọc sản phẩm
- cấu hình `Chi phí`
- cấu hình `Lợi nhuận`
- điều chỉnh từng bảng giá
- trạng thái active/inactive của công thức

Đề xuất để dễ vận hành:

- Nhóm hàng nên là điều kiện chính khi tạo công thức.
- Tên/mã hàng chỉ dùng để thu hẹp trong nhóm hàng, không nên là điều kiện duy nhất.
- Nếu cần rất đặc biệt, cho phép gắn công thức trực tiếp cho một vài sản phẩm.
- Khi sản phẩm mới được tạo và khớp bộ lọc công thức, lần chạy công thức sau sẽ đưa sản phẩm đó vào danh sách đề xuất.

Nếu nhiều công thức cùng khớp một sản phẩm, dùng ưu tiên:

1. công thức gắn trực tiếp sản phẩm
2. công thức nhóm hàng có nhiều điều kiện cụ thể hơn
3. công thức mặc định nhóm hàng

Trước khi áp dụng hàng loạt, màn preview phải hiển thị giá hiện tại, giá nhập cuối, chi phí, lợi nhuận, điều chỉnh bảng giá, giá đề xuất và chênh lệch.

Vì Owner đã xác nhận cách giá của KiotViet chưa đúng mong muốn, màn chi tiết bảng giá không được khóa thiết kế theo lưới export KiotViet. KiotViet chỉ dùng để import dữ liệu ban đầu và đối chiếu nhóm giá hiện có. Luồng chuẩn của QC-OMS cần ưu tiên:

- sửa giá chính thức nhanh cho từng bảng giá
- thấy giá nhập cuối để tham khảo và tính giá
- có nút tính/gợi ý lại giá theo công thức khi Owner chủ động dùng
- phân biệt rõ giá đã lưu và giá đề xuất chưa áp dụng
- giữ lịch sử thay đổi giá để biết ai sửa và sửa lúc nào
- xem được công thức nào đang áp dụng cho dòng/nhóm hàng

---

## 7. Tác động tới POS

- Dòng hàng mới trên POS dùng giá mới sau khi bảng giá được lưu.
- Dòng hàng đang mở trong POS và chưa sửa giá thủ công có thể được tính lại khi đổi khách/bảng giá hoặc reload dữ liệu.
- Dòng đã sửa giá thủ công trong POS không bị đè bởi thay đổi bảng giá.
