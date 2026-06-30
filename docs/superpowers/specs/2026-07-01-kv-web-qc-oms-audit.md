# KiotViet Web Audit for QC-OMS — Draft

> Ngày rà: 2026-07-01  
> Trạng thái: Draft tham khảo, không phải Source of Truth nghiệp vụ  
> Nguồn: giao diện KiotViet đang đăng nhập tại `quangcaoinvanlam.kiotviet.vn`

---

## 1. Mục tiêu

File này ghi lại các màn hình KiotViet có liên quan tới QC-OMS để quyết định phần nào nên đưa vào đặc tả, phần nào chỉ tham khảo, phần nào loại khỏi MVP.

Nguyên tắc:

- KiotViet là nguồn tham khảo thao tác và cách tổ chức dữ liệu, không copy 100%.
- Quyết định cuối cùng của QC-OMS nằm trong Source of Truth đúng tầng: PRD-UX, Business, Database, Backend.
- Mục nào chưa chắc thì để ở draft/backlog, không đẩy thẳng vào spec chính.
- Nếu một màn KiotViet không có dữ liệu, rất ít dữ liệu, hoặc chỉ là chức năng retail chung mà xưởng không dùng, phải kiểm tra khoảng thời gian dài hơn trước khi dùng làm căn cứ lược bỏ.
- Không kết luận chỉ từ bộ lọc mặc định `Tháng này`.
- Nếu đã mở rộng thời gian dài mà vẫn không có dữ liệu, mặc định xếp vào nhóm bỏ khỏi MVP hoặc để sau.
- Chỉ giữ màn ít dữ liệu nếu Owner đã chốt đó là nghiệp vụ lõi của QC-OMS, ví dụ Kiểm kho.

---

## 2. Menu KiotViet đã thấy

Các nhóm menu chính:

- Tổng quan
- Hàng hóa: Danh sách hàng hóa, Thiết lập giá, Kiểm kho, Xuất dùng nội bộ, Xuất hủy
- Mua hàng: Nhà cung cấp, Hóa đơn đầu vào, Nhập hàng, Trả hàng nhập, Mua dịch vụ
- Đơn hàng: Đặt hàng, Hóa đơn, Trả hàng, Đối tác giao hàng, Vận đơn
- Khách hàng: Khách hàng, Khuyến mại, Cửa hàng online trên Zalo
- Nhân viên: Danh sách nhân viên, Lịch làm việc, Bảng chấm công, Bảng lương, Hoa hồng, Thiết lập nhân viên
- Sổ quỹ
- Phân tích/Báo cáo
- Bán online
- Thuế & Kế toán, Hóa đơn điện tử

---

## 3. Phân loại cho QC-OMS

### Làm hoặc đã làm trong MVP

| KiotViet | QC-OMS tương ứng | Trạng thái |
|---|---|---|
| Bán hàng | POS | Đã có PRD-UX POS, Business/DB/API đang mở rộng |
| Danh sách hàng hóa | Inventory/Product | Đã có PRD-UX Inventory |
| Thiết lập giá | Price List | Đã có Business/DB/API; cần PRD-UX giá riêng nếu làm màn quản trị bảng giá |
| Kiểm kho | Stocktake | Đã có PRD-UX/Business/DB/API |
| Hóa đơn | Sales Documents | Cần thêm PRD-UX trang chứng từ |
| Đặt hàng | Báo giá/đơn chờ/đơn đặt | Cần quyết định QC-OMS gom hay tách |
| Khách hàng | Customer | Có trong POS; cần PRD-UX trang khách hàng riêng |
| Sổ quỹ | Finance Cashbook | Đã có PRD-UX/Business/DB/API |

### Tham khảo, chưa làm MVP

