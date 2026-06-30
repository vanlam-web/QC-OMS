# 02-SALES-DOCUMENT-DETAIL — Chi tiết chứng từ bán hàng

> **Trạng thái:** 🔨 Đang xây dựng

---

## 1. Mục tiêu

Trang chi tiết giúp kiểm tra toàn bộ nội dung chứng từ đã lưu, gồm dữ liệu snapshot, thanh toán, công nợ, trừ kho và lịch sử sửa/hủy.

---

## 2. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ HD000123                          Hoàn thành        [In lại] [Sửa] [Hủy]     │
│ Khách: KH000123 - Công ty A       Người bán: ...    Thời gian: ...          │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Tổng quan] [Dòng hàng] [Thanh toán & công nợ] [Kho] [Lịch sử]              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tab Tổng quan

Hiển thị:

- Mã chứng từ.
- Loại chứng từ: Báo giá hoặc Hóa đơn.
- Trạng thái.
- Khách hàng snapshot tại thời điểm lưu.
- Người bán/người tạo.
- Bảng giá đã áp dụng.
- Ghi chú đơn.
- Tổng tiền hàng, giảm giá, khách cần trả, khách đã trả, còn nợ hoặc tiền thừa đã trả lại.

Nếu chứng từ là bản sửa:

- Hiển thị mã chứng từ gốc.
- Hiển thị mã chứng từ liền trước.
- Có liên kết mở chứng từ cũ.

Nếu chứng từ bị hủy:

- Hiển thị lý do hủy.
- Hiển thị người hủy và thời gian hủy.

---

## 4. Tab Dòng hàng

Mỗi dòng hiển thị dữ liệu snapshot tại thời điểm lưu:

- Mã hàng và tên hàng.
- Đơn vị bán.
- Số lượng.
- Kích thước, mét tới hoặc m2 nếu có.
- Đơn giá đã áp dụng.
- Nguồn giá: bảng giá chung, bảng giá nhóm, fallback hoặc giá sửa tay.
- Thành tiền.
- Ghi chú dòng.

Không tự cập nhật tên hàng, bảng giá hoặc thông tin khách theo dữ liệu hiện tại. Lịch sử phải giữ đúng nội dung đã bán/báo giá.

---

## 5. Tab Thanh toán & công nợ

Hiển thị:

- Khách cần trả.
- Khách đã trả.
- Phương thức thu: tiền mặt, chuyển khoản hoặc kết hợp.
- Tài khoản nhận chuyển khoản nếu có.
- Phiếu thu liên quan trong Sổ quỹ.
- Số còn nợ của hóa đơn nếu có.
- Các lần thu nợ đã phân bổ vào hóa đơn này.

Quy tắc:

- Không sửa trực tiếp thanh toán trong chi tiết hóa đơn.
- Thu thêm nợ thực hiện ở module Công nợ/Sổ quỹ theo quy tắc phân bổ hóa đơn cũ nhất trước.
- Nếu hóa đơn bị sửa/hủy, tác động đảo tiền/công nợ phải được ghi thành lịch sử, không xóa dòng cũ.

---

## 6. Tab Kho

Hiển thị các phát sinh kho liên quan chứng từ:

- Dòng sản phẩm/vật tư bị trừ.
- Số lượng trừ.
- Đơn vị tồn.
- Cuộn/tấm/tấm lỡ liên quan nếu có.
- Trạng thái trừ kho: đã trừ, trừ âm, đã đảo do hủy/sửa.

Trong MVP, kho được trừ khi lưu/chốt hóa đơn chính thức. Báo giá không trừ kho.

---

## 7. Tab Lịch sử

Ghi lại timeline:

- Tạo báo giá.
- Mở lại báo giá.
- Checkout thành hóa đơn.
- In lại bill.
- Sửa hóa đơn.
- Hủy hóa đơn.
- Phát sinh phiếu thu/công nợ.
- Đảo kho/đảo tiền/công nợ nếu có.

Mỗi dòng lịch sử có thời gian, nhân viên, hành động và ghi chú.

---

## 8. Thao tác

### 8.1. Mở lại báo giá

- Chỉ áp dụng cho chứng từ loại Báo giá chưa hủy.
- Mở POS với nội dung báo giá như một nháp.
- Khi checkout, tạo hóa đơn `HD...` và giữ liên kết báo giá nguồn.

### 8.2. Sửa hóa đơn

- Chỉ áp dụng cho hóa đơn hoàn thành.
- Mở POS với snapshot hóa đơn cũ.
- Nhân viên sửa nội dung và xác nhận lại thanh toán.
- Khi lưu, tạo chứng từ mới theo mã `MaCu.01`.
- Chứng từ cũ chuyển **Đã hủy** với lý do sửa chứng từ.

### 8.3. Hủy hóa đơn

- Yêu cầu nhập lý do hủy.
- Hóa đơn không bị xóa vật lý.
- Hệ thống ghi lịch sử hủy.
- Tác động đảo kho, sổ quỹ và công nợ theo Business tương ứng.

### 8.4. In lại bill

- Mở Bill Preview với dữ liệu snapshot của chứng từ.
- Không làm thay đổi doanh thu, kho, sổ quỹ hoặc công nợ.

