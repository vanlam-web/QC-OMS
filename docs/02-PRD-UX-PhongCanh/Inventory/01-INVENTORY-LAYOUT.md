# INVENTORY-LAYOUT — Bố cục tổng thể Hàng hóa và kiểm kho

> **Nguồn tham khảo UI:** KiotViet trang Hàng hóa ở viewport desktop rộng.

---

## 1. Mục đích

Module Hàng hóa giúp nhân viên:

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
- Nút `+ Tạo hàng hóa` mở modal chung thay vì nhúng form ngay trong danh sách.
- Cột bảng phải giữ ổn định, không nhảy layout khi dữ liệu dài. Checkbox chọn dòng và sao ưu tiên dùng chung pattern nhỏ từ Sổ quỹ.
- Với màn hẹp, sidebar có thể thu gọn thành nút lọc; không dùng viewport hẹp của browser làm chuẩn desktop.
- Không đưa hướng dẫn dài trong màn hình; trạng thái và hành động phải rõ qua nhãn nút, icon và tooltip.

---

## 4. Navigation chính

Không tạo top-level tab `Kho`. Trong module `Hàng hóa`, các view MVP:

| View | Mục đích |
|---|---|
| Danh sách hàng hóa | Xem, tìm, lọc và mở chi tiết tồn |
| Tồn theo cuộn/tấm | Quản lý đối tượng vật lý của hàng cuộn/tấm |
| Kiểm kho | Tạo, lưu tạm, cân bằng và hủy phiếu kiểm kho |
| Stock movement | Xem lịch sử biến động tồn kho |

MVP giữ các view này dưới cùng module Hàng hóa, dùng tab hoặc navigation phụ. `Kiểm kho` giữ luồng cũ, chỉ đổi vị trí điều hướng vào dưới Hàng hóa.

---

## 5. Tạo hàng hóa

`+ Tạo hàng hóa` mở modal tạo chung để người dùng không phải chọn nhiều màn riêng lẻ trước khi nhập dữ liệu. Modal có trường `Loại hàng` ở đầu form:

| Loại hàng | Cách nhận diện | UI trong modal |
|---|---|---|
| Hàng thường | `inventory_shape = normal`, `sell_method = quantity`, `track_inventory = true` mặc định | Hiện phần tồn kho cơ bản |
| Dịch vụ | `product_kind = service`, `inventory_shape = normal`, `sell_method = quantity`, `track_inventory = false` | Ẩn phần tồn kho; đơn vị mặc định `lần` |
| Vật tư phụ | `product_kind = auxiliary_material`, `inventory_shape = normal`, `sell_method = quantity`, `track_inventory = true` | Hiện phần tồn kho cơ bản; dùng để đánh dấu vật tư phụ khi sửa/import dữ liệu |
| Hàng cuộn | `inventory_shape = roll`, `sell_method = linear_m`, `track_inventory = true` | Hiện nhãn tồn kho `Cuộn`; đơn vị mặc định `m` |
| Hàng tấm | `inventory_shape = sheet`, `sell_method = sheet`, `track_inventory = true` | Hiện nhãn tồn kho `Tấm`; đơn vị mặc định `tấm` |
| Combo - đóng gói | `inventory_shape = normal`, `sell_method = combo`, `track_inventory = false` | Ẩn phần tồn kho; hiện khu vực `Vật tư cấu thành` để nhập vật tư, định mức, ghi chú |

Form tạo mới ghi được `mã hàng`, `tên hàng`, `loại hàng`, `đơn vị`, `cách tính bán`, `trạng thái` và `giá vốn`. `Giá bán` vẫn thuộc module Bảng giá nên chỉ hiển thị lối dẫn/placeholder, không nhập trực tiếp trong modal tạo hàng. QC-OMS không dùng ảnh hàng hóa trong modal này.

Với `Combo - đóng gói`, người dùng nhập BOM cấp 1 ngay trong modal tạo hàng. Khi lưu, frontend tạo sản phẩm combo trước rồi gọi API lưu BOM cho sản phẩm vừa tạo. Khi bán combo, hệ thống không trừ tồn theo mã combo; tồn được trừ vào vật tư thành phần theo BOM active tại thời điểm chốt chứng từ. Sau khi combo đã tồn tại, người dùng vẫn có thể mở chi tiết dòng hàng trong danh sách để sửa BOM/version hiện hành.

Thuật ngữ combo dùng `Vật tư cấu thành`, không dùng `Hàng thành phần` để tránh nhầm với hàng thành phẩm/sản phẩm con. BOM không lưu cột chính/phụ trên từng dòng; vai trò vật tư được suy ra từ `product_kind` của vật tư. Chỉ có loại riêng `Vật tư phụ`; các vật tư còn lại được xem là vật tư chính.