| KiotViet | Lý do |
|---|---|
| Trả hàng | QC-OMS đã chốt chưa có nghiệp vụ trả hàng trong POS MVP |
| Đối tác giao hàng, vận đơn | Xưởng chủ yếu xử lý nội bộ; có thể quay lại khi cần giao hàng/COD |
| Xuất dùng nội bộ, xuất hủy | Có liên quan kho nhưng chưa phải luồng chính; nên gom vào backlog Inventory |
| Mua hàng/Nhập hàng/Nhà cung cấp | Quan trọng cho kho về sau, nhưng MVP đang ưu tiên bán hàng và tồn hiện có |
| Nhân viên/chấm công/lương/hoa hồng | Chưa thuộc phase hiện tại |
| Báo cáo phân tích | Làm sau khi dữ liệu lõi ổn định |
| Bán online/Zalo shop/Website bán hàng | Không thuộc MVP QC-OMS |
| Thuế & Kế toán/HĐĐT | Chưa làm MVP; chỉ giữ thông tin xuất hóa đơn ở hồ sơ khách |

### Ứng viên bỏ khỏi QC-OMS nếu không có dữ liệu thực tế

| KiotViet | Dấu hiệu quan sát | Đề xuất |
|---|---|---|
| Trả hàng bán | Đã mở rộng `01/07/2016 - 01/07/2026` vẫn không có giao dịch phù hợp; Owner đã chốt POS MVP không có trả hàng | Bỏ khỏi MVP |
| Trả hàng nhập | Đã mở rộng `01/07/2016 - 01/07/2026` vẫn không có giao dịch phù hợp; phụ thuộc Purchase/NCC chưa chốt | Bỏ khỏi MVP, chỉ xét lại sau Purchase |
| Xuất dùng nội bộ | Đã mở rộng `01/07/2016 - 01/07/2026` vẫn không có giao dịch phù hợp; nghiệp vụ xưởng chưa cần module riêng | Không làm riêng; nếu cần thì là lý do điều chỉnh giảm tồn |
| Xuất hủy | Đã mở rộng `01/07/2016 - 01/07/2026` vẫn không có giao dịch phù hợp | Không làm module riêng; chỉ cân nhắc lịch sử hủy vật tư/tấm lỡ nếu Owner cần |
| Mua dịch vụ | Màn tháng hiện tại không có kết quả phù hợp; có thể xử lý bằng phiếu chi Sổ quỹ | Không làm module riêng trong MVP |
| Đối tác giao hàng/Vận đơn | Không phù hợp luồng xưởng hiện tại, có nhiều trường COD/giao hàng | Bỏ khỏi MVP |
| Kênh bán/Bán online/Zalo shop/Website | Không thuộc luồng QC-OMS nội bộ | Bỏ |
| VAT/HĐĐT/Thuế kế toán | Xưởng chưa làm nghiệp vụ này trong QC-OMS MVP | Bỏ, chỉ giữ thông tin xuất hóa đơn trong hồ sơ khách |
| Thương hiệu/thuộc tính retail | Có thể ghi trong tên hàng hoặc nhóm hàng | Không tạo field/module riêng |

Ghi chú: "không có dữ liệu" ở đây là dấu hiệu từ giao diện KiotViet đang xem, không phải kết luận kỹ thuật từ database. Các màn có nút `vào đây để tiếp tục tìm kiếm` đã được kiểm tra bằng khoảng dài `01/07/2016 - 01/07/2026` trước khi xếp vào nhóm bỏ/để sau.

---

## 4. Ghi chú theo màn hình

### 4.1. Sổ quỹ

KiotViet có:

- Quỹ tiền: Tiền mặt, Ngân hàng, Ví điện tử, Tổng quỹ.
- Bộ lọc thời gian, loại chứng từ, loại thu chi, trạng thái, người tạo, nhân viên, người nộp/nhận.
- Bộ lọc công nợ đối tác: tính vào công nợ, không tính vào công nợ, không có công nợ.
- Tổng quan: quỹ đầu kỳ, tổng thu, tổng chi, tồn quỹ.
- Bảng: mã phiếu, thời gian, loại thu chi, người nộp/nhận, giá trị.

Quyết định QC-OMS hiện tại:

- MVP chỉ làm Tiền mặt và Ngân hàng; chưa làm Ví điện tử.
- Chuyển khoản phải chọn đúng tài khoản nhận.
- Sổ quỹ có phiếu thu/chi thủ công và phiếu phát sinh từ POS/thu nợ.
- Đối soát cuối ngày theo tiền mặt và từng tài khoản ngân hàng.

