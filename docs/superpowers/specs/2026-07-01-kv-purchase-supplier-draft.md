# KiotViet Purchase/Supplier Draft for QC-OMS

> Ngày rà: 2026-07-01  
> Trạng thái: Draft tham khảo, chưa phải Source of Truth  
> Nguồn: KiotViet `Mua hàng`, `Nhà cung cấp`, `Nhập hàng`, `Mua dịch vụ`, `Hóa đơn đầu vào`, `Báo cáo nhà cung cấp`

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
- Màn hiển thị `626 giao dịch`.
- Tổng `Cần trả NCC` trên danh sách khoảng `2,048,849,460`.
- Các phiếu gần nhất có mã `PN...`, ví dụ `PN000668`, `PN000667`, trạng thái `Đã nhập hàng`.
- Dữ liệu thực tế có nhiều nhà cung cấp như `A Thanh Huế (In bao)`, `Shoper`, `Thiệp cưới Đông Hà`, `toàn led`, `In Offset SG`, `Thịnh Hồng Nguyên`, `Chị giao`.

Form tạo phiếu nhập trong KiotViet có:

- Tìm hàng hóa theo mã hoặc tên.
- Dòng hàng gồm mã hàng, tên hàng, ĐVT, số lượng, đơn giá, giảm giá, thành tiền.
- Thêm sản phẩm từ file Excel.
- Chọn chi nhánh/kho.
- Thời gian nhập.
- Tìm/chọn nhà cung cấp.
- Mã phiếu nhập tự động.
- Mã đặt hàng nhập.
- Trạng thái `Phiếu tạm`.
- Số hóa đơn đầu vào.
- Tổng tiền hàng, giảm giá, cần trả nhà cung cấp.
- Ghi chú.
- Hành động `Lưu tạm` và `Hoàn thành`.

Kết luận: nhập hàng là nghiệp vụ có dữ liệu thật, nhưng vẫn chưa nên bê nguyên luồng KiotViet vào MVP bán hàng. Nếu QC-OMS làm Purchase sau này, phải thiết kế theo tồn vật lý cuộn/tấm của xưởng, không copy cách quản lý tổng số lượng/m2 của KiotViet.

### 2.3. Mua dịch vụ

KiotViet có:

- Mua các khoản dịch vụ/chi phí.
- Bộ lọc thời gian, loại chi, trạng thái, người tạo, đối tượng nộp/nhận, công nợ đối tác.
- Cột: mã phiếu, thời gian, loại chi, người nhận, cần thanh toán, đã thanh toán, còn phải trả, ghi chú, trạng thái.
- Có thể liên quan tới sổ quỹ và công nợ đối tác.

Quan sát ngày `01/07/2026`:

- Bộ lọc mặc định `Tháng này` không có kết quả.
- Màn có tổng nhanh: `Cần thanh toán`, `Đã thanh toán`, `Còn phải trả`.
- Đối tượng nộp/nhận có lựa chọn `Tất cả`, `Nhà cung cấp`, `Khác`.
- Công nợ đối tác có lọc `Tất cả`, `Đã thanh toán`, `Thanh toán 1 phần`, `Chưa thanh toán`.
- Datepicker màn này không có nút mở rộng nhanh kiểu `vào đây`; chưa xác nhận được dữ liệu dài hạn trong lượt rà này.

Kết luận: `Mua dịch vụ` giống một biến thể của phiếu chi/công nợ đối tác. Với QC-OMS MVP, chưa cần module riêng nếu Sổ quỹ đã có phiếu chi rõ loại chi, người nhận và tài khoản tiền.

### 2.4. Đặt hàng nhập

KiotViet có màn `Đặt hàng nhập` trước khi nhập hàng thật.

Các trường/lọc chính:

- Mã phiếu đặt hàng nhập.
- Trạng thái: Phiếu tạm, Đã xác nhận NCC, Nhập một phần, trạng thái khác.
- Thời gian.
- Người tạo.
- Người nhận đặt.
- Nhà cung cấp.
- Ngày nhập dự kiến.
- Số ngày chờ.
- Cần trả NCC.

Quan sát ngày `01/07/2026`:

- Bộ lọc mặc định `Tháng này` không có dữ liệu.
- Mở rộng `01/07/2016 - 01/07/2026` có `4` phiếu đặt hàng nhập, tổng khoảng `5,450,000`.
- Ví dụ: `PDN000004`, `PDN000003`, `PDN000002`, `PDN000001`.

Kết luận: nghiệp vụ đặt hàng nhập có tồn tại nhưng rất ít so với `626` phiếu nhập hàng. QC-OMS không nên ưu tiên đặt hàng nhập trong MVP; khi hàng về thì nhập kho vật lý trực tiếp quan trọng hơn.

### 2.5. Trả hàng nhập

KiotViet có màn `Trả hàng nhập`.

Các trường/lọc chính:

- Mã phiếu trả.
- Trạng thái: Phiếu tạm, Đã trả hàng, Đã hủy.
- Thời gian.
- Người tạo.
- Người trả.
- Nhà cung cấp.
- Tổng tiền hàng, giảm giá, NCC cần trả, NCC đã trả.

Quan sát ngày `01/07/2026`:

- Bộ lọc mặc định `Tháng này` không có dữ liệu.
- Mở rộng `01/07/2016 - 01/07/2026` vẫn không có giao dịch.

