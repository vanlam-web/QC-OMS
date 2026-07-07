# PRODUCT-STOCK-LIST — Danh sách hàng hóa & tồn kho

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
- `189` dòng có `Vật tư cấu thành` dạng định mức vật tư

Áp dụng cho QC-OMS:

- Giữ bộ lọc trạng thái để xem được hàng ngưng bán trong module Hàng hóa.
- Giữ `dự kiến hết hàng` ở mức cột cảnh báo tồn thấp nếu công thức đơn giản; có thể để sau nếu chưa có tốc độ bán ổn định.
- Giữ đơn vị tính và nhóm hàng là dữ liệu nền.
- Không tạo field/module riêng cho thương hiệu hoặc kênh bán trong MVP.
- Không đưa barcode/QR scan, tự động gợi ý thông tin hàng hóa, thuộc tính retail hoặc bảo hành/bảo trì vào MVP.
- Nhà cung cấp/vị trí chỉ đưa vào sau khi Purchase/Warehouse location được chốt.
- Tồn âm là dữ liệu thực tế nên danh sách/báo cáo cần hiển thị rõ để xử lý, không ẩn.
- Cột `Vật tư cấu thành` xác nhận BOM/định mức là nghiệp vụ thật. QC-OMS hiện hỗ trợ nhập/sửa BOM cấp 1 khi tạo combo và trong chi tiết hàng hóa; import BOM từ KiotViet vẫn là phase riêng.

---

## 1. Mục đích

Màn danh sách hàng hóa là nơi nhân viên quản lý hàng hóa và xem tồn kho tổng quan.

Màn này không thay thế POS bán hàng. Sản phẩm ngưng bán vẫn xem và xử lý kho được tại đây, nhưng không xuất hiện trong POS.

---

## 2. Bố cục

```text
┌────────────────────────────────────────────────────────────────────────────────────┐
│ Hàng hóa        [Search mã/tên hàng +]                                           │
├───────────────────────┬────────────────────────────────────────────────────────────┤
│ Loại hàng             │ □ | ☆ | Mã hàng | Tên hàng | Giá vốn | Giá bán         │
│ [Tất cả v]            │ ---------------------------------------------------------- │
│                       │ DECAL   | Decal PP | 0              | m²     | m²          │
│ Cách tính bán         │ Mở dòng: Thông tin | Đơn vị & quy đổi | BOM | Tồn kho │
│ [Tất cả v]            │                                                            │
│ Trạng thái hàng hóa   │                                                            │
│ [Đang kinh doanh v]   │                                                            │
└───────────────────────┴────────────────────────────────────────────────────────────┘
```

---

## 3. Bộ lọc MVP

| Bộ lọc | Hành vi |
|---|---|
| Loại hàng | Tất cả, hàng thường, dịch vụ, vật tư phụ, cuộn, tấm, combo. UI gửi `product_kind`; backend lưu ở `products.product_kind`. |
| Cách tính bán | Tất cả hoặc một trong `quantity`, `area_m2`, `linear_m`, `sheet`, `combo` |
| Trạng thái hàng hóa | Đang kinh doanh, ngưng bán, tất cả |

Sau MVP có thể bổ sung nhóm hàng, tồn kho, thời gian tạo, dự kiến hết hàng, nhà cung cấp và vị trí. Không tạo bộ lọc thương hiệu/kênh bán riêng trong MVP; nếu cần nhận diện thương hiệu thì ghi trong tên/mã/nhóm hàng.

Không có bộ lọc barcode/thuộc tính retail/bảo hành trong MVP.

---

## 4. Cột bảng MVP

| Cột | Ghi chú UX |
|---|---|
| Checkbox | Dùng pattern checkbox nhỏ giống Sổ quỹ; hiện chọn dòng/chọn tất cả, thao tác hàng loạt để sau |
| Sao ưu tiên | Dùng pattern sao giống Sổ quỹ; bấm sao dòng để lưu ưu tiên cục bộ, bấm sao header để lọc hàng ưu tiên trên trang hiện tại |
| Mã hàng | Link mở chi tiết |
| Tên hàng | Hiển thị tên hàng |
| Giá vốn | Giá vốn gần nhất để tham khảo; giá bán nằm ở Bảng giá |
| Giá bán | Hiện `Chưa có` cho tới khi nối Bảng giá/API giá bán mặc định |
| Tồn kho | Hiện `Chưa có` cho tới khi nối tồn kho thật |
| Đơn vị | Đơn vị bán/lưu chính |
| Cách tính bán | Số lượng, m², m tới, tấm, combo |
| Dự kiến hết hàng | Hiện `Chưa có`; cần logic tốc độ bán/tồn kho nên làm sau |
Không có cột trạng thái bán hoặc thao tác nhanh trên danh sách. Trạng thái bán và các thao tác sửa/ngưng bán/mở bán sẽ nằm trong vùng chi tiết hàng hóa để tránh nhầm ý nghĩa của trạng thái bán.

Với `roll` và `sheet`, cột Tồn kho không cho sửa trực tiếp. Người dùng phải mở chi tiết đối tượng.

---

## 5. Tạo mới và chi tiết

Nút `+` trong ô tìm kiếm mở modal `Tạo hàng hóa` dùng chung cho:

- hàng thường
- dịch vụ
- hàng cuộn
- hàng tấm
- combo - đóng gói

