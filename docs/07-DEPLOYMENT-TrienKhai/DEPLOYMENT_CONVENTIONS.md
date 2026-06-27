# Quy ước triển khai và vận hành QC-OMS

## 1. Mục đích

Tài liệu này quy định các tiêu chuẩn triển khai, vận hành và bảo trì hệ thống QC-OMS.

Mục tiêu:

- Thống nhất cách triển khai.
- Đảm bảo an toàn.
- Dễ mở rộng.
- Dễ khôi phục khi có sự cố.
- Mọi AI triển khai theo cùng một chuẩn.

---

# 2. Kiến trúc triển khai

Triển khai theo mô hình nhiều môi trường:

Development

↓

Staging

↓

Production

Mỗi môi trường độc lập.

Không dùng chung Database.

---

# 3. Environment

Không hardcode:

- Password
- API Key
- Secret
- Token
- Connection String

Tất cả phải sử dụng:

- Environment Variables
- Secret Manager

---

# 4. Docker

Ưu tiên Container hóa.

Mỗi Service có Dockerfile riêng.

Docker Compose chỉ dùng cho Development.

---

# 5. CI/CD

Deployment phải thông qua Pipeline.

Không deploy thủ công lên Production nếu không có quy trình phê duyệt.

Pipeline nên gồm:

- Build
- Test
- Security Scan
- Deploy

---

# 6. Backup

Database phải có Backup tự động.

Backup phải:

- có lịch chạy
- có kiểm tra thành công
- có khả năng Restore

---

# 7. Restore

Restore phải được kiểm tra định kỳ.

Mọi tài liệu Restore phải đủ để một người mới có thể thực hiện.

---

# 8. Rollback

Mỗi lần Deploy phải có phương án Rollback.

Rollback phải:

- đơn giản
- nhanh
- hạn chế mất dữ liệu

---

# 9. Monitoring

Theo dõi tối thiểu:

- Uptime
- CPU
- Memory
- Disk
- Network
- Error Rate
- Response Time

---

# 10. Logging

Mọi Service phải ghi Log.

Log nên có:

- Timestamp
- Service
- Level
- Trace ID
- Message

Không ghi:

- Password
- Token
- Secret
- Dữ liệu nhạy cảm

---

# 11. Alerting

Hệ thống nên cảnh báo khi:

- Service Down
- Error Rate tăng bất thường
- Disk gần đầy
- Memory cao
- Backup thất bại
- SSL sắp hết hạn

---

# 12. Security

- Luôn dùng HTTPS cho dịch vụ công khai.
- Chỉ mở các cổng cần thiết.
- Nguyên tắc quyền tối thiểu (Least Privilege).
- Không lưu thông tin nhạy cảm trong mã nguồn.

---

# 13. Disaster Recovery

Phải có kế hoạch cho:

- Mất Database
- Mất Server
- Mất Storage
- Mất Network
- Khôi phục từ Backup

---

# 14. Version Management

Deployment phải ghi rõ:

- Phiên bản
- Ngày triển khai
- Người triển khai
- Thay đổi chính

---

# 15. Naming Convention

Quy ước thống nhất:

Environment

```text
dev
staging
prod

```

Docker Image

```text
qc-oms-api
qc-oms-web
qc-oms-worker

```

Container

```text
api
web
worker
redis
postgres

```

---

# 16. Documentation

Mỗi môi trường nên có:

- [README.md](http://README.md)
- [DEPLOY.md](http://DEPLOY.md)
- [BACKUP.md](http://BACKUP.md)
- [RESTORE.md](http://RESTORE.md)
- [MONITORING.md](http://MONITORING.md)
- [CHANGELOG.md](http://CHANGELOG.md)

---

# 17. Source of Truth

Deployment chỉ mô tả:

- Cách triển khai
- Cách vận hành
- Cách giám sát

Không định nghĩa:

- Business Rule
- Database Schema
- API
- Feature

Các nội dung này phải tham chiếu đến tầng tương ứng.

---

# 18. Nguyên tắc cuối cùng

Nếu có mâu thuẫn:

DOCUMENT_[RULES.md](http://RULES.md)

↓

[ARCHITECTURE.md](http://ARCHITECTURE.md)

↓

03-BUSINESS

↓

04-DATABASE

↓

05-BACKEND

↓

06-INTEGRATION

↓

DEPLOYMENT_[CONVENTIONS.md](http://CONVENTIONS.md)

↓

07-DEPLOYMENT

Deployment chỉ hiện thực hóa việc triển khai và vận hành.

Không quyết định nghiệp vụ hoặc kiến trúc hệ thống.