Kết luận: trả hàng nhập không phải nghiệp vụ đang dùng thường xuyên. QC-OMS nên để sau Purchase/Supplier; trong MVP, xử lý sai lệch tồn bằng sửa/hủy chứng từ, kiểm kho hoặc điều chỉnh tồn theo quy tắc đã chốt.

### 2.6. Hóa đơn đầu vào

KiotViet có màn `Hóa đơn đầu vào` để quản lý hóa đơn đầu vào và tối ưu nhập liệu khi tạo phiếu nhập, phiếu chi.

Quan sát ngày `01/07/2026`:

- Màn hiển thị trạng thái `Chưa có kết nối với Cơ quan Thuế`.
- Có nút `Kết nối ngay`.
- Đây là tính năng thuộc nhóm hóa đơn điện tử/thuế, không phải luồng nhập kho vật lý tối thiểu.

Kết luận: QC-OMS không làm hóa đơn điện tử/VAT/thuế trong scope hiện tại, nên bỏ `Hóa đơn đầu vào` khỏi MVP. Nếu cần lưu số hóa đơn đầu vào, chỉ lưu như trường tham chiếu text trên phiếu nhập, không tích hợp Cơ quan Thuế.

### 2.7. Báo cáo nhà cung cấp

KiotViet có `Báo cáo nhà cung cấp` trong nhóm Phân tích.

Các trường chính:

- Kiểu hiển thị: Biểu đồ hoặc Báo cáo.
- Mối quan tâm: mặc định `Nhập hàng`.
- Thời gian.
- Tìm nhà cung cấp theo mã, tên, số điện thoại.
- Biểu đồ `Top 10 nhà cung cấp nhập hàng nhiều nhất`.

Quan sát ngày `01/07/2026`:

- Bộ lọc mặc định `Tuần này` không có dữ liệu đáng kể.
- Báo cáo này phụ thuộc dữ liệu Purchase/Supplier, không độc lập với module nhập hàng.

Kết luận: chỉ làm báo cáo NCC sau khi Purchase/Supplier được đưa vào Source of Truth. Trong MVP báo cáo tài chính không hiển thị công nợ NCC nếu Purchase chưa làm.

---

## 3. Đề xuất cho QC-OMS

### 3.1. Chưa làm Purchase trong MVP bán hàng

MVP hiện tại chưa nên làm đầy đủ module mua hàng vì:

- Xưởng cần chốt trước cách nhập tồn cuộn/tấm theo vật lý.
- Nhập hàng có thể làm thay đổi tồn, giá vốn, công nợ NCC và sổ quỹ cùng lúc.
- Nếu làm vội theo KiotViet, dễ quay về quản lý tổng m2 thay vì quản lý từng cuộn/tấm đúng mục tiêu QC-OMS.
- KiotViet có hồ sơ NCC, tổng mua/nợ và nhiều phiếu nhập thật, nhưng luồng nhập của QC-OMS cần khác KiotViet ở điểm cốt lõi: phiếu nhập phải tạo tồn vật lý theo cuộn/tấm nếu hàng đó thuộc nhóm quản lý vật lý.

### 3.2. Khi làm, nên tách thành 3 phần

1. **Suppliers**: hồ sơ nhà cung cấp.
2. **Purchase Receipts**: phiếu nhập hàng làm tăng tồn kho vật lý.
3. **Supplier Payables**: công nợ cần trả nhà cung cấp và phiếu chi liên quan.

Mua dịch vụ nên đi theo Finance/Cashbook trước, không nhất thiết nằm chung với nhập hàng vật tư.

`Đặt hàng nhập` và `Trả hàng nhập` nên là phase sau của Purchase, không nằm trong lát cắt đầu tiên.

`Hóa đơn đầu vào` và `Báo cáo nhà cung cấp` không làm trước Purchase; `Hóa đơn đầu vào` còn thuộc phạm vi thuế/HĐĐT đã loại khỏi MVP.

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

Quy tắc gợi ý theo loại hàng:

- Hàng thường: nhập số lượng như KiotViet, tăng tồn tổng.
- Hàng cuộn: mỗi cuộn nhập vào phải có object riêng, gồm khổ, chiều dài ban đầu, m2 ban đầu, số còn lại và trạng thái cuộn.
- Hàng tấm: nhập theo từng tấm hoặc lô tấm cùng kích thước; hệ thống tạo tồn tấm/tấm lỡ theo cấu hình nhập.
- Giá nhập gắn vào object/lô vật lý để làm tham khảo giá vốn sau này.
- Không dùng phiếu nhập để tự sửa tồn tổng cuộn/tấm bằng tay; sửa sai tồn vật lý đi qua kiểm kho/điều chỉnh tồn.

### Supplier Payables

Công nợ NCC tối thiểu:

- Nợ phát sinh từ phiếu nhập chưa trả đủ.
- Phiếu chi trả NCC.
- Phân bổ trả NCC vào phiếu nhập cũ nhất trước hoặc chọn phiếu cụ thể, cần Owner chốt.

---

## 6. Không đưa vào MVP nếu chưa chốt

- Trả hàng nhập.
- Đặt hàng nhập.
- Hóa đơn đầu vào điện tử.
- Báo cáo nhà cung cấp.
- Chiết khấu thanh toán NCC.
- Kênh bán/đối tác giao hàng trong nhập hàng.
- Nhóm nhà cung cấp phức tạp.
- Mua dịch vụ thành module riêng nếu phiếu chi đã đủ dùng.
