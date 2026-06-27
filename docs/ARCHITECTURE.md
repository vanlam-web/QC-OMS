# Kiến trúc tài liệu dự án QC-OMS

---

# Mục đích

Tài liệu này định nghĩa kiến trúc của toàn bộ hệ thống tài liệu QC-OMS.

Nó không mô tả cách lập trình.

Nó không mô tả Database.

Nó không mô tả API.

Nó chỉ quy định:

- Mỗi loại thông tin thuộc tầng nào.
- Trách nhiệm của từng tầng.
- Quan hệ giữa các tầng.
- Luồng phát triển của dự án.

---

# 1. Kiến trúc tổng thể

QC-OMS được phát triển theo thứ tự:

Vision

↓

PRD / UX

↓

Business

↓

Database

↓

Backend

↓

Integration

↓

Deployment

Không được bỏ qua tầng.

Không được thiết kế tầng dưới khi tầng trên chưa thống nhất.

---

# 2. Trách nhiệm của từng tầng

## 01-VISION

Mục đích

Định nghĩa sản phẩm.

Được phép

- Vision
- Mission
- Mục tiêu
- Phạm vi
- Đối tượng sử dụng

Không được

- UI
- Database
- API
- Code

---

## 02-PRD-UX

Mục đích

Mô tả người dùng sử dụng hệ thống như thế nào.

Được phép

- Feature
- User Flow
- Wireframe
- Mockup
- Popup
- Shortcut
- Điều kiện hiển thị
- Trạng thái giao diện

Không được

- SQL
- API
- Database
- Table
- React
- Business Rule cốt lõi

---

## 03-BUSINESS

Mục đích

Mô tả nghiệp vụ.

Được phép

- Business Rule
- Workflow
- Quy trình
- Công thức
- Chính sách
- Trạng thái nghiệp vụ
- Điều kiện xử lý

Không được

- UI
- Wireframe
- Database
- API
- Code

---

## 04-DATABASE

Mục đích

Thiết kế dữ liệu.

Được phép

- Table
- Column
- Constraint
- Relationship
- Index
- Enum

Không được

- UI
- Business mô tả dài
- API
- Code

---

## 05-BACKEND

Mục đích

Hiện thực nghiệp vụ.

Được phép

- API
- Service
- Validation
- Permission
- Authentication
- Authorization
- Workflow thực thi

Không được

- Wireframe
- Mockup
- CSS
- React UI

---

## 06-INTEGRATION

Mục đích

Kết nối hệ thống bên ngoài.

Được phép

- Zalo
- Email
- QR
- Máy in
- Webhook
- AI
- Đồng bộ

---

## 07-DEPLOYMENT

Mục đích

Triển khai hệ thống.

Được phép

- Docker
- VPS
- Domain
- Backup
- Restore
- Monitoring

---

# 3. Ma trận phân loại tài liệu


| Nội dung            | Thuộc tầng     |
| ------------------- | -------------- |
| Vision              | 01-VISION      |
| Mission             | 01-VISION      |
| Feature             | 02-PRD-UX      |
| User Flow           | 02-PRD-UX      |
| Wireframe           | 02-PRD-UX      |
| Popup               | 02-PRD-UX      |
| Shortcut            | 02-PRD-UX      |
| Business Rule       | 03-BUSINESS    |
| Workflow            | 03-BUSINESS    |
| Công thức tính      | 03-BUSINESS    |
| Chính sách          | 03-BUSINESS    |
| Table               | 04-DATABASE    |
| Column              | 04-DATABASE    |
| Relationship        | 04-DATABASE    |
| API                 | 05-BACKEND     |
| Validation          | 05-BACKEND     |
| Permission kỹ thuật | 05-BACKEND     |
| Authentication      | 05-BACKEND     |
| Authorization       | 05-BACKEND     |
| Webhook             | 06-INTEGRATION |
| Máy in              | 06-INTEGRATION |
| Docker              | 07-DEPLOYMENT  |
| Acceptance Criteria (UI/UX) | 02-PRD-UX |
| Acceptance Criteria (nghiệp vụ) | 03-BUSINESS |

> **Lưu ý:** Acceptance Criteria có 2 loại — UI/UX thuộc 02-PRD-UX, nghiệp vụ thuộc 03-BUSINESS. Code nguồn không nằm trong `docs/`, mà trong thư mục `src/` của repository. Hạ tầng triển khai thuộc 07-DEPLOYMENT.

---

# 4. Quy tắc xử lý khi Audit

Nếu AI phát hiện tài liệu sai tầng:

Không được tự di chuyển.

AI phải:

1. Đánh dấu Issue.
2. Chỉ rõ Rule bị vi phạm.
3. Đề xuất vị trí phù hợp.
4. Chờ người dùng phê duyệt.

Chỉ sau khi được phê duyệt mới được sửa.

---

# 5. Source of Truth

Mỗi loại thông tin chỉ có một nơi gốc.

Các tầng khác chỉ được tham chiếu.

Không được sao chép nội dung sang nhiều nơi.

---

# 6. Quy tắc quyết định vị trí

Nếu một nội dung có thể thuộc nhiều tầng.

AI phải xác định:

Nội dung này trả lời câu hỏi gì?

Nếu trả lời:

"Tính năng hoạt động như thế nào?"

→ PRD.

"Nghiệp vụ xử lý như thế nào?"

→ Business.

"Dữ liệu lưu như thế nào?"

→ Database.

"Chương trình thực hiện như thế nào?"

→ Backend.

"Kết nối hệ thống nào?"

→ Integration.

"Triển khai ra sao?"

→ Deployment.

Nếu vẫn không xác định được:

AI phải hỏi người dùng.

Không được tự quyết định.

---

# 7. Nguyên tắc cuối cùng

Kiến trúc tài liệu là nền tảng của dự án.

Mọi tài liệu mới phải tuân theo [ARCHITECTURE.md](http://ARCHITECTURE.md).

Nếu có mâu thuẫn:

DOCUMENT_[RULES.md](http://RULES.md)

↓

[ARCHITECTURE.md](http://ARCHITECTURE.md)

↓

_[RULES.md](http://RULES.md)

↓

[README.md](http://README.md)

↓

Nội dung tài liệu
