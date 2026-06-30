# Reports — Báo cáo và phân tích

> **Trạng thái:** 🔨 Đang xây dựng  
> **Tham khảo:** KiotViet `Phân tích/Báo cáo`

---

## 1. Mục tiêu

Reports giúp chủ xưởng và nhân viên quản lý nhìn nhanh tình hình bán hàng, dòng tiền, công nợ và tồn kho.

QC-OMS làm báo cáo đủ để quản trị xưởng, nhưng không copy toàn bộ chiều phân tích retail của KiotViet.

---

## 2. Phạm vi MVP

| Báo cáo | Trạng thái | Ghi chú |
|---|---|---|
| Báo cáo cuối ngày | MVP core | Gắn POS, Sổ quỹ và Đối soát |
| Báo cáo bán hàng | Sau core | Doanh thu, hóa đơn, nhân viên, khách hàng |
| Báo cáo công nợ | Sau core | Theo khách và hóa đơn nợ |
| Báo cáo hàng hóa/tồn kho | Sau Inventory | Ưu tiên cuộn/tấm vật lý |
| Báo cáo tài chính | Sau Finance ổn định | Dòng tiền, thu, chi, tồn quỹ |

---

## 3. Không Làm Trong MVP

- Kênh bán hàng.
- VAT/HĐĐT/thuế kế toán.
- Thương hiệu/thuộc tính retail.
- Báo cáo trả hàng bán.
- Lợi nhuận kế toán đầy đủ khi chưa chốt giá vốn, nhập hàng và chi phí sản xuất.
- Báo cáo khách trả trước vì MVP không tạo công nợ âm.

Thương hiệu nếu cần thì ghi trong tên hàng, mã hàng hoặc nhóm hàng.

---

## 4. Nguyên Tắc Chung

- Báo cáo phải lọc được khoảng thời gian dài, không chỉ `Tháng này`.
- Bộ lọc mặc định không được làm người dùng tưởng là không có dữ liệu khi thực tế chỉ bị lọc sai thời gian.
- Các số tiền thu theo chuyển khoản phải tách theo từng tài khoản ngân hàng.
- Báo cáo tài chính/dòng tiền phải khớp được với Sổ quỹ.
- Báo cáo công nợ phải khớp với công nợ theo từng hóa đơn.
- Hóa đơn đã sửa/hủy vẫn có lịch sử để kiểm tra, không bị xóa khỏi báo cáo audit.

---

## 5. Tài Liệu Con

- [01-END-OF-DAY.md](./01-END-OF-DAY.md)
