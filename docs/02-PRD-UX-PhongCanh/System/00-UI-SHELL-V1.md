# UI Shell v1 — Quy tắc giao diện nền QC-OMS

> **Trạng thái:** Source of Truth cho UI Shell v1
> **Mục tiêu:** Làm giao diện nhanh nhưng không lệch quỹ đạo; sau này đổi theme/layout không ảnh hưởng nghiệp vụ.
> **Tham khảo:** KiotViet cho logic vận hành; Material Design, IBM Carbon, Shopify Polaris cho design token/component discipline; WCAG 2.2 cho accessibility.

---

## 1. Mục tiêu thiết kế

QC-OMS không copy giao diện KiotViet. QC-OMS bám logic vận hành quen thuộc của KiotViet nhưng dùng giao diện hiện đại, gọn, rõ và thích nghi thiết bị.

Mục tiêu UI Shell v1:

- kiểm tra nghiệp vụ nhanh bằng giao diện thật
- dùng tốt trên desktop, tablet và điện thoại
- có light/dark mode ngay từ đầu
- màu sắc, spacing, radius, shadow, typography đi qua design tokens
- không nhét business logic vào UI
- mỗi màn nghiệp vụ có cùng ngôn ngữ: danh sách, filter, detail panel, form, action, trạng thái

Không làm trong UI Shell v1:

- thiết kế marketing/landing page
- animation phức tạp
- custom theme theo từng module
- đổi backend/API chỉ để phục vụ trang trí
- tối ưu mobile sâu như native app

---

## 2. Nguyên tắc kiến trúc UI

UI chỉ là lớp thao tác và hiển thị.

```text
Database / RPC
  -> API / Use-case
  -> Service client
  -> Page / Component UI
```

UI không tự quyết định:

- post phiếu nhập
- tăng/trừ tồn
- tạo cuộn/tấm vật lý
- tính công nợ thật
- thanh toán NCC
- ghi sổ quỹ

UI chỉ gọi service/API đã có contract. Nếu sau này đổi từ desktop layout sang tablet/mobile layout, nghiệp vụ không đổi.

---

## 3. Adaptive layout

### Desktop / laptop

Mục tiêu: quản lý nhiều dữ liệu và thao tác sâu.

- không dùng sidebar trái rộng làm mặc định vì các màn quản lý cần chiều ngang
- top navigation là module bar ngang: brand/logo nhỏ bên trái link về `/dashboard`, module ở giữa, cụm giao diện/tài khoản nhỏ bên phải
- không hiển thị mục chữ `Tổng quan` trong module bar; dashboard đi qua brand/logo để tiết kiệm chiều ngang
- POS là một module bình thường trong cùng thanh điều hướng với `Chứng từ`, `Khách hàng`, `Hàng hóa`, `Bảng giá`, `Nhà cung cấp`, `Phiếu nhập`, `Quản trị`; không tách thành nút thao tác nhanh bên phải
- theme toggle và tài khoản/đăng xuất dùng control compact/icon, không hiển thị block mô tả lớn kiểu `Xưởng Văn Lâm / Cloud Admin`
- danh sách dạng table hoặc dense list
- filter bar luôn nhìn thấy
- detail panel/drawer bên phải
- action chính có chữ + icon
- bảng có nhiều cột nhưng phải scan được

### Tablet

Mục tiêu: thao tác nhanh tại xưởng/quầy.

- navigation rút thành icon + tooltip/label khi cần
- list/card lớn hơn desktop
- filter mở bằng drawer
- action ưu tiên icon + chữ ngắn
- vùng bấm đủ lớn

### Mobile

Mục tiêu: kiểm tra nhanh và thao tác tối giản.

- bottom navigation bằng icon
- search + filter icon ở đầu màn
- filter sheet từ dưới lên
- item dạng card
- action phụ dùng icon-only nhưng phải có `aria-label`
- chữ chỉ giữ ở tiêu đề, dữ liệu chính và trạng thái quan trọng

---

