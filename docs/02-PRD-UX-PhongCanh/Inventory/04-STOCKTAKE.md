# STOCKTAKE — UX phiếu kiểm kho

> **Trạng thái:** 🔨 Đang xây dựng
> **Nguồn tham khảo UI:** KiotViet tính năng Kiểm kho; điều chỉnh theo object-level stocktake của QC-OMS.

---

## 1. Mục đích

Màn Kiểm kho giúp người dùng:

- tạo phiếu kiểm kho
- nhập số lượng thực tế
- xem chênh lệch
- lưu tạm
- cân bằng kho
- hủy phiếu tạm

QC-OMS phải hỗ trợ kiểm kho theo tổng cho hàng thường và theo từng cuộn/tấm cho hàng cuộn/tấm.

---

## 2. Danh sách phiếu kiểm kho

```text
┌────────────────────────────────────────────────────────────────────────────────────┐
│ Kiểm kho                                               [+ Kiểm kho] [Xuất file]    │
├───────────────────────┬────────────────────────────────────────────────────────────┤
│ Tìm mã phiếu          │ Mã kiểm kho | Thời gian | Ngày cân bằng | SL lệch | ...     │
│ Thời gian tạo         │ KK000123    | ...       | ...           | +2/-1   | ...     │
│ Trạng thái            │ KK000122    | ...       |               | 0       | ...     │
│ Người tạo             │                                                            │
└───────────────────────┴────────────────────────────────────────────────────────────┘
```

### Bộ lọc

| Bộ lọc | Giá trị |
|---|---|
| Mã phiếu | Search text |
| Thời gian tạo | Hôm nay, tháng này, tùy chỉnh |
| Trạng thái | Phiếu tạm, đã cân bằng kho, đã hủy |
| Người tạo | Nhân viên |

---

## 3. Tạo/sửa phiếu kiểm kho

```text
┌────────────────────────────────────────────────────────────────────────────────────┐
│ Kiểm kho KK000123                                           [Lưu tạm] [Cân bằng]  │
├────────────────────────────────────────────────────────────────────────────────────┤
│ [Tìm hàng hóa]                                                                         │
├────────────────────────────────────────────────────────────────────────────────────┤
│ Mã hàng | Tên hàng | Loại tồn | Đối tượng | SL hệ thống | SL thực tế | Lệch | Ghi chú │
│ BAT32   | Bạt 3.2 | Cuộn     | ROLL-001  | 120.0       | 118.0     | -2   | ...     │
│ ALU01   | Alu 01  | Tấm      | SHEET-01  | 2.98        | 2.98      | 0    | ...     │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Chọn dòng kiểm kho

| Loại tồn | Hành vi UI |
|---|---|
| Hàng thường | Chọn sản phẩm, nhập `SL thực tế` theo đơn vị tồn chính |
| Cuộn | Chọn sản phẩm rồi chọn cuộn cụ thể |
| Tấm | Chọn sản phẩm rồi chọn tấm/tấm lỡ cụ thể |

Nếu người dùng chọn hàng cuộn/tấm mà chưa chọn đối tượng vật lý, dòng hiển thị lỗi inline.

---

## 5. Lưu tạm, cân bằng, hủy

### Lưu tạm

- Nút `Lưu tạm` lưu phiếu ở trạng thái `Phiếu tạm`.
- Không đổi tồn kho.
- Người dùng có thể mở lại để sửa.

### Cân bằng kho

- Nút `Cân bằng kho` mở confirm.
- Confirm hiển thị tổng số dòng lệch tăng/lệch giảm.
- Sau khi xác nhận, phiếu chuyển `Đã cân bằng kho`.
- Tồn kho cập nhật theo số thực tế.

### Hủy phiếu

- Chỉ phiếu tạm có nút hủy.
- Phiếu đã cân bằng không hiển thị nút hủy trong MVP.
- Phiếu hủy vẫn xem lại được trong danh sách.

---

## 6. Phiếu tự động khi sửa tồn hàng hóa

Khi người dùng sửa tồn hàng `normal` từ trang Hàng hóa:

- UI không mở đầy đủ màn kiểm kho.
- Sau khi xác nhận sửa tồn, hệ thống báo đã tạo phiếu kiểm kho tự động.
- Thông báo có link `Xem phiếu`.
- Phiếu có ghi chú theo mẫu nghiệp vụ.

Hàng cuộn/tấm không dùng luồng sửa tồn tổng này.

---

## 7. Acceptance Criteria UX

1. Danh sách phiếu lọc được theo trạng thái, thời gian và người tạo.
2. Phiếu tạm không làm thay đổi tồn kho.
3. Cân bằng kho có confirm trước khi ghi tồn.
4. Hàng cuộn/tấm bắt buộc chọn đối tượng vật lý.
5. Phiếu đã cân bằng không có thao tác hủy trong MVP.
6. Sửa tồn hàng thường từ Hàng hóa tạo phiếu kiểm kho tự động và có link xem phiếu.

---

← [Quay về Inventory README](./README.md)
