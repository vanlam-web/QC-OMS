# ROLL-SHEET-OBJECTS — Quản lý cuộn, tấm và tấm lỡ

> **Trạng thái:** 🔨 Đang xây dựng

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
- Sửa cuộn
- Đổi trạng thái
- Xem lịch sử biến động của cuộn

Khi sửa chiều dài/diện tích còn lại, UI bắt buộc nhập lý do.

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
- Sửa kích thước
- Bỏ tấm lỡ
- Khôi phục/sửa tấm lỡ nếu còn dùng được
- Xem lịch sử

Tấm lỡ dưới `0.3m2` mặc định không tự tạo, nhưng người dùng có thể tạo thủ công nếu muốn giữ lại.

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

---

← [Quay về Inventory README](./README.md)
