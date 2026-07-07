# INVENTORY-LAYOUT — Bố cục tổng thể Kho/Hàng hóa

> **Nguồn tham khảo UI:** KiotViet trang Hàng hóa ở viewport desktop rộng.

---

## 1. Mục đích

Module Kho/Hàng hóa giúp nhân viên:

- tìm và xem danh sách hàng hóa
- xem tồn kho theo trạng thái
- xử lý hàng đang kinh doanh/ngưng bán
- mở chi tiết tồn theo hàng thường/cuộn/tấm
- tạo và cân bằng phiếu kiểm kho

QC-OMS giữ tinh thần thao tác nhanh của KiotViet: menu module ở trên, bộ lọc bên trái, bảng dữ liệu lớn bên phải, toolbar thao tác phía trên bảng.

Điểm khác chính: QC-OMS phải hỗ trợ tồn kho theo **cuộn vật lý** và **tấm/tấm lỡ**, nên không chỉ có một cột tổng tồn.

---

## 2. Bố cục desktop

```text
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ Top navigation: Tổng quan | Hàng hóa | Mua hàng | Đơn hàng | Khách hàng | Sổ quỹ | ...     │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ Hàng hóa                                         [Tìm mã/tên hàng] [Tạo mới] [Import] ...  │
├───────────────────────┬────────────────────────────────────────────────────────────────────┤
│ FILTER SIDEBAR        │ DATA WORKSPACE                                                     │
│                       │                                                                    │
│ Nhóm hàng             │ Tabs/Segment: Tất cả | Hàng thường | Cuộn | Tấm | Tồn âm          │
│ Tồn kho               │                                                                    │
│ Trạng thái hàng hóa   │ Table: checkbox | mã | tên | loại tồn | giá | tồn | đặt | ...      │
│ Loại tồn              │                                                                    │
│ Thời gian tạo         │ Row actions: xem chi tiết | sửa | mở tồn đối tượng | kiểm kho      │
│ Nhà cung cấp          │                                                                    │
│ ...                   │ Pagination / export / column settings                               │
└───────────────────────┴────────────────────────────────────────────────────────────────────┘
```

---

## 3. Nguyên tắc layout

- Desktop ưu tiên bảng rộng, dễ quét nhiều dòng.
- Sidebar lọc nằm bên trái, không mở thành modal trên desktop.
- Toolbar chính nằm cùng hàng với search để thao tác nhanh.
- Cột bảng phải giữ ổn định, không nhảy layout khi dữ liệu dài.
- Với màn hẹp, sidebar có thể thu gọn thành nút lọc; không dùng viewport hẹp của browser làm chuẩn desktop.
- Không đưa hướng dẫn dài trong màn hình; trạng thái và hành động phải rõ qua nhãn nút, icon và tooltip.

---

## 4. Navigation chính

Trong module `Hàng hóa/Kho`, các view MVP:

| View | Mục đích |
|---|---|
| Danh sách hàng hóa | Xem, tìm, lọc và mở chi tiết tồn |
| Tồn theo cuộn/tấm | Quản lý đối tượng vật lý của hàng cuộn/tấm |
| Kiểm kho | Tạo, lưu tạm, cân bằng và hủy phiếu kiểm kho |
| Stock movement | Xem lịch sử biến động tồn kho |

MVP có thể gom các view này dưới cùng module Hàng hóa, dùng tab hoặc navigation phụ.

---

## 5. Trạng thái chung

| Trạng thái | UI |
|---|---|
| Loading | Skeleton cho sidebar và table, không dùng spinner che toàn màn hình |
| Empty | Hiển thị trạng thái trống trong vùng bảng; nhân viên nội bộ MVP thấy nút tạo mới/thao tác chính |
| Filter empty | Báo không có kết quả với bộ lọc hiện tại, cho phép xóa lọc |
| Error | Banner lỗi ở vùng workspace, có nút thử lại |
| Permission denied | Chỉ dành cho tài khoản hạn chế đặc biệt hoặc truy cập nhầm vùng quản trị; nhân viên nội bộ MVP mặc định thấy đầy đủ thao tác kho chính |

---

## 6. Acceptance Criteria UX

1. Người dùng nhìn vào module biết đang ở Hàng hóa/Kho, không lẫn với POS bán hàng.
2. Desktop hiển thị sidebar lọc và bảng cùng lúc.
3. Người dùng lọc được hàng đang kinh doanh/ngưng bán.
4. Hàng ngưng bán không xuất hiện ở POS, nhưng vẫn thấy được ở module này qua bộ lọc.
5. Hàng cuộn/tấm có lối mở nhanh tới đối tượng vật lý bên dưới.
6. Kiểm kho có lối vào rõ từ module Kho/Hàng hóa.

---

← [Quay về Inventory README](./README.md)