## 4. Design tokens

Không hardcode màu, spacing, radius, shadow, font trong từng màn. Component phải dùng token.

Nhóm token bắt buộc:

- `color.surface`
- `color.surfaceMuted`
- `color.text`
- `color.textMuted`
- `color.border`
- `color.primary`
- `color.info`
- `color.success`
- `color.warning`
- `color.danger`
- `color.neutral`
- `space.*`
- `radius.*`
- `shadow.*`
- `font.*`
- `zIndex.*`

Light/dark mode là hai bộ token khác nhau nhưng component dùng cùng tên token.

Sau này muốn đổi màu chủ đạo, chỉ sửa token như `color.primary`, không sửa từng button/chip/table.

---

## 5. Semantic color rules

Màu không đặt theo cảm tính. Màu đi theo ý nghĩa nghiệp vụ.

| Token | Dùng cho |
|---|---|
| `primary` | hành động chính, preset đang chọn |
| `info` | draft, đang xử lý, thông tin |
| `success` | đã nhập, hoàn tất, đã thanh toán |
| `warning` | còn nợ, cần chú ý, cảnh báo nhẹ |
| `danger` | lỗi nặng, hủy, hành động nguy hiểm |
| `neutral` | tất cả, đã trả, phụ, trạng thái không nổi bật |

Không dùng nhiều màu cho nút thao tác. Trạng thái có thể dùng chip màu riêng, nhưng button giữ theo role.

---

## 6. Button rules

Button variants chuẩn:

- `primary`: hành động chính như tạo phiếu, hoàn thành, lưu
- `secondary`: hành động phụ như mở, lọc, in, lưu draft
- `ghost`: icon/menu phụ, không tranh màu với việc chính
- `danger`: hủy/xóa hoặc hành động nguy hiểm
- `icon`: chỉ icon, bắt buộc có tooltip/aria-label

Desktop:

- action quan trọng dùng icon + chữ
- action phụ có thể icon-only nếu quen thuộc

Tablet/mobile:

- ưu tiên icon hoặc icon + chữ ngắn
- icon-only bắt buộc có `aria-label`

Không dùng button màu theo trạng thái phiếu. Ví dụ phiếu draft không làm nút màu xanh dương; trạng thái draft nằm ở chip.

---

## 7. Filter system

Mỗi màn danh sách nên dùng chung cấu trúc:

- search chính
- preset nhanh theo nghiệp vụ
- chip filter đang áp dụng
- nút reset
- advanced filter drawer/sheet

Desktop:

- filter bar luôn nhìn thấy
- preset nằm ngay dưới search hoặc cùng hàng

Tablet:

- search luôn nhìn thấy
- nút filter mở drawer
- chip filter đang áp dụng nằm dưới search

Mobile:

- search + filter icon
- filter mở bottom sheet
- chip filter đang áp dụng nằm đầu danh sách

### Preset nhanh

Preset không thay thế filter nâng cao. Preset là đường tắt cho thao tác thường dùng.

Phiếu nhập:

- Draft cần xử lý
- Đã nhập hôm nay
- Còn nợ NCC
- Cuộn/tấm
- Tháng này
- Tất cả

Nhà cung cấp:

- Đang nợ
- Mua tháng này
- NCC mới
- Ngừng hoạt động
- Có liên kết khách hàng

Sổ quỹ:

- Hôm nay
- Tháng này
- Phiếu chi NCC
- Tiền mặt
- Ngân hàng
- Đã hủy

Hàng hóa:

- Đang bán
- Ngưng bán
- Hàng cuộn
- Hàng tấm
- Có giá nhập cuối
- Chưa có giá nhập

### Exact code search

Nếu người dùng nhập mã rõ như `PN000123`, `PCPN000001`, `HD010985`, hệ thống ưu tiên tìm chính xác và không để filter ngày/trạng thái làm mất kết quả.

---

## 8. Component contract

UI Shell v1 nên chuẩn hóa các component nền trước khi polish sâu:

