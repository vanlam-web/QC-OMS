# RULES — 05-BACKEND-MayChu

## 1. Mục đích

Đây là **Source of Truth** cho cách hệ thống thực thi nghiệp vụ.

Folder này trả lời các câu hỏi:

- Hệ thống xử lý nghiệp vụ như thế nào?
- API cung cấp những gì?
- Validation thực hiện ở đâu?
- Workflow thực thi ra sao?
- Hệ thống kiểm tra quyền như thế nào?

---

## 2. CHỈ GHI

- ✓ API Specification
- ✓ Application Service
- ✓ Use Case
- ✓ Workflow thực thi
- ✓ Validation
- ✓ Authentication
- ✓ Authorization
- ✓ Permission
- ✓ Event Handler
- ✓ Error Handling
- ✓ Request / Response Model

---

## 3. ĐƯỢC PHÉP THAM CHIẾU

Có thể tham chiếu:

- Business Rule
- Database
- Feature
- Integration

nếu chỉ nhằm giải thích cách thực thi.

Không được đặc tả lại.

---

## 4. KHÔNG ĐẶC TẢ

Không được đặc tả:

- ✗ Vision
- ✗ Feature Specification
- ✗ UI / Wireframe / Mockup
- ✗ Business Rule đầy đủ
- ✗ Database Schema
- ✗ SQL chi tiết
- ✗ Frontend Code
- ✗ Hạ tầng triển khai

Các nội dung trên phải được ghi tại đúng tầng theo [ARCHITECTURE.md](http://ARCHITECTURE.md).

---

## 5. Nguyên tắc

- Mỗi API chỉ có một Source of Truth.
- Mỗi Use Case nên tương ứng với một nghiệp vụ trong 03-BUSINESS.
- Không sao chép Business Rule sang Backend.
- Chỉ mô tả cách hệ thống thực thi nghiệp vụ.
- Nếu cần giải thích nghiệp vụ, chỉ tham chiếu sang 03-BUSINESS.
- Nếu cần giải thích cấu trúc dữ liệu, chỉ tham chiếu sang 04-DATABASE.

---

## 6. Cấu trúc chuẩn

Một tài liệu Backend nên có:

1. Mục đích
2. Input
3. Validation
4. Workflow
5. Permission
6. Output
7. Error Handling
8. Business Rule liên quan

Không bắt buộc phải có đủ nếu Use Case đơn giản.

---

## 7. Quy tắc bảo trì

- Khuyến nghị: 150–300 dòng / file.
- Nếu vượt khoảng 400 dòng, đề xuất tách.
- Không tự tách khi chưa được người dùng phê duyệt.

---

## 8. Quy trình cập nhật

Backend là Source of Truth cho cách thực thi.

Khi Business thay đổi:

1. Cập nhật 03-BUSINESS trước.
2. Cập nhật 04-DATABASE nếu cấu trúc dữ liệu thay đổi.
3. Cập nhật 05-BACKEND để phản ánh cách thực thi.

Không thiết kế Backend trước Business.