### 4.2. Hóa đơn

KiotViet có:

- Bộ lọc: thời gian, loại hóa đơn, trạng thái hóa đơn, trạng thái giao hàng, đối tác giao hàng, thời gian/khu vực giao hàng, phương thức thanh toán, người tạo, người bán, bảng giá, kênh bán.
- Cột chính: mã hóa đơn, thời gian, mã trả hàng, mã khách hàng, khách hàng, tổng tiền hàng, giảm giá, tổng sau giảm giá, khách đã trả.
- Cột mở rộng nhiều: email, điện thoại, địa chỉ, người bán, người tạo, kênh bán, đối tác giao hàng, phí/COD, trạng thái giao hàng, HĐĐT.
- Thao tác: tạo mới, import/export, in, sửa thông tin giao hàng, hủy hóa đơn, phát hành/chuyển HĐĐT.

Đề xuất QC-OMS:

- Làm trang Sales Documents tối giản hơn: báo giá, hóa đơn, đã hủy.
- Không làm trả hàng, giao hàng, COD, HĐĐT trong MVP.
- Có thao tác mở lại báo giá, in lại bill, sửa hóa đơn theo quy tắc `MaCu.01`, hủy hóa đơn.

### 4.3. Đặt hàng

KiotViet có:

- Trạng thái: phiếu tạm, đang giao hàng, hoàn thành và các trạng thái khác.
- Cột: mã đặt hàng, mã hóa đơn, thời gian, mã khách hàng, khách hàng, khách cần trả, khách đã trả, trạng thái.
- Bộ lọc người nhận đặt, kênh bán, giao hàng.

Đề xuất QC-OMS:

- Không copy nguyên mô hình đặt hàng giao hàng.
- Báo giá `BG...` của QC-OMS đóng vai trò đơn trước bán; khi khách đồng ý mở lại báo giá để checkout thành hóa đơn `HD...`.
- Nếu về sau cần đơn sản xuất/chờ lấy hàng, tách thành module Production/Work Orders, không ép vào Đặt hàng KiotViet.

### 4.4. Khách hàng

KiotViet có:

- Bộ lọc nhóm khách hàng, ngày tạo, người tạo, loại khách, giới tính, sinh nhật, giao dịch cuối, tổng bán, nợ hiện tại, khu vực giao hàng, trạng thái.
- Cột: mã khách hàng, tên khách hàng, loại khách hàng, điện thoại, nhóm khách, email, Facebook, công ty, mã số thuế, địa chỉ, nợ hiện tại, tổng bán, trạng thái.

Quyết định QC-OMS hiện tại:

- Mã khách và tên khách là bắt buộc; mã có thể tự sinh.
- SĐT không bắt buộc; nếu có thì unique.
- Nhóm khách quyết định bảng giá; không gán nhóm thì dùng bảng giá chung.
- Không dùng giới tính/ngày sinh/ảnh khách trong MVP.
- Cần PRD-UX trang Customer riêng để quản lý danh sách, chi tiết, nhóm khách và công nợ.

### 4.5. Hàng hóa

KiotViet có:

- Bộ lọc nhóm hàng, tồn kho, kho hàng, dự kiến hết hàng, thời gian tạo, thuộc tính, nhà cung cấp, thương hiệu, vị trí, loại hàng, bán trực tiếp, liên kết kênh bán, trạng thái hàng hóa.
- Cột: mã hàng, tên hàng, nhóm hàng, loại hàng, kích thước, giá bán, giá vốn, tồn kho, khách đặt, thời gian tạo, dự kiến hết hàng, trạng thái.
- Ngày `01/07/2026`, bộ lọc `Hàng đang kinh doanh` có `381 hàng hóa (495 mã hàng)`.
- Có dòng tổng hợp phía trên danh sách và cột `Dự kiến hết hàng`.

Quyết định QC-OMS hiện tại:

