# RULES — 07-DEPLOYMENT-TrienKhai

## 1. Mục đích

Đây là **Source of Truth** cho việc triển khai và vận hành hệ thống QC-OMS.

Folder này trả lời các câu hỏi:

- Hệ thống được triển khai như thế nào?
- Môi trường chạy gồm những gì?
- Quy trình Build và Deploy ra sao?
- Hệ thống được giám sát và sao lưu như thế nào?

---

## 2. CHỈ GHI

- ✓ Deployment Architecture
- ✓ Docker / Container
- ✓ VPS / Server
- ✓ Domain / DNS / SSL
- ✓ Environment (Dev / Staging / Production)
- ✓ CI/CD Pipeline
- ✓ Monitoring
- ✓ Logging
- ✓ Backup / Restore
- ✓ Disaster Recovery

---

## 3. ĐƯỢC PHÉP THAM CHIẾU

Có thể tham chiếu:

- Business
- Database
- Backend
- Integration

nếu chỉ nhằm giải thích cách triển khai.

Không được đặc tả lại.

---

## 4. KHÔNG ĐẶC TẢ

Không được đặc tả:

- ✗ Vision
- ✗ Feature Specification
- ✗ UI / Wireframe
- ✗ Business Rule
- ✗ Database Schema
- ✗ API Specification
- ✗ Backend Workflow
- ✗ Source Code

Các nội dung trên phải được ghi tại đúng tầng theo [ARCHITECTURE.md](http://ARCHITECTURE.md).

---

## 5. Nguyên tắc

- Mỗi môi trường triển khai chỉ có một Source of Truth.
- Chỉ mô tả cách triển khai và vận hành.
- Không sao chép Business Rule vào Deployment.
- Không sao chép API Specification vào Deployment.
- Nếu cần giải thích nghiệp vụ, tham chiếu sang 03-BUSINESS.
- Nếu cần giải thích Database, tham chiếu sang 04-DATABASE.
- Nếu cần giải thích Backend, tham chiếu sang 05-BACKEND.

---

## 6. Cấu trúc chuẩn

Một tài liệu Deployment nên có:

1. Mục đích
2. Kiến trúc triển khai
3. Thành phần hệ thống
4. Môi trường
5. Quy trình triển khai
6. Giám sát
7. Backup / Restore

Không bắt buộc phải có đủ nếu tài liệu đơn giản.

---

## 7. Quy tắc bảo trì

- Khuyến nghị: 150–300 dòng / file.
- Nếu vượt khoảng 400 dòng, đề xuất tách.
- Không tự tách khi chưa được người dùng phê duyệt.

---

## 8. Quy trình cập nhật

Deployment là Source of Truth cho triển khai và vận hành.

Khi thay đổi hạ tầng:

1. Cập nhật 04-DATABASE nếu ảnh hưởng dữ liệu.
2. Cập nhật 05-BACKEND nếu ảnh hưởng cách chạy.
3. Cập nhật 06-INTEGRATION nếu ảnh hưởng kết nối.
4. Cập nhật 07-DEPLOYMENT để phản ánh môi trường triển khai.

Không thiết kế Deployment trước khi kiến trúc hệ thống được thống nhất.
