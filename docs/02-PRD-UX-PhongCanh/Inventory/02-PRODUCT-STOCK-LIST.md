# PRODUCT-STOCK-LIST — Danh sách hàng hóa & tồn kho

> **Trạng thái:** 🔨 Đang xây dựng
> **Nguồn tham khảo UI:** KiotViet trang Hàng hóa; điều chỉnh theo nghiệp vụ QC-OMS.

---

## 1. Mục đích

Màn danh sách hàng hóa là nơi nhân viên quản lý hàng hóa và xem tồn kho tổng quan.

Màn này không thay thế POS bán hàng. Sản phẩm ngưng bán vẫn xem và xử lý kho được tại đây, nhưng không xuất hiện trong POS.

---

## 2. Bố cục

```text
┌────────────────────────────────────────────────────────────────────────────────────┐
│ Hàng hóa        [Search mã/tên hàng]                         [+ Tạo mới] [Import] │
│                                                       [Xuất file] [Cột] [Cài đặt] │
├───────────────────────┬────────────────────────────────────────────────────────────┤
│ Nhóm hàng             │ Tabs: Tất cả | Hàng thường | Cuộn | Tấm | Tồn âm          │
│ [Chọn nhóm hàng]      ├────────────────────────────────────────────────────────────┤
│                       │ □ ☆ Mã hàng | Tên hàng | Loại tồn | Giá bán | Tồn | ...   │
│ Tồn kho               │ ---------------------------------------------------------- │
│ [Tất cả v]            │ □ ☆ BAT32   | Bạt 3.2 | Cuộn     | ...     | 125 | ...   │
│                       │ □ ☆ ALU01   | Alu 01  | Tấm      | ...     | 14  | ...   │
│ Trạng thái hàng hóa   │                                                            │
│ [Đang kinh doanh v]   │                                                            │
└───────────────────────┴────────────────────────────────────────────────────────────┘
```

---

## 3. Bộ lọc MVP

| Bộ lọc | Hành vi |
|---|---|
| Nhóm hàng | Chọn một nhóm hoặc tất cả |
| Tồn kho | Tất cả, còn tồn, hết tồn, tồn âm |
| Loại tồn | Tất cả, hàng thường, cuộn, tấm |
| Trạng thái hàng hóa | Đang kinh doanh, ngưng bán, tất cả |
| Thời gian tạo | Toàn thời gian hoặc tùy chỉnh |

Sau MVP có thể bổ sung nhà cung cấp, thương hiệu, vị trí.

---

## 4. Cột bảng MVP

| Cột | Ghi chú UX |
|---|---|
| Checkbox | Chọn nhiều dòng cho thao tác hàng loạt sau MVP |
| Mã hàng | Link mở chi tiết |
| Tên hàng | Hiển thị tên và đơn vị bán |
| Loại tồn | `normal`, `roll`, `sheet` hiển thị bằng nhãn dễ đọc |
| Giá bán | Giá bán mặc định/bảng giá chung nếu có |
| Tồn kho | Tổng tồn hiện tại; với cuộn/tấm là tổng hợp |
| Khách đặt | Nếu chưa có nghiệp vụ đặt hàng thì có thể ẩn trong MVP |
| Trạng thái | Đang kinh doanh/ngưng bán |
| Hành động | Sửa, mở tồn chi tiết, kiểm kho |

Với `roll` và `sheet`, cột Tồn kho không cho sửa trực tiếp. Người dùng phải mở chi tiết đối tượng.

---

## 5. Search

Search hỗ trợ:

- mã hàng
- tên hàng
- tìm không dấu nếu backend hỗ trợ

Search trong module này có thể tìm cả hàng ngưng bán nếu bộ lọc trạng thái cho phép.

---

## 6. Thao tác chính

| Thao tác | Điều kiện |
|---|---|
| Tạo mới hàng hóa | Có quyền quản lý danh mục/sản phẩm |
| Import file | Có quyền quản lý danh mục/sản phẩm |
| Xuất file | Có quyền xem/quản lý kho |
| Sửa hàng hóa | Có quyền quản lý danh mục/sản phẩm |
| Sửa tồn hàng thường | Có quyền quản lý kho; tự sinh phiếu kiểm kho |
| Mở tồn cuộn/tấm | Hàng thuộc loại tồn Cuộn hoặc Tấm |
| Tạo phiếu kiểm kho | Có quyền quản lý kho |

---

## 7. Hành vi sửa tồn từ danh sách

- Hàng `normal`: cho phép mở modal sửa tồn nhanh.
- Khi xác nhận sửa tồn, UI hiển thị thông báo rằng hệ thống sẽ tạo phiếu kiểm kho tự động.
- Hàng `roll`: nút sửa tổng tồn bị ẩn hoặc disabled, tooltip: `Hàng cuộn sửa theo từng cuộn`.
- Hàng `sheet`: nút sửa tổng tồn bị ẩn hoặc disabled, tooltip: `Hàng tấm sửa theo từng tấm/tấm lỡ`.

---

## 8. Acceptance Criteria UX

1. Người dùng lọc được hàng ngưng bán tại module Hàng hóa.
2. Search module Hàng hóa không bị giới hạn như POS.
3. Hàng cuộn/tấm có nhãn loại tồn dễ thấy.
4. Người dùng không thể sửa tổng tồn trực tiếp cho cuộn/tấm.
5. Sửa tồn hàng thường hiển thị rõ việc sẽ sinh phiếu kiểm kho tự động.
6. Bảng vẫn đọc được ở desktop 1366px, không lấy layout hẹp làm chuẩn.

---

← [Quay về Inventory README](./README.md)
