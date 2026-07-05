# ROLL-SHEET-OBJECTS — Quản lý cuộn, tấm và tấm lỡ


---

## 1. Mục đích

Màn này giúp quản lý tồn kho theo đối tượng vật lý:

- cuộn vật tư
- tấm nguyên
- tấm dở
- tấm lỡ/tấm thừa

Đây là điểm khác lớn giữa QC-OMS và KiotViet, vì QC-OMS không quản lý cuộn bằng tổng m2 gộp.

---

## 2. Cách mở màn

Người dùng có thể mở từ:

- dòng sản phẩm trong danh sách hàng hóa
- tab `Tồn theo cuộn/tấm`
- chi tiết sản phẩm
- phiếu kiểm kho khi cần chọn đối tượng vật lý

Nếu sản phẩm được import từ KiotViet và chưa chuẩn hóa tồn vật lý, màn này phải hiển thị trạng thái rõ ràng:

```text
Tồn KiotViet tạm: 128m2
Tồn cuộn/tấm đã chuẩn hóa: chưa đủ dữ liệu
```

Mục tiêu là cho phép dùng hệ thống trước, rồi chuẩn hóa kho dần khi có thời gian kiểm lại từng cuộn/tấm.

---

## 3. Bố cục

```text
┌────────────────────────────────────────────────────────────────────────────────────┐
│ Tồn chi tiết: Bạt Hiflex 3.2m                         [+ Thêm cuộn] [Xuất file]   │
├───────────────────────┬────────────────────────────────────────────────────────────┤
│ Sản phẩm              │ Tabs: Cuộn | Tấm | Tấm lỡ | Lịch sử kho                   │
│ [Bạt Hiflex 3.2m]     ├────────────────────────────────────────────────────────────┤
│ Trạng thái            │ Mã | Khổ/Kích thước | Còn lại | Trạng thái | Nguồn | ...   │
│ [Đang dùng v]         │ R001 | 3.2m x 45m    | 144m2   | đang dùng  | nhập | ...   │
│ Kích thước/khổ        │ R002 | 2.6m x 12m    | 31.2m2  | còn dùng   | nhập | ...   │
└───────────────────────┴────────────────────────────────────────────────────────────┘
```

---

## 4. Tab Cuộn

### Cột chính

| Cột | Ghi chú |
|---|---|
| Mã cuộn | Link mở chi tiết cuộn |
| Khổ rộng | Mét |
| Dài ban đầu | Mét |
| Dài còn lại | Mét |
| Diện tích còn lại | m2 |
| Trạng thái | còn dùng, đang dùng, hết, hủy |
| Ghi chú | Ghi chú nhập/sửa |

### Thao tác

- Thêm cuộn
- Khui vật tư từ POS Top Bar
- Sửa cuộn
- Đổi trạng thái
- Xem lịch sử biến động của cuộn

Khi sửa chiều dài/diện tích còn lại, UI bắt buộc nhập lý do.

Khi thao tác `Khui vật tư` tạo hoặc cập nhật cuộn, màn này phải hiển thị được nguồn thay đổi trong lịch sử cuộn. Nếu cuộn cũ còn lại được nhập lớn hơn `0`, cuộn đó vẫn còn dùng. Nếu nhập `0`, cuộn đó chuyển hết/bỏ theo rule nghiệp vụ và không tạo object rác.

### Chuẩn hóa cuộn từ tồn KiotViet tạm

Với hàng cuộn đã import tồn tổng từ KiotViet, người dùng có thể:

- thêm cuộn thật đang còn trong kho
- nhập chiều dài còn lại theo mét tới, có thể là số ước lượng ban đầu
- ghi chú nguồn kiểm: kiểm kho, khui vật tư, nhân viên đo lại
- đánh dấu một phần tồn tạm đã được chuẩn hóa vào các cuộn này
- đưa cuộn về `hết` khi khui/xuất đến 0
- sửa lại chiều dài còn lại nếu sau này đo chính xác hơn

UI không bắt người dùng phải tạo đủ tất cả cuộn ngay trong ngày import. Các cuộn/tấm thật được bổ sung dần, và tổng tồn tạm giảm dần theo các lần chuẩn hóa/khui vật tư.

---

## 5. Tab Tấm/Tấm lỡ

### Cột chính

| Cột | Ghi chú |
|---|---|
| Mã tấm | Link mở chi tiết |
| Loại | tấm nguyên, tấm dở, tấm lỡ |
| Kích thước | rộng x dài |
| Diện tích | m2 |
| Trạng thái | available, used, discarded |
| Nguồn | đơn/dòng đơn tạo tấm lỡ nếu có |
| Ghi chú | Ghi chú |

### Thao tác

- Thêm tấm/tấm lỡ thủ công
- Khui vật tư từ POS Top Bar
- Sửa kích thước
- Bỏ tấm lỡ
- Khôi phục/sửa tấm lỡ nếu còn dùng được
- Xem lịch sử

Tấm lỡ dưới `0.3m2` mặc định không tự tạo, nhưng người dùng có thể tạo thủ công nếu muốn giữ lại.

Khi `Khui vật tư` ghi nhận phần tấm cũ còn lại, màn này hiển thị phần còn lại theo `full`, `in_use` hoặc `remnant`. Phần m tới dưới `0.2m` hoặc rẻo nhỏ chỉ được đề xuất bỏ; nếu nhân viên giữ lại, vẫn phải tạo object để dùng tiếp.

---

## 6. Modal đề xuất cuộn/tấm

Khi thao tác từ POS hoặc khi kiểm tra khả năng xuất vật tư, UI có thể mở modal đề xuất:

```text
┌────────────────────────────────────────────────────────────┐
│ Đề xuất vật tư                                             │
├────────────────────────────────────────────────────────────┤
│ Kích thước cần dùng: 2.5 x 2.05m                           │
│ Biên chừa: rộng 0.1m, dài 0.1m                             │
│                                                            │
│ Đề xuất                                                     │
│ 1. Cuộn khổ 2.6m - hao hụt thấp nhất                       │
│ 2. Cuộn khổ 3.2m - còn nhiều hơn                           │
│                                                            │
│ [Chọn] [Sửa biên] [Chọn cuộn khác]                         │
└────────────────────────────────────────────────────────────┘
```

Nhân viên được override đề xuất. UI phải hiển thị rõ đâu là đề xuất và đâu là lựa chọn thực tế.

---

## 7. Acceptance Criteria UX

1. Người dùng xem được từng cuộn/tấm thay vì chỉ tổng m2.
2. Cuộn hiển thị rõ khổ, chiều dài còn lại và diện tích còn lại.
3. Tấm/tấm lỡ hiển thị rõ kích thước và trạng thái.
4. Sửa tồn đối tượng bắt buộc có lý do nếu làm thay đổi số lượng/diện tích.
5. Tấm lỡ có thao tác sửa/bỏ thủ công.
6. Đề xuất cuộn/tấm không tự trừ kho cho đến khi nghiệp vụ gốc xác nhận.
7. Hàng import từ KiotViet chưa chuẩn hóa phải nhìn thấy phần tồn tạm và phần tồn vật lý đã tạo.
8. Người dùng chuẩn hóa dần được từng cuộn/tấm, không bị bắt hoàn tất toàn bộ kho ngay sau import.
9. Lịch sử cuộn/tấm nhìn thấy thay đổi đến từ thao tác `Khui vật tư`.

---

← [Quay về Inventory README](./README.md)