- `AppShell`
- `SidebarNav`
- `TopBar`
- `ThemeToggle`
- `ResponsiveActionBar`
- `DataToolbar`
- `FilterPresetBar`
- `ActiveFilterChips`
- `DataTable`
- `EntityListCard`
- `DetailPanel`
- `FormDrawer`
- `ConfirmDialog`
- `StatusChip`
- `MoneyText`
- `EmptyState`
- `LoadingState`
- `ErrorState`

Component không chứa nghiệp vụ thật. Component nhận props và callback từ page/service.

---

## 9. Icon rules

Ưu tiên icon quen thuộc và nhất quán.

- Dùng icon thư viện nếu project có sẵn hoặc thêm có kiểm soát.
- Không tự vẽ icon rời rạc nếu có icon thư viện.
- Icon-only phải có `aria-label`.
- Icon lạ phải có tooltip.
- Action nguy hiểm không chỉ dùng icon; cần text hoặc confirm rõ.

Quy tắc theo thiết bị:

- desktop: icon + chữ cho việc chính
- tablet: icon + chữ ngắn hoặc icon-only có tooltip
- mobile: icon-only cho action phụ, chữ cho action chính nếu đủ chỗ

---

## 10. Density rules

QC-OMS là app vận hành, không phải landing page.

Desktop:

- dense nhưng rõ
- table/list ưu tiên scan nhanh
- không dùng card quá to
- không tạo hero section

Tablet/mobile:

- tăng khoảng bấm
- chuyển table thành card khi không đủ chiều ngang
- giữ dữ liệu chính: mã, đối tác, trạng thái, tiền, việc cần làm

---

## 11. Accessibility rules

Tối thiểu:

- focus visible rõ
- contrast đủ ở light/dark
- keyboard dùng được với form/filter/modal
- input có label thật
- icon-only có `aria-label`
- modal/drawer có title và close rõ
- lỗi form hiển thị cạnh vùng liên quan hoặc alert dễ thấy

Không để màu là cách duy nhất truyền đạt trạng thái. Ví dụ chip `Còn nợ` phải có chữ, không chỉ màu vàng.

---

## 12. UI review checklist

Mỗi PR UI phải tự kiểm:

- dùng design tokens, không hardcode màu lẻ
- light/dark mode không vỡ
- desktop/tablet/mobile không tràn chữ
- action chính/phụ đúng button role
- filter dùng preset/chip/drawer đúng chuẩn
- icon-only có `aria-label`
- trạng thái dùng semantic chip
- không đưa business logic vào component UI
- workflow chính thao tác được bằng browser
- không làm landing/hero cho màn nghiệp vụ

Với màn có nhiều dữ liệu, cần kiểm tra ít nhất:

- desktop khoảng 1280px
- tablet khoảng 768px
- mobile khoảng 390px

---

## 13. Slice triển khai đề xuất

Không làm toàn bộ app trong một PR lớn.

### UI-1: Tokens + shell nền

- token màu/spacing/radius/shadow
- light/dark toggle
- app shell responsive
- top module bar/bottom nav theo breakpoint, không dùng wide left sidebar mặc định
- button/chip/status component nền

### UI-2: Filter system

- `DataToolbar`
- preset nhanh
- active filter chips
- filter drawer/sheet responsive
- exact code search behavior giữ nguyên theo API hiện có

### UI-3: Purchase/Supplier UI validation

- phiếu nhập list/detail
- NCC list/payment
- roll/sheet P4 form nếu P4 đã merge
- browser smoke workflow cho Owner kiểm tra

### UI-4: Catalog/PriceBook polish

- hàng hóa
- bảng giá
- formula grid

---

## 14. Nguồn tham khảo

- KiotViet: logic vận hành Việt Nam, không copy giao diện cũ.
- Material Design: design tokens và component discipline.
- IBM Carbon: token hóa màu, layout, component system.
- Shopify Polaris: token và UI commerce/admin.
- WCAG 2.2: focus, contrast, accessibility.
