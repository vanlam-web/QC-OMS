# KiotViet Reporting Draft for QC-OMS

> Ngày rà: 2026-07-01  
> Trạng thái: Draft tham khảo, chưa phải Source of Truth  
> Nguồn: KiotViet `Báo cáo cuối ngày`, `Báo cáo bán hàng`, `Báo cáo tài chính`, `Báo cáo hàng hóa`

---

## 1. Mục tiêu

Draft này ghi lại hướng báo cáo KiotViet có liên quan tới QC-OMS và đề xuất bộ báo cáo đầy đủ nhưng đúng nghiệp vụ xưởng.

Định hướng Owner đã chốt:

- Báo cáo/phân tích vẫn cần đầy đủ để quản trị xưởng.
- Bỏ các chiều không có trong QC-OMS: kênh bán, VAT/HĐĐT, thương hiệu/thuộc tính retail.
- Thương hiệu không cần field riêng; nếu cần thì ghi trực tiếp trong tên hàng hoặc nhóm hàng.

---

## 2. KiotViet có gì

### 2.1. Báo cáo cuối ngày

KiotViet có:

- Kiểu hiển thị báo cáo dọc.
- Mối quan tâm: bán hàng và các nhóm khác.
- Lọc ngày, khách hàng, nhân viên, người tạo, phương thức thanh toán, phương thức bán hàng.
- Nội dung thấy được: doanh thu, thực thu, số lượng giao dịch, thu khác, làm tròn, phí trả hàng, VAT.
- Có gợi ý bật thông báo tiền về để đối soát cuối ngày.

### 2.2. Báo cáo bán hàng

KiotViet có:

- Biểu đồ và báo cáo.
- Lọc bảng giá, thời gian, phương thức bán hàng, kênh bán, nhân viên.
- Chỉ số chính: doanh thu thuần theo thời gian.

### 2.3. Báo cáo tài chính

KiotViet có:

- Báo cáo theo tháng/năm.
- Lọc thời gian.
- Có xử lý dữ liệu tài chính tổng hợp.

### 2.4. Báo cáo hàng hóa

KiotViet có:

- Biểu đồ và báo cáo.
- Lọc kho, bảng giá, thời gian, hàng hóa, loại hàng, thương hiệu, nhóm hàng, tồn kho, nhóm khách/khách hàng.
- Top sản phẩm doanh thu cao nhất.
- Top sản phẩm bán chạy theo số lượng.

---

## 3. Đề xuất báo cáo QC-OMS theo thứ tự

### 3.1. Báo cáo cuối ngày

Nên làm sớm nhất sau khi POS, Sổ quỹ và Đối soát ổn định.

Nội dung cần có:

- Tổng doanh thu hóa đơn hoàn thành trong ngày.
- Tổng thực thu trong ngày.
- Thu tiền mặt.
- Thu chuyển khoản theo từng tài khoản.
- Tổng công nợ mới phát sinh.
- Tổng thu nợ cũ.
- Tổng chi trong ngày.
- Chênh lệch đối soát tiền mặt/từng tài khoản.
- Danh sách hóa đơn đã hủy/sửa trong ngày.

Mục tiêu là giúp cuối ngày kiểm tra:

```text
Tiền mặt hệ thống = tiền mặt trong két
Từng tài khoản ngân hàng = số thực tế trên app ngân hàng
```

### 3.2. Báo cáo bán hàng

Làm sau báo cáo cuối ngày.

Nội dung cần có:

- Doanh thu theo ngày/tuần/tháng.
- Doanh thu theo nhân viên bán.
- Doanh thu theo khách hàng.
- Doanh thu theo nhóm khách/bảng giá.
- Danh sách hóa đơn lớn.
- Danh sách hóa đơn còn nợ.
- Danh sách hóa đơn đã sửa/hủy.
- Tỷ lệ thu tiền ngay so với ghi nợ.
- Top khách hàng theo doanh thu.
- Top khách hàng còn nợ.

Không có báo cáo theo kênh bán vì QC-OMS chỉ quản lý bán hàng nội bộ của xưởng trong MVP.