- Sản phẩm ngưng bán không xuất hiện trong POS, chỉ thấy trong trang Hàng hóa qua bộ lọc trạng thái.
- Vật tư cuộn/tấm cần quản lý tồn vật lý theo cuộn/tấm, không chỉ tổng m2 như KiotViet.
- Tấm lỡ dưới `0.3m2` mặc định bỏ, có thể tạo/sửa thủ công nếu tận dụng.
- Không tạo field/module riêng cho thương hiệu hoặc kênh bán; nếu cần nhận diện thì ghi trong tên/mã/nhóm hàng.
- Nhà cung cấp/vị trí để sau khi Purchase/Warehouse location được chốt.

### 4.6. Thiết lập giá

KiotViet có:

- Bảng giá chung và nhiều bảng giá khác.
- Cột dạng ngang: mã hàng, tên hàng, tồn kho, giá vốn, giá nhập cuối, bảng giá chung, BG1, BG2...
- Có công thức cập nhật giá hàng loạt.

Quyết định QC-OMS hiện tại:

- Bảng giá theo nhóm khách, không trải 5 giá lịch sử ra thành 5 cột.
- Giá mặc định luôn lấy theo bảng giá hiện hành.
- Giá sửa tay lưu lịch sử theo khách + sản phẩm; POS có nút xem 5 giá gần đây.

### 4.7. Kiểm kho

KiotViet có:

- Phiếu tạm, đã cân bằng kho, đã hủy.
- Cột: mã kiểm kho, thời gian, ngày cân bằng, số lượng thực tế, tổng thực tế, tổng chênh lệch, lệch tăng, lệch giảm, ghi chú, trạng thái.
- Khi mở rộng khoảng `01/07/2016 - 01/07/2026`, có `332 giao dịch`.
- Nhiều phiếu là phiếu tự động khi cập nhật Hàng hóa, ví dụ ghi chú `Phiếu kiểm kho được tạo tự động khi cập nhật Hàng hóa:<Mã hàng>`.

Kết luận:

- Đây là màn có dữ liệu thật và trùng nghiệp vụ QC-OMS, nên giữ trong MVP.
- Không dùng bộ lọc `Tháng này` để đánh giá mức độ sử dụng của Kiểm kho.

QC-OMS đã đặc tả tương ứng tại:

- `docs/02-PRD-UX-PhongCanh/Inventory/04-STOCKTAKE.md`
- `docs/03-BUSINESS-NghiepVu/Inventory/STOCKTAKE.md`

### 4.8. Nhà cung cấp / Nhập hàng / Mua dịch vụ

KiotViet có:

- Nhà cung cấp: mã NCC, tên, SĐT, email, địa chỉ, nhóm NCC, mã số thuế, nợ cần trả hiện tại, tổng mua.
- Nhập hàng: phiếu tạm, đã nhập hàng, đã hủy; mã nhập hàng, mã NCC, nhà cung cấp, tổng số lượng, tổng tiền hàng, cần trả NCC, tiền đã trả NCC.
- Mua dịch vụ: mã phiếu, loại chi, người nhận, cần thanh toán, đã thanh toán, còn phải trả.

Đề xuất QC-OMS:

- Chưa đưa Purchase vào MVP nếu chưa chốt nhập kho vật lý theo cuộn/tấm.
- Khi làm sau này, tách `Suppliers`, `Purchase Receipts` và `Supplier Payables`.
- Mua dịch vụ có thể đi qua phiếu chi Sổ quỹ trước, chưa cần module riêng.
- Draft chi tiết: `docs/superpowers/specs/2026-07-01-kv-purchase-supplier-draft.md`.

### 4.9. Báo cáo

KiotViet có:

- Báo cáo cuối ngày: doanh thu, thực thu, số lượng giao dịch, thu khác, phương thức thanh toán.
- Báo cáo bán hàng: doanh thu theo thời gian, bảng giá, nhân viên, kênh bán.
- Báo cáo tài chính: tổng hợp theo tháng/năm.
- Báo cáo hàng hóa: top sản phẩm doanh thu cao, top sản phẩm bán chạy, lọc theo nhóm hàng/tồn kho.

Đề xuất QC-OMS:

