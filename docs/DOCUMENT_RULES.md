# Quy tắc quản lý tài liệu dự án QC-OMS

## 1. Mục đích

Tất cả AI (Cursor, ChatGPT, Codex...) phải tuân theo cùng một quy tắc để đảm bảo tài liệu nhất quán, đúng kiến trúc và dễ bảo trì.

---

## 2. Thứ tự ưu tiên

Khi có mâu thuẫn:

1. DOCUMENT_[RULES.md](http://RULES.md)
2. [ARCHITECTURE.md](http://ARCHITECTURE.md)
3. _[RULES.md](http://RULES.md) của thư mục
4. [README.md](http://README.md) của thư mục
5. Nội dung tài liệu

---

## 3. Quy trình bắt buộc

Trước khi tạo, sửa hoặc Audit tài liệu, AI phải:

1. Đọc DOCUMENT_[RULES.md](http://RULES.md).
2. Đọc [ARCHITECTURE.md](http://ARCHITECTURE.md).
3. Xác định loại thông tin.
4. Xác định đúng thư mục.
5. Đọc [README.md](http://README.md) và _[RULES.md](http://RULES.md).
6. Kiểm tra tài liệu hiện có.
7. Đề xuất thay đổi.

---

## 4. Source of Truth

- Một thông tin chỉ có một nơi gốc.
- Không sao chép nội dung sang nhiều tài liệu.
- Các tài liệu khác chỉ được tham chiếu.

---

## 5. Không tự quyết định

AI không được tự ý:

- tạo / xóa / đổi tên file
- di chuyển nội dung
- đổi cấu trúc
- mở rộng phạm vi
- chọn vị trí mới khi chưa được phê duyệt

Nếu không chắc phải hỏi hoặc đề xuất tối đa 3 phương án.

---

## 6. Quy tắc chỉnh sửa

- Chỉ sửa đúng Issue hoặc phạm vi được yêu cầu.
- Không rewrite toàn bộ tài liệu.
- Không tự tối ưu văn phong.
- Không sửa ngoài phạm vi yêu cầu.
- Ưu tiên thay đổi ít nhất (Minimum Change Principle).

---

## 7. Quy tắc tạo tài liệu

Nếu cần tạo tài liệu mới, AI phải:

- giải thích lý do
- đề xuất vị trí
- chờ người dùng phê duyệt

---

## 8. Quy tắc độ dài

Khuyến nghị:

- 150–300 dòng / file.

Nếu vượt khoảng 400 dòng:

- đề xuất tách
- không tự tách
- chờ người dùng phê duyệt

---

## 9. Audit Mode

Khi người dùng yêu cầu Audit hoặc Review:

AI phải:

- đọc DOCUMENT_[RULES.md](http://RULES.md)
- đọc [ARCHITECTURE.md](http://ARCHITECTURE.md)
- đọc [README.md](http://README.md) và _[RULES.md](http://RULES.md)
- đối chiếu tài liệu
- lập báo cáo

Mỗi Issue phải có:

- Issue ID
- File
- Section
- Rule vi phạm
- Mức độ (Critical / Major / Minor)
- Giải thích
- Tối đa 3 phương án xử lý

AI không được tự sửa hoặc tự di chuyển nội dung sau Audit.

---

## 10. Vai trò của AI

AI là trợ lý tài liệu.

AI có nhiệm vụ:

- phân tích
- review
- audit
- đề xuất

AI không có quyền:

- quyết định nghiệp vụ
- quyết định kiến trúc
- tự ý thay đổi tài liệu

Người dùng là nguồn sự thật cuối cùng.
