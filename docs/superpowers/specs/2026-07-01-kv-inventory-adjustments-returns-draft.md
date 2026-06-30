# KiotViet Inventory Adjustments & Returns Draft for QC-OMS

> Ngày rà: 2026-07-01  
> Trạng thái: Draft tham khảo, chưa phải Source of Truth  
> Nguồn: KiotViet `Xuất dùng nội bộ`, `Xuất hủy`, `Trả hàng nhập`, `Trả hàng`

---

## 1. Mục tiêu

Draft này ghi lại các luồng làm giảm/tăng lại tồn ngoài bán hàng trong KiotViet, rồi đề xuất phần nào QC-OMS nên giữ, bỏ hoặc để sau.

Nguyên tắc theo trao đổi với Owner:

- Không copy KiotViet 100%.
- Chỉ chốt Source of Truth khi Owner đồng ý.
- Nếu nghiệp vụ xưởng chưa sâu, ưu tiên lược bớt.

---

## 2. KiotViet có gì

### 2.1. Xuất dùng nội bộ

KiotViet có:

- Trạng thái: Phiếu tạm, Hoàn thành, Đã hủy.
- Bộ lọc thời gian, người tạo, người xuất, loại xuất, người nhận.
- Cột: mã xuất dùng nội bộ, loại xuất, tổng giá trị, thời gian, chi nhánh, ghi chú, trạng thái.
- Có thể xuất hàng ra khỏi kho cho mục đích nội bộ không gắn đơn bán.

### 2.2. Xuất hủy

KiotViet có:

- Trạng thái: Phiếu tạm, Hoàn thành, Đã hủy.
- Bộ lọc thời gian, người tạo, người xuất hủy.
- Cột: mã xuất hủy, tổng giá trị hủy, thời gian, người xuất hủy, ghi chú, trạng thái.
- Dùng để giảm tồn khi hàng hỏng/mất/không dùng được.

### 2.3. Trả hàng nhập

KiotViet có:

- Trạng thái: Phiếu tạm, Đã trả hàng, Đã hủy.
- Cột: mã trả hàng nhập, mã nhập hàng, nhà cung cấp, tổng tiền hàng, NCC cần trả, NCC đã trả, trạng thái.
- Liên quan trực tiếp tới module nhập hàng, nhà cung cấp, công nợ NCC.

### 2.4. Trả hàng bán

KiotViet có:

- Loại trả hàng: theo hóa đơn, trả nhanh, chuyển hoàn.
- Trạng thái: Đã trả, Đã hủy.
- Cột: mã trả hàng, mã hóa đơn, mã KH, khách hàng, tổng tiền hàng, cần trả khách, đã trả khách.
- Có VAT, kênh bán, thu khác hoàn lại, phí trả hàng.

---

## 3. Đề xuất cho QC-OMS

### 3.1. Xuất hủy: nên giữ nhưng làm tối giản

Nên có một cách ghi nhận vật tư bị bỏ/hỏng/mất ngoài bán hàng, đặc biệt với:

- tấm lỡ dưới ngưỡng `0.3m2` mặc định bỏ
- cuộn/tấm hỏng khi gia công
- vật tư sai, bẩn, rách, không tận dụng được

Đề xuất MVP:

- Không cần module lớn giống KiotViet.
- Có thể bắt đầu bằng **phiếu điều chỉnh giảm tồn / phiếu hủy vật tư** trong Inventory.
- Trạng thái tối giản: Hoàn thành, Đã hủy.
- Không cần Phiếu tạm nếu thao tác quá rườm rà.
- Bắt buộc ghi lý do khi hủy vật tư có giá trị đáng kể.

### 3.2. Xuất dùng nội bộ: để sau hoặc gộp vào điều chỉnh giảm tồn

Xưởng có thể có dùng vật tư nội bộ, nhưng nếu chưa quản trị sâu thì chưa cần module riêng.

Đề xuất:

- MVP không làm riêng `Xuất dùng nội bộ`.
- Nếu cần ghi nhận, dùng cùng form điều chỉnh giảm tồn và chọn lý do `Dùng nội bộ`.
- Sau này nếu phát sinh nhiều loại xuất nội bộ, mới tách module.

### 3.3. Trả hàng nhập: để sau Purchase

Trả hàng nhập chỉ có ý nghĩa khi QC-OMS đã quản lý:

- nhà cung cấp
- phiếu nhập
- công nợ NCC
- hoàn tiền/giảm nợ NCC
- tồn vật lý theo phiếu nhập

Đề xuất:

- Không làm MVP.
- Chỉ quay lại sau khi chốt Purchase Receipts và Supplier Payables.

### 3.4. Trả hàng bán: tiếp tục bỏ khỏi MVP

Owner đã chốt QC-OMS không có nghiệp vụ trả hàng trong POS MVP.

Đề xuất giữ:

- Không tạo module trả hàng bán.
- Nếu hóa đơn sai, xử lý bằng cơ chế sửa chứng từ `MaCu.01` và hủy chứng từ cũ.
- Nếu cần hoàn tiền đặc biệt, ghi phiếu chi thủ công với ghi chú, chưa tạo nghiệp vụ trả hàng chuẩn.

---

## 4. Câu hỏi cần Owner chốt

1. Có cần phiếu hủy vật tư riêng trong MVP không, hay chỉ cần thao tác sửa/tạo tấm lỡ rồi bỏ?
2. Khi tấm lỡ dưới `0.3m2` mặc định bỏ, có cần tự sinh lịch sử hủy không?
3. Vật tư hỏng ngoài sản xuất nên ghi bằng lý do `Hủy hỏng` hay cần nhiều lý do chi tiết?
4. Có cần `Dùng nội bộ` trong MVP không, hay để sau?
5. Nếu hóa đơn bán sai và khách muốn trả/hoàn tiền, có xử lý bằng sửa hóa đơn `.01` + phiếu chi thủ công đủ chưa?

---

## 5. Đề xuất tối giản để hỏi Owner

Phương án khuyến nghị:

- MVP chỉ có **Điều chỉnh giảm tồn / Hủy vật tư** trong Inventory.
- Lý do gồm:
  - Hủy hỏng.
  - Tấm lỡ bỏ.
  - Dùng nội bộ.
  - Khác.
- Không làm riêng Xuất dùng nội bộ.
- Không làm Trả hàng nhập.
- Không làm Trả hàng bán.

Nếu Owner thấy vẫn rườm rà:

- Chỉ ghi lịch sử tự động cho các thao tác hủy/tấm bỏ đã phát sinh từ quản lý cuộn/tấm.
- Chưa tạo màn danh sách phiếu riêng; xem lịch sử trong chi tiết vật tư/cuộn/tấm.

