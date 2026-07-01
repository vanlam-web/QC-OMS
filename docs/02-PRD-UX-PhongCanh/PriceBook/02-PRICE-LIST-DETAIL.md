# 02-PRICE-LIST-DETAIL — Chi tiết bảng giá

> **Trạng thái:** 🔨 Đang xây dựng

---

## 1. Mục tiêu

Trang chi tiết bảng giá cho phép xem và sửa giá bán của từng sản phẩm trong một bảng giá.

---

## 2. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Bảng giá: Đại lý                       [Lưu] [Ngừng dùng] [Thêm sản phẩm]   │
│ Mã: BG_DAILY                           Nhóm dùng: Đại lý, Khách quen        │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Theo mã/tên hàng...] [Nhóm hàng] [Trạng thái hàng]                         │
│                                                                              │
│ Mã hàng | Tên hàng | Đơn vị bán | Giá vốn | Giá bảng giá chung | Giá bảng này│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Cột bảng

| Cột | Mô tả |
|---|---|
| Mã hàng | Mã sản phẩm |
| Tên hàng | Tên sản phẩm |
| Đơn vị bán | m2, m tới, tấm, cái, bộ... |
| Cách tính bán | Theo số lượng, m2, m tới, tấm, combo |
| Giá vốn | Chỉ đọc nếu có dữ liệu |
| Giá bảng giá chung | Chỉ đọc để đối chiếu nếu đang sửa bảng giá nhóm |
| Giá bảng này | Ô nhập giá áp dụng cho bảng hiện tại |
| Trạng thái hàng | Đang bán hoặc ngưng bán |

Gợi ý từ KiotViet: có thể cho nhập giá trực tiếp trên lưới để thao tác nhanh, nhưng mỗi màn chỉ nên tập trung một bảng giá đang sửa. Không trải nhiều bảng giá nhóm thành nhiều cột ngang trong QC-OMS MVP.

---

## 4. Quy tắc nhập giá

- Giá phải là số không âm.
- Với sản phẩm bán theo `m tới`, giá là giá cho `1 m tới`.
- Với sản phẩm bán theo `m2`, giá là giá cho `1 m2`.
- Với sản phẩm bán theo số lượng, giá là giá cho một đơn vị bán.
- Nếu bảng giá nhóm không có giá cho sản phẩm, POS fallback về bảng giá chung.
- Sản phẩm ngưng bán vẫn có thể thấy trong bảng giá khi bật bộ lọc trạng thái, nhưng không xuất hiện trong POS.

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

Nếu một sản phẩm có giá bằng `0`, POS vẫn dùng đúng giá `0` nếu đó là giá được khai báo. Trường hợp muốn fallback về bảng giá chung phải để dòng giá trống/không khai báo, không dùng `0` làm tín hiệu fallback.

---

## 7. Tác động tới POS

- Dòng hàng mới trên POS dùng giá mới sau khi bảng giá được lưu.
- Dòng hàng đang mở trong POS và chưa sửa giá thủ công có thể được tính lại khi đổi khách/bảng giá hoặc reload dữ liệu.
- Dòng đã sửa giá thủ công trong POS không bị đè bởi thay đổi bảng giá.
