# RULES — 03-BUSINESS-NghiepVu

## 1. Mục đích

Đây là **Source of Truth** cho toàn bộ nghiệp vụ của QC-OMS.

Folder này trả lời các câu hỏi:

- Nghiệp vụ hoạt động như thế nào?
- Điều kiện áp dụng là gì?
- Quy trình xử lý ra sao?
- Công thức tính như thế nào?
- Khi nào được phép hoặc không được phép thực hiện?

---

## 2. CHỈ GHI

- ✓ Business Rule
- ✓ Business Workflow
- ✓ Quy trình nghiệp vụ
- ✓ State Machine
- ✓ Điều kiện và điều kiện biên
- ✓ Công thức tính toán
- ✓ Domain Event (chỉ ngữ nghĩa, không mô tả kỹ thuật)
- ✓ Chính sách nghiệp vụ
- ✓ Acceptance Criteria nghiệp vụ (điều kiện biên, kết quả hợp lệ của business rule, state machine, điều kiện cho phép/từ chối)

---

## 3. ĐƯỢC PHÉP THAM CHIẾU

Có thể nhắc đến nếu chỉ nhằm giải thích nghiệp vụ:

- Feature
- UI
- Database
- API
- Workflow kỹ thuật
- Integration

Chỉ tham chiếu.

Không được đặc tả.

---

## 4. KHÔNG ĐẶC TẢ

Không được đặc tả:

- ✗ UI / Wireframe / Mockup
- ✗ Database Schema
- ✗ Table / Column
- ✗ SQL
- ✗ API Specification
- ✗ Backend Workflow
- ✗ Code
- ✗ React / Frontend Framework
- ✗ Hạ tầng triển khai

Các nội dung trên phải được ghi tại đúng tầng theo [ARCHITECTURE.md](http://ARCHITECTURE.md).

---

## 5. Nguyên tắc

- Mỗi Domain nghiệp vụ có một thư mục riêng.
- Mỗi Business Rule chỉ có một Source of Truth.
- Không sao chép Business Rule sang nhiều nơi.
- Business Rule không phụ thuộc UI hoặc công nghệ.
- Nếu cần ví dụ giao diện, chỉ tham chiếu sang 02-PRD-UX.
- Nếu cần ví dụ dữ liệu hoặc API, chỉ tham chiếu sang tầng tương ứng.

---

## 6. Cấu trúc chuẩn

Một Business Rule nên có:

1. ID
2. Mục đích
3. Mô tả
4. Điều kiện áp dụng
5. Quy trình xử lý
6. Ngoại lệ
7. Acceptance Criteria

Không bắt buộc phải có đủ nếu Rule đơn giản.

---

## 7. Quy tắc bảo trì

- Khuyến nghị: 150–300 dòng / file.
- Nếu vượt khoảng 400 dòng, đề xuất tách.
- Không tự tách khi chưa được người dùng phê duyệt.

---

## 8. Quy trình cập nhật

Business là Source of Truth của nghiệp vụ.

Khi Business thay đổi:

1. Cập nhật 03-BUSINESS trước.
2. Cập nhật 02-PRD-UX nếu ảnh hưởng Feature hoặc UI.
3. Cập nhật 04-DATABASE nếu ảnh hưởng dữ liệu.
4. Cập nhật 05-BACKEND nếu ảnh hưởng cách thực thi.

Không cập nhật theo chiều ngược lại.
