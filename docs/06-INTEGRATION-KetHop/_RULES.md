# RULES — 06-INTEGRATION-KetHop

## 1. Mục đích

Đây là **Source of Truth** cho mọi tích hợp với hệ thống bên ngoài.

Folder này trả lời các câu hỏi:

- Hệ thống kết nối với dịch vụ nào?
- Mục đích của kết nối là gì?
- Dữ liệu trao đổi như thế nào?
- Khi nào thực hiện tích hợp?

---

## 2. CHỈ GHI

- ✓ Printer Integration
- ✓ QR Code
- ✓ Email
- ✓ SMS / Zalo
- ✓ Banking
- ✓ AI / LLM
- ✓ Webhook
- ✓ External API
- ✓ Đồng bộ dữ liệu
- ✓ Queue / Message Broker
- ✓ File Import / Export

---

## 3. ĐƯỢC PHÉP THAM CHIẾU

Có thể tham chiếu:

- Feature
- Business Rule
- Database
- Backend

nếu chỉ nhằm giải thích mục đích của Integration.

Không được đặc tả lại.

---

## 4. KHÔNG ĐẶC TẢ

Không được đặc tả:

- ✗ Vision
- ✗ Feature Specification
- ✗ UI / Wireframe / Mockup
- ✗ Business Rule đầy đủ
- ✗ Database Schema
- ✗ Backend Workflow nội bộ
- ✗ Frontend Code
- ✗ Hạ tầng triển khai

Các nội dung trên phải được ghi tại đúng tầng theo [ARCHITECTURE.md](http://ARCHITECTURE.md).

---

## 5. Nguyên tắc

- Mỗi Integration chỉ có một Source of Truth.
- Mỗi hệ thống bên ngoài có một thư mục riêng.
- Không sao chép Business Rule sang Integration.
- Chỉ mô tả cách hệ thống giao tiếp với dịch vụ bên ngoài.
- Nếu cần giải thích nghiệp vụ, tham chiếu sang 03-BUSINESS.
- Nếu cần giải thích dữ liệu, tham chiếu sang 04-DATABASE.
- Nếu cần giải thích cách xử lý trong hệ thống, tham chiếu sang 05-BACKEND.

---

## 6. Cấu trúc chuẩn

Một tài liệu Integration nên có:

1. Mục đích
2. Hệ thống tích hợp
3. Dữ liệu trao đổi
4. Điều kiện kích hoạt
5. Luồng giao tiếp
6. Trường hợp lỗi
7. Business Rule liên quan

Không bắt buộc phải có đủ nếu Integration đơn giản.

---

## 7. Quy tắc bảo trì

- Khuyến nghị: 150–300 dòng / file.
- Nếu vượt khoảng 400 dòng, đề xuất tách.
- Không tự tách khi chưa được người dùng phê duyệt.

---

## 8. Quy trình cập nhật

Integration là Source of Truth cho tài liệu tích hợp.

Khi thay đổi tích hợp:

1. Cập nhật 03-BUSINESS nếu nghiệp vụ thay đổi.
2. Cập nhật 05-BACKEND nếu luồng xử lý thay đổi.
3. Cập nhật 06-INTEGRATION để phản ánh cách kết nối.

Không thiết kế Integration trước Business.