Định mức vật tư chính hiện dùng theo BOM thiết lập/import ban đầu. Vật tư phụ có thể giữ định mức cũ từ KiotViet để tham khảo nhưng không bắt buộc nhập mới. Logic tự hiệu chỉnh định mức từ kiểm kho, sửa tồn, khui vật tư và lịch sử sản xuất sẽ làm ở phase sau sau khi chốt công thức nghiệp vụ.

Footer modal có `Bỏ qua`, `Lưu & tạo thêm` và `Lưu`. `Lưu` tạo xong đóng modal; `Lưu & tạo thêm` tạo xong reset form về loại `Hàng thường` và giữ modal mở để nhập tiếp. Không có checkbox `Bán trực tiếp` vì toàn bộ hàng tạo từ module này mặc định được bán trực tiếp nếu đang hoạt động.

---

## 6. Chi tiết hàng hóa

Khi click một dòng hàng hóa, chi tiết mở inline ngay dưới dòng đó bằng shell chung `management-detail-panel`, không mở trang riêng.

Tab chi tiết gồm:

| Tab | Mục đích |
|---|---|
| Thông tin | Thông tin chính của hàng hóa: mã, tên, loại hàng, đơn vị, cách tính bán, giá vốn, giá bán, loại tồn, trạng thái |
| Đơn vị & quy đổi | Đơn vị hiện tại, cách tính bán, loại tồn và placeholder quy đổi; chi tiết nhiều đơn vị sẽ nối API/form riêng sau |
| BOM/Vật tư cấu thành | Nhập/sửa định mức vật tư cho combo hoặc sản phẩm có BOM |
| Tồn kho | Chỗ gắn dữ liệu tồn kho normal/cuộn/tấm ở bước sau |
| Thẻ kho | Bảng lịch sử biến động kho theo sản phẩm, dùng API stock movements hiện có |
| Ghi chú | Mô tả, ghi chú nội bộ ở bước sau |

QC-OMS không dùng ảnh đại diện trong chi tiết hàng hóa và không hiển thị tag `Bán trực tiếp`. Sản phẩm/dịch vụ `active` mặc định bán trực tiếp theo rule chung.

Tab `Thẻ kho` dùng layout bảng gần KiotViet để giữ quen tay: `Chứng từ`, `Thời gian`, `Loại giao dịch`, `Giá GD`, `Giá vốn`, `Số lượng`, `Tồn cuối`, `Đối tác`. `Chứng từ` là mã chứng từ làm thay đổi vật liệu/sản phẩm: hóa đơn bán (`HD...`), phiếu nhập (`PN...`) hoặc phiếu kiểm kho (`KK...`). `Đối tác` lấy theo chứng từ: bán thì là khách hàng, mua thì là nhà cung cấp. `Giá GD` lấy từ giá trên dòng giao dịch; `Giá vốn` MVP lấy từ giá nhập cuối hiện có của hàng hóa hoặc giá nhập của phiếu mua nếu có. `Tồn cuối` chưa hiển thị thật vì API chưa lưu/trả `balance_after`, nên vẫn hiện `Chưa có`.

Footer chi tiết dùng nhóm hành động chung. MVP chỉ giữ `Sửa` làm lối vào sau này khi UI sửa hàng hóa được chốt. QC-OMS không dùng `In tem mã` trong module Hàng hóa.

---

## 7. Trạng thái chung

| Trạng thái | UI |
|---|---|
| Loading | Skeleton cho sidebar và table, không dùng spinner che toàn màn hình |
| Empty | Hiển thị trạng thái trống trong vùng bảng; nhân viên nội bộ MVP thấy nút tạo mới/thao tác chính |
| Filter empty | Báo không có kết quả với bộ lọc hiện tại, cho phép xóa lọc |
| Error | Banner lỗi ở vùng workspace, có nút thử lại |
| Permission denied | Chỉ dành cho tài khoản hạn chế đặc biệt hoặc truy cập nhầm vùng quản trị; nhân viên nội bộ MVP mặc định thấy đầy đủ thao tác kho chính |

---

## 8. Acceptance Criteria UX

1. Người dùng nhìn vào module biết đang ở Hàng hóa, có lối vào tồn kho/kiểm kho rõ ràng, không lẫn với POS bán hàng.
2. Desktop hiển thị sidebar lọc và bảng cùng lúc.
3. Người dùng lọc được hàng đang kinh doanh/ngưng bán.
4. Hàng ngưng bán không xuất hiện ở POS, nhưng vẫn thấy được ở module này qua bộ lọc.
5. Hàng cuộn/tấm có lối mở nhanh tới đối tượng vật lý bên dưới.
6. Kiểm kho có lối vào rõ từ module Hàng hóa.
7. Tạo hàng hóa dùng một modal chung, đổi trường và khu vực theo loại hàng đã chọn.
8. Chi tiết hàng hóa mở inline. Tab thật tách `Thông tin`, `BOM/Vật tư cấu thành`, `Tồn kho`, `Thẻ kho`, `Ghi chú`; mỗi tab chỉ tải dữ liệu cần dùng.

---

← [Quay về Inventory README](./README.md)