- Báo cáo/phân tích vẫn cần đầy đủ để quản trị xưởng, nhưng bỏ các chiều không có trong QC-OMS.
- Làm báo cáo cuối ngày trước, gắn với đối soát tiền mặt/tài khoản ngân hàng.
- Giữ các nhóm phân tích: bán hàng, khách hàng, công nợ, hàng hóa/tồn kho, tài chính.
- Bỏ kênh bán, VAT/HĐĐT và thương hiệu/thuộc tính retail.
- Thương hiệu nếu cần thì ghi trong tên hàng/mã hàng/nhóm hàng, không tạo field báo cáo riêng.
- Báo cáo hàng hóa phải ưu tiên tồn vật lý cuộn/tấm, không chỉ tổng m2.
- Chưa gọi là báo cáo lợi nhuận đầy đủ nếu chưa chốt giá vốn/nhập hàng/chi phí sản xuất.
- Draft chi tiết: `docs/superpowers/specs/2026-07-01-kv-reporting-draft.md`.

### 4.10. Xuất dùng nội bộ / Xuất hủy / Trả hàng

KiotViet có:

- Xuất dùng nội bộ: phiếu tạm, hoàn thành, đã hủy; loại xuất, người nhận, tổng giá trị.
- Xuất hủy: phiếu tạm, hoàn thành, đã hủy; tổng giá trị hủy, người xuất hủy, ghi chú.
- Trả hàng nhập: mã trả hàng nhập, mã nhập hàng, nhà cung cấp, NCC cần trả/NCC đã trả.
- Trả hàng bán: trả theo hóa đơn/trả nhanh/chuyển hoàn, cần trả khách/đã trả khách.
- Các màn Xuất dùng nội bộ, Xuất hủy, Trả hàng nhập, Trả hàng bán đều đã kiểm tra dài hạn `01/07/2016 - 01/07/2026`; kết quả vẫn không có giao dịch phù hợp.

Đề xuất QC-OMS:

- Xuất hủy nên giữ ở mức tối giản dưới dạng điều chỉnh giảm tồn/hủy vật tư.
- Xuất dùng nội bộ chưa cần module riêng; nếu cần thì dùng lý do `Dùng nội bộ` trong điều chỉnh giảm tồn.
- Trả hàng nhập để sau Purchase/Supplier.
- Trả hàng bán tiếp tục không thuộc MVP; hóa đơn sai xử lý bằng sửa chứng từ `MaCu.01`.
- Draft chi tiết: `docs/superpowers/specs/2026-07-01-kv-inventory-adjustments-returns-draft.md`.

### 4.11. Nguyên tắc lược bỏ theo dữ liệu KiotViet

Khi KiotViet có một màn nhưng tài khoản thực tế không có dữ liệu đáng kể sau khi đã kiểm tra thời gian dài, QC-OMS không mặc định làm theo.

Áp dụng hiện tại:

- Giữ chắc: sản phẩm, khách hàng, bảng giá, POS, hóa đơn/chứng từ, sổ quỹ, công nợ, tồn kho/cuộn/tấm, báo cáo quản trị.
- Giữ tối giản hoặc hỏi Owner: kiểm kho, hủy vật tư/điều chỉnh giảm tồn, báo cáo cuối ngày.
- Bỏ khỏi MVP: trả hàng bán, trả hàng nhập, vận đơn/COD, VAT/HĐĐT, kênh bán online, thương hiệu retail, mua dịch vụ riêng.
- Để sau: nhà cung cấp/nhập hàng/công nợ NCC, nếu sau này cần quản lý nhập kho và giá vốn chặt hơn.

---

## 5. Thứ tự spec nên làm tiếp

1. Sales Documents PRD-UX: danh sách hóa đơn/báo giá, chi tiết chứng từ, sửa/hủy/in lại.
2. Customer Management PRD-UX: danh sách khách, chi tiết khách, nhóm khách, lịch sử bán, công nợ.
3. Price Book PRD-UX: bảng giá chung, bảng giá theo nhóm, thao tác cập nhật giá.
4. Purchase/Supplier: đã có draft, chưa làm MVP nếu Owner chưa chốt.
5. Reports: đã có draft, ưu tiên báo cáo cuối ngày sau khi Finance/đối soát ổn định.
6. Inventory adjustments/returns: đã có draft, cần Owner chốt giữ tối giản tới đâu.
