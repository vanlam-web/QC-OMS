# Quy ước phát triển Integration của QC-OMS

## 1. Mục đích

Tài liệu này quy định các tiêu chuẩn kỹ thuật khi tích hợp QC-OMS với hệ thống bên ngoài.

Mục tiêu:

- Thống nhất cách tích hợp.
- Dễ bảo trì.
- Dễ thay thế dịch vụ.
- Mọi AI triển khai Integration theo cùng một chuẩn.

---

# 2. Nguyên tắc chung

- Integration không được tự tạo Business Rule.
- Integration chỉ thực hiện giao tiếp với hệ thống bên ngoài.
- Business vẫn thuộc 03-BUSINESS.
- Workflow nội bộ vẫn thuộc 05-BACKEND.

---

# 3. Kiến trúc

Luồng chuẩn:

Business

↓

Backend

↓

Integration

↓

External System

Integration không được gọi trực tiếp từ UI.

---

# 4. Protocol

Ưu tiên sử dụng:

- HTTPS / REST
- Webhook
- WebSocket
- Queue / Message Broker
- SFTP (nếu cần)
- Serial / TCP (thiết bị phần cứng)

Mỗi Integration phải ghi rõ protocol sử dụng.

---

# 5. Authentication

Không lưu trực tiếp:

- API Key
- Secret
- Password
- Token

Tất cả phải lấy từ:

- Environment Variables
- Secret Manager

---

# 6. Timeout

Mọi Integration phải có Timeout.

Không được chờ vô hạn.

Nếu Timeout:

- ghi log
- trả lỗi phù hợp
- không làm treo hệ thống

---

# 7. Retry Policy

Retry chỉ áp dụng với lỗi tạm thời.

Retry phải:

- giới hạn số lần
- có khoảng nghỉ giữa các lần
- tránh gửi trùng dữ liệu

Không retry với lỗi nghiệp vụ.

---

# 8. Idempotency

Các thao tác có thể gọi lại phải hỗ trợ Idempotency.

Không tạo dữ liệu trùng khi nhận cùng một yêu cầu nhiều lần.

---

# 9. Logging

Mọi Integration phải ghi Log:

- Request
- Response
- Error
- Retry
- Timeout

Không ghi:

- Password
- API Key
- Secret
- Token

---

# 10. Error Handling

Mọi lỗi phải:

- có mã lỗi
- có mô tả
- có Trace ID
- ghi log đầy đủ

Không hiển thị lỗi kỹ thuật trực tiếp cho người dùng.

---

# 11. Queue

Nếu sử dụng Queue:

- Message phải có ID
- Có trạng thái xử lý
- Có cơ chế Retry
- Có cơ chế Dead Letter Queue (nếu áp dụng)

---

# 12. Webhook

Webhook phải:

- xác thực nguồn gửi
- kiểm tra chữ ký (Signature) nếu có
- xử lý Idempotency
- trả HTTP Status đúng chuẩn

---

# 13. Đồng bộ dữ liệu

Phải xác định rõ:

- Một chiều hay hai chiều
- Đồng bộ thời gian thực hay theo lịch
- Dữ liệu nào là Source of Truth

Không để hai hệ thống cùng ghi đè dữ liệu mà không có quy tắc.

---

# 14. Phiên bản API

Nếu hệ thống ngoài có Version:

- ghi rõ Version
- ghi ngày cập nhật
- ghi tài liệu tham chiếu

Không nâng Version khi chưa đánh giá ảnh hưởng.

---

# 15. Monitoring

Mọi Integration nên có:

- Health Check
- Error Rate
- Retry Count
- Timeout Count
- Success Rate

Để dễ theo dõi và xử lý sự cố.

---

# 16. Security

- Luôn dùng HTTPS nếu hỗ trợ.
- Kiểm tra chứng chỉ khi kết nối.
- Không ghi thông tin nhạy cảm vào Log.
- Không hardcode thông tin xác thực.

---

# 17. Naming Convention

Mỗi Integration có một thư mục riêng.

Ví dụ:

Printer/

Zalo/

QR/

Email/

Webhook/

AI/

Payment/

Mỗi Integration nên có:

- [README.md](http://README.md)
- [API.md](http://API.md)
- [CONFIG.md](http://CONFIG.md)
- [ERRORS.md](http://ERRORS.md) (nếu cần)

---

# 18. Nguyên tắc cuối cùng

Nếu có mâu thuẫn:

DOCUMENT_[RULES.md](http://RULES.md)

↓

[ARCHITECTURE.md](http://ARCHITECTURE.md)

↓

03-BUSINESS

↓

05-BACKEND

↓

INTEGRATION_[CONVENTIONS.md](http://CONVENTIONS.md)

↓

06-INTEGRATION

Integration chỉ hiện thực hóa việc kết nối.

Không quyết định nghiệp vụ.