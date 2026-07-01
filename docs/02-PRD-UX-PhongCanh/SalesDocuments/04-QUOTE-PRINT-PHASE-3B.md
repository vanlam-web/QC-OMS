# 04-QUOTE-PRINT-PHASE-3B — In/xem báo giá đơn giản

> **Trạng thái:** Source of Truth sơ bộ sau Owner chốt
> **Quyết định:** Phase sau 3A làm đơn giản trước, chưa làm hệ thống nhiều mẫu bill phức tạp

---

## 1. Phạm vi

Phase 3B cho báo giá chỉ cần:

- mở xem mẫu báo giá mặc định từ chứng từ `BG...`
- in từ trình duyệt hoặc xuất/chuẩn bị nội dung để nhân viên gửi thủ công
- dùng dữ liệu snapshot của báo giá, không tự cập nhật theo bảng giá/danh mục hiện tại

Chưa làm:

- nhiều mẫu báo giá tùy biến
- chọn nhiều bill/mẫu như bill hóa đơn nâng cao
- tự gửi Zalo/Facebook/email
- tracking lịch sử gửi
- ký số, VAT/HĐĐT, mẫu kế toán

---

## 2. Nút thao tác

Tại chi tiết báo giá hoặc danh sách báo giá:

| Nút | Hành vi |
|---|---|
| `Xem/In báo giá` | Mở màn/preview mẫu báo giá mặc định |
| `Tải/Xuất` | Optional nếu dễ làm; có thể để sau |

Nếu Phase 3B chưa có export ảnh/PDF ổn định, chỉ cần in qua trình duyệt.

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

Không hiển thị công nợ, tiền khách trả, tiền thừa hoặc dữ liệu kho vì báo giá chưa phát sinh các phần này.

---

## 4. Quy tắc dữ liệu

- Mẫu báo giá dùng snapshot tại thời điểm lưu báo giá.
- Báo giá Phase 3A không có revision/converted; in đúng snapshot báo giá đang mở.
- In/xem báo giá không làm thay đổi trạng thái báo giá.
- In/xem báo giá không ghi sổ quỹ, công nợ, tồn kho hoặc doanh thu.

---

## 5. Acceptance Criteria

- Từ chi tiết báo giá `BG...`, nhân viên mở được mẫu báo giá mặc định.
- Mẫu hiển thị đúng snapshot, gồm kích thước/diện tích/mét tới và chiết khấu nếu có.
- In qua trình duyệt được ở mức cơ bản.
- Không có cấu hình nhiều mẫu trong Phase 3B.
- Không tự gửi báo giá cho khách trong Phase 3B.
