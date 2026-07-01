# PRODUCT-STOCK-LIST — Danh sách hàng hóa & tồn kho

> **Trạng thái:** 🔨 Đang xây dựng
> **Nguồn tham khảo UI:** KiotViet trang Hàng hóa; điều chỉnh theo nghiệp vụ QC-OMS.

---

## 0. Ghi nhận từ KiotViet

Quan sát ngày `01/07/2026` trên trang `Hàng hóa`:

- Bộ lọc trạng thái mặc định là `Hàng đang kinh doanh`.
- Danh sách có `381 hàng hóa (495 mã hàng)`.
- Có dòng tổng phía trên danh sách để tổng hợp tồn kho. KiotViet có thêm chỉ số `khách đặt`, nhưng QC-OMS không dùng đặt hàng trong MVP.
- Các bộ lọc KiotViet gồm: nhóm hàng, tồn kho, dự kiến hết hàng, thời gian tạo, nhà cung cấp, thương hiệu, vị trí, loại hàng, bán trực tiếp, liên kết kênh bán, trạng thái hàng hóa.
- Cột mặc định gồm: mã hàng, tên hàng, giá bán, giá vốn, tồn kho, khách đặt, thời gian tạo, dự kiến hết hàng.

Export KiotViet ngày `2026-07-01` có `657` dòng:

- `461` hàng hóa
- `184` combo/đóng gói
- `12` dịch vụ
- `496` dòng đang kinh doanh
- `161` dòng inactive/trống trạng thái
- `57` dòng tồn âm
- `189` dòng có `Hàng thành phần` dạng định mức vật tư

Áp dụng cho QC-OMS:

- Giữ bộ lọc trạng thái để xem được hàng ngưng bán trong module Hàng hóa.
- Giữ `dự kiến hết hàng` ở mức cột cảnh báo tồn thấp nếu công thức đơn giản; có thể để sau nếu chưa có tốc độ bán ổn định.
- Giữ đơn vị tính và nhóm hàng là dữ liệu nền.
- Không tạo field/module riêng cho thương hiệu hoặc kênh bán trong MVP.
- Không đưa barcode/QR scan, tự động gợi ý thông tin hàng hóa, thuộc tính retail hoặc bảo hành/bảo trì vào MVP.
- Nhà cung cấp/vị trí chỉ đưa vào sau khi Purchase/Warehouse location được chốt.
- Tồn âm là dữ liệu thực tế nên danh sách/báo cáo cần hiển thị rõ để xử lý, không ẩn.
- Cột `Hàng thành phần` xác nhận BOM/định mức là nghiệp vụ thật, nhưng import/schema BOM để phase riêng.

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
| Dự kiến hết hàng | Sau MVP hoặc chỉ hiển thị cảnh báo nếu tính được đơn giản |

Sau MVP có thể bổ sung nhà cung cấp và vị trí. Không tạo bộ lọc thương hiệu/kênh bán riêng trong MVP; nếu cần nhận diện thương hiệu thì ghi trong tên/mã/nhóm hàng.

Không có bộ lọc barcode/thuộc tính retail/bảo hành trong MVP.

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
| Khách đặt | Không hiển thị trong MVP vì QC-OMS không làm đặt hàng kiểu KiotViet |
| Dự kiến hết hàng | Cảnh báo tham khảo; không dùng để khóa bán |
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
