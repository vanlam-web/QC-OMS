# RULES — 04-DATABASE

## 1. Mục đích

Đây là **Source of Truth** cho thiết kế cơ sở dữ liệu của QC-OMS.

Folder này trả lời các câu hỏi:

- Dữ liệu được lưu như thế nào?
- Quan hệ giữa các dữ liệu là gì?
- Các ràng buộc dữ liệu là gì?
- Cấu trúc vật lý của dữ liệu ra sao?

---

## 2. CHỈ GHI

- ✓ Table
- ✓ Column
- ✓ Data Type
- ✓ Constraint
- ✓ Relationship
- ✓ Index
- ✓ Enum
- ✓ View
- ✓ Function
- ✓ Trigger
- ✓ Migration
- ✓ ERD
- ✓ Data Dictionary

---

## 3. ĐƯỢC PHÉP THAM CHIẾU

Có thể tham chiếu:

- Business Rule
- Feature
- API
- Backend

nếu chỉ nhằm giải thích mục đích của dữ liệu.

Không được đặc tả lại.

---

## 4. KHÔNG ĐẶC TẢ

Không được đặc tả:

- ✗ UI
- ✗ Wireframe
- ✗ User Flow
- ✗ Feature Specification
- ✗ Business Workflow
- ✗ API Specification
- ✗ Backend Workflow
- ✗ Code ứng dụng
- ✗ Hạ tầng triển khai

Các nội dung trên phải được ghi tại đúng tầng theo [ARCHITECTURE.md](http://ARCHITECTURE.md).

---

## 5. Nguyên tắc

- Mỗi Table chỉ có một Source of Truth.
- Mỗi Table nên có tài liệu mô tả riêng.
- Không sao chép Business Rule vào Database.
- Chỉ mô tả dữ liệu và các ràng buộc dữ liệu.
- Nếu cần giải thích nghiệp vụ, chỉ tham chiếu sang 03-BUSINESS.
- Nếu cần giải thích cách sử dụng API, chỉ tham chiếu sang 05-BACKEND.

---

## 6. Cấu trúc chuẩn

Một tài liệu Table nên có:

1. Mục đích
2. Các cột
3. Quan hệ
4. Constraint
5. Index
6. Migration
7. Business Rule liên quan

Không bắt buộc phải có đủ nếu Table đơn giản.

---

## 7. Quy tắc bảo trì

- Khuyến nghị: 150–300 dòng / file.
- Nếu vượt khoảng 400 dòng, đề xuất tách.
- Không tự tách khi chưa được người dùng phê duyệt.

---

## 8. Quy trình cập nhật

Database là Source of Truth của cấu trúc dữ liệu.

Khi Business thay đổi:

1. Cập nhật 03-BUSINESS trước.
2. Sau đó cập nhật 04-DATABASE nếu cấu trúc dữ liệu thay đổi.
3. Cuối cùng cập nhật 05-BACKEND nếu ảnh hưởng cách thực thi.

Không thiết kế Database trước Business.
