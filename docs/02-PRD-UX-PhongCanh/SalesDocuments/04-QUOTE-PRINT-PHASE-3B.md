# 04-QUOTE-PRINT-PHASE-3B — In/xem báo giá đơn giản

> **Trạng thái:** Source of Truth sơ bộ sau Owner chốt
> **Quyết định:** Phase sau 3A làm đơn giản trước, chưa làm hệ thống nhiều mẫu bill phức tạp

---

## 1. Phạm vi

Phase 3B cho báo giá chỉ cần:

- mở xem mẫu báo giá mặc định từ chứng từ `BG...`
- in từ trình duyệt bằng `window.print()` hoặc cơ chế print native tương đương
- dùng dữ liệu snapshot của báo giá, không tự cập nhật theo bảng giá/danh mục hiện tại

Chưa làm:

- export PDF/ảnh ổn định ở backend
- nhiều mẫu báo giá tùy biến
- chọn nhiều bill/mẫu như bill hóa đơn nâng cao
- tự gửi Zalo/Facebook/email
- tracking lịch sử gửi
- ký số, VAT/HĐĐT, mẫu kế toán

---

## 2. Nút thao tác

Tại chi tiết báo giá:

| Nút | Hành vi |
|---|---|
| `Xem/In báo giá` | Mở màn/preview mẫu báo giá mặc định và cho in bằng trình duyệt |

Danh sách báo giá có thể có action nhanh nếu dễ làm, nhưng không bắt buộc. Không thêm nút `Tải/Xuất` trong Phase 3B để tránh kéo thêm PDF/export.

Nếu cần gửi cho khách, nhân viên dùng print dialog của trình duyệt để in/lưu PDF thủ công hoặc chụp/gửi thủ công bên ngoài hệ thống.

---

## 2.1. Cách triển khai UI đề xuất

Phase 3B ưu tiên frontend-only print view:

- dùng dữ liệu chi tiết báo giá đã có trong Sales Documents
- mở route/modal print riêng, ví dụ `/sales-documents/:id/quote-print` hoặc print panel trong detail
- giao diện print có nút `In` và `Đóng`
- nút `In` gọi print dialog của trình duyệt
- CSS có `@media print` để chỉ in phần báo giá, ẩn nav/sidebar/button

Không cần API render PDF, không cần lưu file, không cần lưu lịch sử in/gửi trong Phase 3B.

---

## 3. Nội dung mẫu báo giá mặc định

Mẫu báo giá tối thiểu hiển thị:

- thông tin cửa hàng
- mã báo giá `BG...`
- ngày tạo báo giá
- nhân viên tạo
- khách hàng/khách lẻ snapshot
- dòng hàng: mã/tên, đơn vị, kích thước/m2/mét tới nếu có, số lượng, đơn giá, chiết khấu, thành tiền
- tổng tiền hàng, giảm giá, tổng báo giá
- ghi chú đơn
- dòng chữ mặc định ngắn nếu cần, ví dụ giá trị báo giá chỉ dùng để tham khảo/xác nhận trước khi bán

Không hiển thị công nợ, tiền khách trả, tiền thừa hoặc dữ liệu kho vì báo giá chưa phát sinh các phần này.

---

## 4. Quy tắc dữ liệu

- Mẫu báo giá dùng snapshot tại thời điểm lưu báo giá.
- Báo giá Phase 3A không có revision/converted; in đúng snapshot báo giá đang mở.
- In/xem báo giá không làm thay đổi trạng thái báo giá.
- In/xem báo giá không ghi sổ quỹ, công nợ, tồn kho hoặc doanh thu.
- Không ghi log/lịch sử gửi/in bắt buộc trong Phase 3B.
- Không tự resolve lại giá hiện tại khi in.
- Nếu báo giá có dòng sản phẩm inactive/missing, bản in vẫn hiển thị snapshot đã lưu; cảnh báo xử lý checkout thuộc flow mở lại POS, không thuộc bản in.

---

## 4.1. Backend và database

Phase 3B không yêu cầu schema mới.

Backend chỉ cần đảm bảo endpoint đọc chi tiết chứng từ/báo giá trả đủ snapshot để frontend dựng mẫu in:

- thông tin cửa hàng/organization cơ bản nếu frontend chưa có
- mã/ngày/nhân viên/khách hàng snapshot
- dòng hàng và tổng tiền snapshot
- ghi chú

Không thêm endpoint render PDF/ảnh nếu chưa cần.

---

## 5. Acceptance Criteria

- Từ chi tiết báo giá `BG...`, nhân viên mở được mẫu báo giá mặc định.
- Mẫu hiển thị đúng snapshot, gồm kích thước/diện tích/mét tới và chiết khấu nếu có.
- In qua trình duyệt được ở mức cơ bản.
- Không có cấu hình nhiều mẫu trong Phase 3B.
- Không tự gửi báo giá cho khách trong Phase 3B.
- Không tạo stock/cash/debt/revenue/log gửi khi chỉ xem/in báo giá.
