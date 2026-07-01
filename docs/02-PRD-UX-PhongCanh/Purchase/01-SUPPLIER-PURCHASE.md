# Purchase UI — Nhà cung cấp và nhập hàng

> **Trạng thái:** PRD/UX Source of Truth mức khung
> **Business:** [SUPPLIER-PURCHASE.md](../../03-BUSINESS-NghiepVu/Purchase/SUPPLIER-PURCHASE.md)

---

## 1. Nguyên tắc UX

QC-OMS tham khảo KiotViet nhưng đơn giản hơn:

- một màn danh sách nhà cung cấp
- một màn danh sách phiếu nhập
- một form tạo/sửa phiếu nhập trực tiếp
- không hiển thị đặt hàng nhập, trả hàng nhập, HĐĐT/VAT trong lát cắt đầu tiên

Mục tiêu thao tác là nhập đúng hàng thật mua vào, đặc biệt là cuộn/tấm vật lý.

---

## 2. Danh sách nhà cung cấp

### Bộ lọc

- tìm theo mã, tên, số điện thoại
- trạng thái: tất cả/đang hoạt động/ngừng hoạt động
- nợ hiện tại: khoảng từ/tới
- tổng mua: khoảng từ/tới

### Cột mặc định

| Cột | Ghi chú |
|---|---|
| Mã NCC | Click mở chi tiết |
| Tên NCC | Bắt buộc |
| Điện thoại | Có thể trống |
| Nợ cần trả hiện tại | Tổng hợp từ công nợ NCC |
| Tổng mua | Tổng phiếu nhập posted |
| Trạng thái | Active/inactive |

Không cần nhóm NCC ở lát cắt đầu tiên nếu chưa có nghiệp vụ phân nhóm rõ.

---

## 3. Chi tiết nhà cung cấp

Tab tối thiểu:

| Tab | Nội dung |
|---|---|
| Thông tin | Mã, tên, điện thoại, email, địa chỉ, MST text, ghi chú, trạng thái |
| Phiếu nhập | Lịch sử phiếu nhập của NCC |
| Công nợ | Các phiếu nhập còn nợ và lịch sử trả NCC |

Không có tab hóa đơn điện tử/thuế.

---

## 4. Danh sách phiếu nhập

### Bộ lọc

- tìm theo mã phiếu nhập, tên/mã NCC, số chứng từ NCC
- thời gian nhập
- trạng thái: phiếu tạm, đã nhập, đã hủy
- người nhập/người tạo

### Cột mặc định

| Cột | Ghi chú |
|---|---|
| Mã phiếu nhập | Dạng `PN...`, click mở chi tiết |
| Thời gian nhập | Thời điểm dự kiến/đã nhập |
| Nhà cung cấp | Mã + tên |
| Tổng số lượng | Tổng số lượng theo dòng, không thay thế tồn vật lý |
| Số mặt hàng | Số dòng hàng |
| Tổng tiền hàng | Trước thanh toán |
| Cần trả NCC | Sau giảm giá/chi phí liên quan nếu có |
| Đã trả NCC | Tiền đã chi |
| Còn phải trả | Công nợ phát sinh |
| Trạng thái | Draft/posted/cancelled |

---

## 5. Form phiếu nhập

### Header

- chọn/tạo nhanh nhà cung cấp
- thời gian nhập
- kho
- mã phiếu tự sinh, cho sửa trước khi posted nếu cần
- số chứng từ/hóa đơn NCC dạng text
- ghi chú

### Dòng hàng thường

- tìm/chọn sản phẩm
- đơn vị mua
- số lượng
- đơn giá
- thành tiền

### Dòng hàng cuộn

Với sản phẩm `inventory_shape = roll`, UI phải yêu cầu nhập vật lý:

- khổ rộng
- số cuộn
- chiều dài mỗi cuộn hoặc danh sách chiều dài từng cuộn
- đơn giá/tổng giá

Nếu nhiều cuộn cùng thông số, cho nhập nhanh `số cuộn x chiều dài`. Nếu khác chiều dài, cho bung danh sách từng cuộn.

### Dòng hàng tấm

Với sản phẩm `inventory_shape = sheet`, UI phải yêu cầu:

- kích thước dài/rộng
- số tấm
- đơn giá/tổng giá

Nếu cùng kích thước, cho nhập theo lô. Nếu khác kích thước, tách dòng hoặc bung danh sách.

---

## 6. Thanh toán trên phiếu nhập

Form hiển thị:

- tổng tiền hàng
- giảm giá phiếu nếu dùng
- cần trả NCC
- đã trả ngay
- còn phải trả
- phương thức trả: tiền mặt hoặc chuyển khoản/tài khoản

MVP ưu tiên một phương thức thanh toán cho một lần trả để thao tác gọn.

---

## 7. Hành động

| Hành động | Quy tắc |
|---|---|
| Lưu tạm | Tạo draft, chưa tăng tồn/công nợ/sổ quỹ |
| Hoàn thành/Nhập hàng | Posted, tăng tồn và ghi công nợ/sổ quỹ |
| Hủy | Với phiếu posted phải dùng bút toán đảo/an toàn, không xóa vật lý |
| Sửa phiếu posted | Future hoặc dùng quy tắc sửa chứng từ `MaCu.01`; không sửa phá dữ liệu |

---

## 8. Empty state và lược bỏ

Nếu chưa có dữ liệu trong tháng, empty state phải cho đổi khoảng thời gian dài hơn, giống kinh nghiệm rà KiotViet.

Không hiển thị menu/chức năng trong lát cắt đầu tiên:

- đặt hàng nhập
- trả hàng nhập
- hóa đơn đầu vào điện tử
- báo cáo NCC nâng cao

