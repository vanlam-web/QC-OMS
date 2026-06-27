# RULES — 01-VISION-TamNhin

## 1. Mục đích

Đây là **Source of Truth** cho tầm nhìn của sản phẩm.

Folder này trả lời các câu hỏi:

- QC-OMS là gì?
- Vì sao QC-OMS tồn tại?
- Giải quyết vấn đề gì?
- Dành cho ai?
- Giá trị cốt lõi là gì?

---

## 2. CHỈ GHI

- ✓ Vision
- ✓ Mission
- ✓ Mục tiêu sản phẩm
- ✓ Phạm vi (In Scope / Out of Scope)
- ✓ Triết lý sản phẩm
- ✓ Đối tượng sử dụng
- ✓ Giá trị cốt lõi
- ✓ Vấn đề cần giải quyết

---

## 3. ĐƯỢC PHÉP THAM CHIẾU

Có thể nhắc đến:

- Feature
- Business
- Database
- Backend
- Công nghệ

nếu chỉ nhằm giải thích Vision.

Không được đặc tả chi tiết.

---

## 4. KHÔNG ĐẶC TẢ

Không được đặc tả:

- ✗ Feature Specification
- ✗ UI / Wireframe / Mockup
- ✗ Business Rule
- ✗ Database Schema
- ✗ API Specification
- ✗ Code
- ✗ Kiến trúc kỹ thuật
- ✗ Framework hoặc công nghệ triển khai

Các nội dung trên phải được ghi tại đúng tầng theo [ARCHITECTURE.md](http://ARCHITECTURE.md).

---

## 5. Nguyên tắc

- Vision là Source of Truth cho định hướng sản phẩm.
- Vision phải ổn định trong nhiều năm.
- Không thay đổi vì lý do kỹ thuật hoặc công nghệ.
- Không chứa chi tiết triển khai.
- Khi cần giải thích bằng ví dụ, chỉ tham chiếu, không đặc tả.

---

## 6. Cấu trúc chuẩn

Một tài liệu Vision nên có:

1. Mục tiêu
2. Vấn đề
3. Đối tượng sử dụng
4. Giá trị mang lại
5. Phạm vi
6. Triết lý phát triển

Không bắt buộc phải có đủ nếu tài liệu ngắn.

---

## 7. Quy tắc bảo trì

- Khuyến nghị: 100–250 dòng / file.
- Nếu vượt khoảng 300 dòng, đề xuất tách.
- Không tự tách khi chưa được người dùng phê duyệt.

---

## 8. Quy trình cập nhật

Chỉ cập nhật Vision khi:

- thay đổi định hướng sản phẩm
- thay đổi phạm vi sản phẩm
- thay đổi mục tiêu dài hạn

Không cập nhật Vision vì thay đổi Feature, Business, Database hoặc Backend.