### 3.3. Báo cáo hàng hóa/tồn kho

Làm sau Inventory ổn định.

Nội dung cần có:

- Tồn theo sản phẩm.
- Tồn theo cuộn vật lý.
- Tồn theo tấm nguyên/tấm dở/tấm lỡ.
- Sản phẩm sắp hết tồn.
- Sản phẩm bán nhiều.
- Sản phẩm doanh thu cao.
- Sản phẩm tồn âm.
- Sản phẩm ngưng bán còn tồn.
- Chênh lệch OMS/bill với máy sản xuất, nếu đã có dữ liệu đối soát.

Báo cáo hàng hóa của QC-OMS phải ưu tiên tồn vật lý cuộn/tấm, không chỉ tổng tồn m2 như KiotViet.

Không có báo cáo theo thương hiệu riêng. Nếu cần nhận diện dòng vật tư/nhãn vật tư, dùng tên hàng, mã hàng hoặc nhóm hàng.

### 3.4. Báo cáo tài chính

Làm sau khi có đủ sổ quỹ, công nợ khách, công nợ NCC nếu có.

Nội dung cần có:

- Tổng thu.
- Tổng chi.
- Dòng tiền ròng.
- Công nợ khách còn phải thu.
- Công nợ NCC còn phải trả, nếu làm Purchase.
- Tồn quỹ tiền mặt và từng tài khoản.
- Doanh thu chưa thu tiền.
- Thu nợ cũ.
- Chi phí/phiếu chi theo loại chi.

Không nên gọi là lợi nhuận đầy đủ nếu chưa chốt giá vốn, nhập hàng và chi phí sản xuất.

### 3.5. Báo cáo công nợ

Làm cùng hoặc sau báo cáo tài chính.

Nội dung cần có:

- Tổng nợ khách hàng.
- Nợ theo từng khách.
- Nợ theo từng hóa đơn.
- Hóa đơn nợ lâu ngày.
- Lịch sử thu nợ.
- Khách có nợ tăng nhanh.

Không tạo báo cáo khách trả trước trong MVP vì hệ thống không tạo công nợ âm.

---

## 4. Quyết định hiện tại / giả định để làm tiếp

Các điểm đã chuyển sang PRD-UX `Reports/01-END-OF-DAY.md`:

- Báo cáo cuối ngày có nút in/xuất file.
- Báo cáo cuối ngày là báo cáo động theo khoảng thời gian; phiên nhập số thực tế và chốt thuộc module Đối soát.
- Doanh thu tính theo thời điểm checkout hóa đơn hoàn thành, không chờ thu đủ tiền.
- Hóa đơn còn nợ vẫn tính vào doanh thu ngày bán; phần chưa thu đi vào công nợ mới.
- Thực thu, tiền mặt và chuyển khoản phải khớp với Sổ quỹ trong cùng kỳ.
- Chuyển khoản phải tách theo từng tài khoản ngân hàng.
- Chứng từ sửa/hủy trong ngày phải hiện để kiểm tra.

Các điểm để sau:

- Báo cáo lợi nhuận chuẩn kế toán chưa làm khi chưa chốt giá vốn, nhập hàng và chi phí sản xuất.
- Báo cáo công nợ theo tuổi nợ 7/15/30 ngày để sau; trước mắt có danh sách nợ theo khách/hóa đơn và hóa đơn nợ lâu ngày.
- Báo cáo nhân viên bán có thể làm sau báo cáo cuối ngày, khi phân quyền/nhân viên ổn định hơn.

---

## 5. Không đưa vào MVP nếu chưa chốt

- Báo cáo kênh bán online.
- Báo cáo theo kênh bán nói chung.
- Báo cáo VAT/HĐĐT/thuế kế toán.
- Báo cáo trả hàng.
- Báo cáo lợi nhuận chuẩn kế toán.
- Báo cáo theo thương hiệu/thuộc tính như retail.
- Field thương hiệu riêng trong báo cáo hàng hóa.
