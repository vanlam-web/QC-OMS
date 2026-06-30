# KiotViet Reporting Draft for QC-OMS

> Ngày rà: 2026-07-01  
> Trạng thái: Draft tham khảo, chưa phải Source of Truth  
> Nguồn: KiotViet `Báo cáo cuối ngày`, `Báo cáo bán hàng`, `Báo cáo tài chính`, `Báo cáo hàng hóa`

---

## 1. Mục tiêu

Draft này ghi lại hướng báo cáo KiotViet có liên quan tới QC-OMS và đề xuất báo cáo tối thiểu nên làm sau khi dữ liệu lõi ổn định.

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

Nội dung tối thiểu:

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

Nội dung tối thiểu:

- Doanh thu theo ngày/tuần/tháng.
- Doanh thu theo nhân viên bán.
- Doanh thu theo khách hàng.
- Doanh thu theo nhóm khách/bảng giá.
- Danh sách hóa đơn lớn.
- Danh sách hóa đơn còn nợ.

Không cần kênh bán/phương thức bán hàng trong MVP nếu QC-OMS chỉ có POS nội bộ.

### 3.3. Báo cáo hàng hóa/tồn kho

Làm sau Inventory ổn định.

Nội dung tối thiểu:

- Tồn theo sản phẩm.
- Tồn theo cuộn vật lý.
- Tồn theo tấm nguyên/tấm dở/tấm lỡ.
- Sản phẩm sắp hết tồn.
- Sản phẩm bán nhiều.
- Chênh lệch OMS/bill với máy sản xuất, nếu đã có dữ liệu đối soát.

Báo cáo hàng hóa của QC-OMS phải ưu tiên tồn vật lý cuộn/tấm, không chỉ tổng tồn m2 như KiotViet.

### 3.4. Báo cáo tài chính

Làm sau khi có đủ sổ quỹ, công nợ khách, công nợ NCC nếu có.

Nội dung tối thiểu:

- Tổng thu.
- Tổng chi.
- Dòng tiền ròng.
- Công nợ khách còn phải thu.
- Công nợ NCC còn phải trả, nếu làm Purchase.
- Tồn quỹ tiền mặt và từng tài khoản.

Không nên gọi là lợi nhuận đầy đủ nếu chưa chốt giá vốn, nhập hàng và chi phí sản xuất.

---

## 4. Câu hỏi cần Owner chốt

1. Báo cáo cuối ngày cần in/xuất file hay chỉ xem trên màn hình?
2. Có cần chốt báo cáo cuối ngày thành một bản khóa lịch sử không, hay chỉ là báo cáo động?
3. Doanh thu tính theo thời điểm checkout hay thời điểm thanh toán đủ?
4. Hóa đơn còn nợ tính vào doanh thu ngày bán hay đợi thu đủ tiền?
5. Báo cáo lợi nhuận có cần trong MVP không, khi giá vốn cuộn/tấm chưa chắc đã đủ?
6. Có cần báo cáo theo nhân viên bán ngay từ đầu không?

---

## 5. Không đưa vào MVP nếu chưa chốt

- Báo cáo kênh bán online.
- Báo cáo VAT/HĐĐT.
- Báo cáo trả hàng.
- Báo cáo lợi nhuận chuẩn kế toán.
- Báo cáo theo thương hiệu/thuộc tính như retail.
- Dashboard biểu đồ phức tạp trước khi dữ liệu lõi ổn định.