Modal không có ảnh hàng hóa, không có tab mô tả disabled và không có checkbox `Bán trực tiếp`; hàng `active` mặc định được bán trực tiếp. Với combo, người dùng nhập `Vật tư cấu thành` ngay trong modal gồm vật tư, định mức và ghi chú. Khi lưu, frontend tạo sản phẩm trước rồi lưu BOM cấp 1 cho sản phẩm vừa tạo. Khi bán combo, tồn được trừ vào vật tư cấu thành theo BOM, không trừ theo chính mã combo.

`Vật tư cấu thành` tách khỏi khái niệm hàng thành phẩm/sản phẩm con. Bảng BOM không có cột chính/phụ; `Vật tư phụ` là loại hàng riêng, còn mọi vật tư khác được xem là vật tư chính. Vật tư chính dùng định mức BOM ban đầu. Vật tư phụ có thể giữ định mức cũ khi import KiotViet để tham khảo, nhưng phase sau sẽ tự tính lại sau các lần khui vật tư phụ. Vật tư chính cũng có thể được tự hiệu chỉnh định mức sau kiểm kho, sửa tồn, khui vật tư và lịch sử sản xuất, nhưng công thức nghiệp vụ chưa chốt nên chưa làm ở MVP.

Khi click mã hàng hoặc dòng hàng, chi tiết mở inline dưới dòng bằng tab:

| Tab | Nội dung MVP |
|---|---|
| Thông tin | Mã, tên, loại hàng, đơn vị, cách tính bán, giá vốn, giá bán, loại tồn, trạng thái |
| Đơn vị & quy đổi | Đơn vị hiện tại, cách tính bán, loại tồn và trạng thái `Chưa có` cho quy đổi chi tiết |
| BOM/Vật tư cấu thành | Nhập/sửa BOM cấp 1, tạo version BOM hiện hành |
| Tồn kho | Placeholder cho tồn normal/cuộn/tấm |
| Thẻ kho | Bảng lịch sử biến động kho theo sản phẩm |
| Ghi chú | Placeholder cho mô tả/ghi chú |

Chi tiết không dùng ảnh đại diện, không hiện tag `Bán trực tiếp` và không có nút `In tem mã`.

Tab `Thẻ kho` hiển thị table riêng, phân trang 15 dòng/lần, với cột: `Chứng từ`, `Thời gian`, `Loại giao dịch`, `Giá GD`, `Giá vốn`, `Số lượng`, `Tồn cuối`, `Đối tác`. `Chứng từ` là mã hóa đơn bán, phiếu nhập hoặc phiếu kiểm kho làm thay đổi vật tư này. `Đối tác` map từ chứng từ: khách hàng với hóa đơn bán, nhà cung cấp với phiếu nhập. `Giá GD` là giá trên dòng giao dịch; `Giá vốn` dùng giá nhập cuối/giá nhập hiện có theo dữ liệu backend. `Tồn cuối` vẫn hiện `Chưa có` cho tới khi stock movement có `balance_after`.

---

## 6. Search

Search hỗ trợ:

- mã hàng
- tên hàng
- tìm không dấu nếu backend hỗ trợ

Search trong module này có thể tìm cả hàng ngưng bán nếu bộ lọc trạng thái cho phép.

---

## 7. Thao tác chính

Preset `Nhân viên nội bộ` trong MVP mặc định có đủ quyền cho các thao tác hàng hóa/kho thường ngày. Cột điều kiện dưới đây là guard kỹ thuật cho tài khoản hạn chế đặc biệt, không phải yêu cầu admin phải chia quyền nhỏ khi vận hành xưởng.

| Thao tác | Điều kiện |
|---|---|
| Tạo mới hàng hóa | Nhân viên nội bộ/Quản trị; tài khoản hạn chế cần quyền quản lý danh mục/sản phẩm |
| Import file | Nhân viên nội bộ/Quản trị; tài khoản hạn chế cần quyền quản lý danh mục/sản phẩm |
| Xuất file | Nhân viên nội bộ/Quản trị; có thể yêu cầu xác thực lại nếu bật bảo vệ xuất file |
| Sửa hàng hóa | Nhân viên nội bộ/Quản trị; tài khoản hạn chế cần quyền quản lý danh mục/sản phẩm |
| Sửa tồn hàng thường | Nhân viên nội bộ/Quản trị; tự sinh phiếu kiểm kho |
| Mở tồn cuộn/tấm | Hàng thuộc loại tồn Cuộn hoặc Tấm |
| Tạo phiếu kiểm kho | Nhân viên nội bộ/Quản trị; tài khoản hạn chế cần quyền quản lý kho |

---

## 8. Hành vi sửa tồn từ danh sách

- Hàng `normal`: cho phép mở modal sửa tồn nhanh.
- Khi xác nhận sửa tồn, UI hiển thị thông báo rằng hệ thống sẽ tạo phiếu kiểm kho tự động.
- Hàng `roll`: nút sửa tổng tồn bị ẩn hoặc disabled, tooltip: `Hàng cuộn sửa theo từng cuộn`.
- Hàng `sheet`: nút sửa tổng tồn bị ẩn hoặc disabled, tooltip: `Hàng tấm sửa theo từng tấm/tấm lỡ`.

---

## 9. Acceptance Criteria UX

1. Người dùng lọc được hàng ngưng bán tại module Hàng hóa.
2. Search module Hàng hóa không bị giới hạn như POS.
3. Hàng cuộn/tấm có nhãn loại tồn dễ thấy.
4. Người dùng không thể sửa tổng tồn trực tiếp cho cuộn/tấm.
5. Sửa tồn hàng thường hiển thị rõ việc sẽ sinh phiếu kiểm kho tự động.
6. Bảng vẫn đọc được ở desktop 1366px, không lấy layout hẹp làm chuẩn.

---

← [Quay về Inventory README](./README.md)
