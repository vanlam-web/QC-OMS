# RULES — 02-PRD-UX-PhongCanh

## 1. Mục đích

Đây là **Source of Truth** cho **Feature** và **UI/UX**.

Folder này trả lời các câu hỏi:

- Tính năng dùng để làm gì?
- Người dùng thao tác như thế nào?
- Giao diện hiển thị ra sao?
- Hệ thống phản hồi như thế nào từ góc nhìn người dùng?

---

## 2. CHỈ GHI

- ✓ Feature Specification
- ✓ UI / Wireframe / Mockup
- ✓ User Flow
- ✓ Shortcut
- ✓ Popup / Modal
- ✓ Trạng thái giao diện (Loading, Empty, Error, Success...)
- ✓ Điều kiện hiển thị
- ✓ Acceptance Criteria (UI/UX — hành vi giao diện: trạng thái nào hiển thị, interaction nào hợp lệ, điều kiện hiển thị component)
- ✓ Mô tả hành vi của hệ thống từ góc nhìn người dùng

---

## 3. ĐƯỢC PHÉP THAM CHIẾU

Được phép nhắc đến nếu chỉ nhằm giải thích hành vi của tính năng:

- Business Rule
- Database
- API
- Workflow
- Permission
- Đồng bộ dữ liệu

**Lưu ý:**

Chỉ được mô tả ở mức cần thiết để người đọc hiểu tính năng.

Không được đặc tả chi tiết.

---

## 4. KHÔNG ĐẶC TẢ

Không được đặc tả:

- ✗ Business Rule đầy đủ
- ✗ Database Schema
- ✗ Table / Column
- ✗ SQL
- ✗ API Specification
- ✗ Backend Workflow
- ✗ Code (React, JSX, CSS, TypeScript...)
- ✗ Triển khai kỹ thuật

Các nội dung trên phải được ghi tại đúng tầng theo [ARCHITECTURE.md](http://ARCHITECTURE.md).

---

## 5. Nguyên tắc

- Mỗi Feature có một file riêng.
- Một Feature chỉ có một Source of Truth.
- Không sao chép nội dung giữa nhiều file.
- Khi cần dùng thông tin từ tầng khác, chỉ tham chiếu, không đặc tả lại.
- Nếu một nội dung vừa là UI vừa là Business, chỉ mô tả phần liên quan đến UI; phần nghiệp vụ phải tham chiếu sang 03-BUSINESS.
- Nếu không chắc nội dung thuộc tầng nào, không tự quyết định. Thực hiện theo DOCUMENT_[RULES.md](http://RULES.md).

---

## 6. Cấu trúc chuẩn của một Feature

Mỗi Feature nên có các mục sau:

1. Mục đích
2. Người sử dụng
3. Khi nào sử dụng
4. User Flow
5. Giao diện
6. Điều kiện hiển thị
7. Trường hợp đặc biệt
8. Acceptance Criteria

Không bắt buộc phải có đủ nếu Feature đơn giản.

---

## 7. Quy tắc bảo trì

- Khuyến nghị: 150–300 dòng / file.
- Nếu vượt khoảng 400 dòng, đề xuất tách file.
- Không tự tách khi chưa được người dùng phê duyệt.

---

## 8. Quy trình cập nhật

Khi thay đổi Feature:

1. Cập nhật Feature / UI tại thư mục này.
2. Nếu ảnh hưởng Business → cập nhật 03-BUSINESS.
3. Nếu ảnh hưởng Database → cập nhật 04-DATABASE.
4. Nếu ảnh hưởng Backend → cập nhật 05-BACKEND.

Business, Database và Backend vẫn là Source of Truth của tầng tương ứng.
