# 02-SALES-DOCUMENT-DETAIL — Chi tiết chứng từ bán hàng

> **Trạng thái:** 🔨 Đang xây dựng
> **Phase hiện tại:** Phase 2D readonly detail cho hóa đơn `HD...`

---

## 0. Ghi nhận từ KiotViet

Quan sát hóa đơn `HD010985` ngày `30/06/2026`:

- Chi tiết nằm ngay dưới dòng hóa đơn trong danh sách.
- Tab `Thông tin` của KiotViet có khách hàng, mã hóa đơn, trạng thái, người tạo, người bán, ngày bán, kênh bán, bảng giá và chi nhánh.
- Dòng hàng có mã hàng, tên hàng, số lượng, đơn giá, giá bán và thành tiền.
- Một số dòng in/kích thước thể hiện ngay trong dòng hàng, ví dụ `2.5m x 3.3m x 1`, số lượng tính thành `8.25`.
- Tổng cuối chứng từ gồm tổng tiền hàng, giảm giá hóa đơn, khách cần trả, khách đã trả.
- Hóa đơn có thể `Hoàn thành` nhưng `Khách đã trả = 0`, nghĩa là chi tiết chứng từ phải thể hiện công nợ theo hóa đơn.

Áp dụng cho QC-OMS:

- Chi tiết chứng từ ưu tiên đọc nhanh ngay trong trang danh sách hoặc trang detail riêng đều được, miễn giữ đủ snapshot.
- Kích thước/m2/mét tới phải là dữ liệu có cấu trúc trong dòng hàng, không chỉ là text trang trí.
- `Bảng giá` và người bán phải lưu snapshot theo chứng từ.
- QC-OMS không lưu/hiển thị kênh bán trong MVP vì chỉ có bán trực tiếp tại xưởng.

---

## 1. Mục tiêu

Trang chi tiết giúp kiểm tra toàn bộ nội dung chứng từ đã lưu, gồm dữ liệu snapshot, thanh toán, công nợ, trừ kho và lịch sử sửa/hủy.

Phase 2D hiện tại chỉ đọc dữ liệu đã có:

- thông tin tổng quan hóa đơn
- snapshot dòng hàng
- tổng tiền, khách đã trả, công nợ theo hóa đơn nếu có
- stock movements liên quan nếu Backend trả về

Chưa triển khai trong Phase 2D:

- nút sửa hóa đơn
- nút hủy hóa đơn
- mở lại báo giá
- in lại bill nếu Bill Preview/print flow chưa sẵn sàng
- transaction đảo kho/tiền/công nợ

Các phần bên dưới có nhãn **Future phase** là hướng thiết kế sau, không phải cam kết đã có trong implementation Phase 2D.

---

## 2. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ HD000123                          Hoàn thành        [Readonly detail]        │
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
- Chi nhánh không hiển thị trong MVP vì hiện chỉ có một chi nhánh ngầm; chỉ bổ sung nếu sau này thật sự vận hành nhiều chi nhánh/kho.
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
- Số lượng quy đổi tính tiền nếu dòng hàng phát sinh từ kích thước, ví dụ `2.5m x 3.3m x 1 = 8.25m2`.
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

Phase 2D chỉ hiển thị phần lịch sử đã có dữ liệu readonly. Các hành động mở lại/in/sửa/hủy/đảo là future phase nếu chưa có transaction tương ứng.

---

## 8. Thao tác Future Phase

Các thao tác trong mục này **chưa thuộc Phase 2D**. Chỉ bật sau khi có rule nghiệp vụ rõ, API transaction an toàn và kiểm thử đủ cho tác động liên bảng.

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
- Phải chạy trong transaction an toàn để đảo/ghi lại kho, sổ quỹ, công nợ và liên kết chứng từ.

### 8.3. Hủy hóa đơn

- Yêu cầu nhập lý do hủy.
- Hóa đơn không bị xóa vật lý.
- Hệ thống ghi lịch sử hủy.
- Tác động đảo kho, sổ quỹ và công nợ theo Business tương ứng.
- Không cho hủy bằng cách sửa rời từng bảng hoặc xóa dữ liệu cũ.

### 8.4. In lại bill

- Mở Bill Preview với dữ liệu snapshot của chứng từ.
- Không làm thay đổi doanh thu, kho, sổ quỹ hoặc công nợ.
