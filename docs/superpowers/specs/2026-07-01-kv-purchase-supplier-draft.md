# KiotViet Purchase/Supplier Draft for QC-OMS

> Ngày rà: 2026-07-01  
> Trạng thái: Draft tham khảo, chưa phải Source of Truth  
> Nguồn: KiotViet `Mua hàng`, `Nhà cung cấp`, `Nhập hàng`, `Mua dịch vụ`

---

## 1. Mục tiêu

Draft này ghi lại các phần mua hàng/nhà cung cấp trong KiotViet để sau này quyết định QC-OMS có làm hay không, làm ở phase nào, và làm tối giản tới đâu.

Hiện tại QC-OMS đang ưu tiên bán hàng, tồn kho vật lý cuộn/tấm, sổ quỹ và công nợ khách. Mua hàng chưa nên đẩy vào Source of Truth chính nếu Owner chưa chốt.

---

## 2. KiotViet có gì

### 2.1. Nhà cung cấp

KiotViet có:

- Danh sách nhà cung cấp.
- Nhóm nhà cung cấp.
- Bộ lọc tổng mua, nợ hiện tại, trạng thái, loại đối tác.
- Cột: mã NCC, tên NCC, điện thoại, email, địa chỉ, mã số thuế, nợ cần trả hiện tại, tổng mua, trạng thái.
- Chi tiết có thông tin địa chỉ, nhóm NCC, ghi chú, thông tin xuất hóa đơn.

Dữ liệu thực tế trong tài khoản có `43 nhà cung cấp`.

Tổng danh sách đang thấy:

- `Nợ cần trả hiện tại`: khoảng `57,483,058`
- `Tổng mua`: khoảng `1,968,034,063`

Ví dụ cột danh sách: mã NCC, tên NCC, điện thoại, email, nợ cần trả hiện tại, tổng mua.

Kết luận: nhà cung cấp là dữ liệu thật, không nên bỏ hẳn khỏi sản phẩm dài hạn.

### 2.2. Nhập hàng

KiotViet có:

- Trạng thái: Phiếu tạm, Đã nhập hàng, Đã hủy.
- Bộ lọc thời gian, người tạo, số hóa đơn đầu vào, người nhập.
- Cột: mã nhập hàng, thời gian, mã NCC, nhà cung cấp, tổng số lượng, số lượng mặt hàng, tổng tiền hàng, giảm giá, cần trả NCC, tiền đã trả NCC, ghi chú, trạng thái.
- Có liên hệ tới kho hàng và công nợ nhà cung cấp.

Quan sát thêm ngày `01/07/2026`:

- Bộ lọc mặc định `Tháng này` không có phiếu nhập.
- Sau khi bấm `vào đây`, KiotViet đổi khoảng thời gian sang `01/07/2016 - 01/07/2026`.
- Màn vẫn không tìm thấy phiếu nhập hàng phù hợp.

Kết luận: không dùng màn `Nhập hàng` KiotViet làm căn cứ làm MVP ngay. Nếu QC-OMS làm Purchase sau này, phải thiết kế theo tồn vật lý cuộn/tấm của xưởng, không copy dữ liệu nhập hàng KiotViet.

### 2.3. Mua dịch vụ

KiotViet có:

- Mua các khoản dịch vụ/chi phí.
- Bộ lọc thời gian, loại chi, trạng thái, người tạo, đối tượng nộp/nhận, công nợ đối tác.
- Cột: mã phiếu, thời gian, loại chi, người nhận, cần thanh toán, đã thanh toán, còn phải trả, ghi chú, trạng thái.
- Có thể liên quan tới sổ quỹ và công nợ đối tác.

---

## 3. Đề xuất cho QC-OMS

### 3.1. Chưa làm Purchase trong MVP bán hàng

MVP hiện tại chưa nên làm đầy đủ module mua hàng vì:

- Xưởng cần chốt trước cách nhập tồn cuộn/tấm theo vật lý.
- Nhập hàng có thể làm thay đổi tồn, giá vốn, công nợ NCC và sổ quỹ cùng lúc.
- Nếu làm vội theo KiotViet, dễ quay về quản lý tổng m2 thay vì quản lý từng cuộn/tấm đúng mục tiêu QC-OMS.
- KiotViet có hồ sơ NCC và tổng mua/nợ, nhưng màn nhập hàng không có giao dịch dài hạn để copy luồng thao tác thực tế.

### 3.2. Khi làm, nên tách thành 3 phần

1. **Suppliers**: hồ sơ nhà cung cấp.
2. **Purchase Receipts**: phiếu nhập hàng làm tăng tồn kho vật lý.
3. **Supplier Payables**: công nợ cần trả nhà cung cấp và phiếu chi liên quan.

Mua dịch vụ nên đi theo Finance/Cashbook trước, không nhất thiết nằm chung với nhập hàng vật tư.

---

## 4. Câu hỏi cần Owner chốt

1. QC-OMS có cần quản lý nhà cung cấp ngay phase đầu không, hay chỉ lưu nguồn nhập trên từng cuộn/tấm?
2. Khi nhập cuộn, nhân viên có nhập từng cuộn vật lý ngay lúc nhập hàng không?
3. Khi nhập tấm, nhân viên có nhập từng tấm/kích thước/số lượng tấm ngay lúc nhập hàng không?
4. Có cần công nợ nhà cung cấp trong MVP không?
5. Mua dịch vụ như thuê thợ, tiền vận chuyển, tiền điện/nước nên đi qua phiếu chi Sổ quỹ hay cần module Mua dịch vụ riêng?
6. Giá vốn dùng để báo cáo lợi nhuận lấy từ phiếu nhập mới nhất, trung bình tồn, hay nhập tay theo sản phẩm?

---

## 5. Định hướng nếu làm Phase sau

### Suppliers

Thông tin tối thiểu:

- Mã NCC.
- Tên NCC.
- SĐT.
- Địa chỉ.
- Mã số thuế nếu có.
- Ghi chú.
- Trạng thái.

Không cần nhóm NCC trong MVP nếu chưa có nghiệp vụ phân nhóm rõ.

Nếu cần nguồn nhập trên tồn kho trước khi làm Purchase đầy đủ, có thể cho chọn/lưu nhà cung cấp trên từng cuộn/tấm vật lý như metadata, chưa phát sinh công nợ NCC.

### Purchase Receipts

Phiếu nhập tối thiểu:

- Mã phiếu nhập.
- Nhà cung cấp.
- Thời gian nhập.
- Người nhập.
- Kho.
- Dòng hàng/vật tư.
- Số lượng nhập.
- Giá nhập.
- Chi phí khác nếu có.
- Tổng cần trả.
- Đã trả.
- Còn phải trả.
- Trạng thái: Phiếu tạm, Đã nhập, Đã hủy.

Với hàng cuộn/tấm, dòng nhập phải tạo object tồn vật lý tương ứng, không chỉ cộng tổng m2.

### Supplier Payables

Công nợ NCC tối thiểu:

- Nợ phát sinh từ phiếu nhập chưa trả đủ.
- Phiếu chi trả NCC.
- Phân bổ trả NCC vào phiếu nhập cũ nhất trước hoặc chọn phiếu cụ thể, cần Owner chốt.

---

## 6. Không đưa vào MVP nếu chưa chốt

- Trả hàng nhập.
- Hóa đơn đầu vào điện tử.
- Chiết khấu thanh toán NCC.
- Kênh bán/đối tác giao hàng trong nhập hàng.
- Nhóm nhà cung cấp phức tạp.
- Mua dịch vụ thành module riêng nếu phiếu chi đã đủ dùng.
