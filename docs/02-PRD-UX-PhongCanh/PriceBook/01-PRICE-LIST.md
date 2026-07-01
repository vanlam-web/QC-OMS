# 01-PRICE-LIST — Danh sách bảng giá

> **Trạng thái:** 🔨 Đang xây dựng  
> **Tham khảo:** KiotViet `Hàng hóa > Thiết lập giá`

---

## 1. Mục tiêu

Trang danh sách bảng giá giúp quản lý các bảng giá đang dùng cho khách hàng và nhóm khách.

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

QC-OMS ưu tiên:

- danh sách bảng giá riêng
- mở một bảng giá để sửa chi tiết
- POS tự resolve giá theo khách/nhóm khách
- lịch sử 5 giá gần đây theo khách + sản phẩm là nút gợi ý trong POS, không phải 5 cột trong bảng giá

KiotViet `Khuyến mại` có dữ liệu thật dạng `Hàng hóa - Giá bán theo số lượng mua` cho một số vật tư PVC/CPVC. QC-OMS MVP không làm module khuyến mại/campaign riêng. Nếu sau này cần bán theo bậc số lượng, đặc tả lại như quy tắc giá trong PriceBook, không kéo nguyên module marketing/khuyến mại retail vào POS.
