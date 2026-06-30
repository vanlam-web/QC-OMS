# 02-SALES-REPORT — Báo cáo bán hàng

> **Trạng thái:** 🔨 Đang xây dựng  
> **Tham khảo:** KiotViet `Báo cáo > Bán hàng`, đã lược bỏ kênh bán/VAT/trả hàng

---

## 1. Mục tiêu

Báo cáo bán hàng giúp xem doanh thu, hóa đơn, khách hàng và hiệu suất bán theo thời gian.

QC-OMS chỉ dùng luồng bán đứt qua POS/checkout, nên báo cáo không có kênh bán, vận đơn, COD, trả hàng hoặc HĐĐT.

---

## 2. Bộ lọc

| Bộ lọc | Quy tắc |
|---|---|
| Thời gian | Hôm nay, hôm qua, tuần này, tháng này, tùy chỉnh |
| Khách hàng | Tìm theo mã/tên/SĐT nếu có |
| Nhân viên bán | Người chốt hóa đơn |
| Người tạo | Người tạo chứng từ |
| Bảng giá | Bảng giá chung hoặc bảng giá nhóm |
| Trạng thái | Hoàn thành, Đã hủy, Sửa từ chứng từ cũ |

Không có bộ lọc kênh bán, giao hàng, COD, VAT/HĐĐT hoặc trả hàng.

---

## 3. Chỉ số tổng quan

| Chỉ số | Mô tả |
|---|---|
| Doanh thu | Tổng giá trị hóa đơn hoàn thành theo thời điểm checkout |
| Số hóa đơn | Số hóa đơn hoàn thành |
| Giá trị trung bình | Doanh thu / số hóa đơn |
| Khách đã trả | Tổng tiền đã thu theo hóa đơn trong kỳ |
| Công nợ mới | Phần hóa đơn còn nợ phát sinh trong kỳ |
| Hóa đơn sửa/hủy | Số chứng từ bị hủy do sửa hoặc hủy thủ công |

Doanh thu không chờ khách trả đủ tiền. Phần chưa thu được theo dõi ở công nợ.

---

## 4. Biểu đồ

MVP nên có:

- doanh thu theo ngày trong khoảng lọc
- số hóa đơn theo ngày
- tỷ lệ đã thu ngay và còn nợ

Sau MVP có thể bổ sung:

- doanh thu theo giờ
- doanh thu theo nhân viên bán
- doanh thu theo nhóm khách/bảng giá

---

## 5. Bảng chi tiết hóa đơn

| Cột | Mô tả |
|---|---|
| Mã hóa đơn | Link sang Sales Documents |
| Thời gian | Thời điểm checkout |
| Khách hàng | Snapshot khách tại thời điểm bán |
| Người bán | Nhân viên chốt |
| Bảng giá | Bảng giá đã áp dụng |
| Tổng tiền hàng | Trước giảm/điều chỉnh |
| Giảm giá | Nếu có |
| Khách cần trả | Tổng phải thu |
| Khách đã trả | Tiền đã thu cho hóa đơn |
| Còn nợ | Phần còn lại |
| Trạng thái | Hoàn thành, Đã hủy |

Hóa đơn đã sửa theo `MaCu.01` phải truy vết được mã gốc và mã sửa.

---

## 6. Top Danh Sách

Nên có các bảng tóm tắt:

- top khách hàng theo doanh thu
- top khách hàng còn nợ mới trong kỳ
- top sản phẩm/dịch vụ theo doanh thu
- top sản phẩm/dịch vụ theo số lượng
- danh sách hóa đơn lớn
- danh sách hóa đơn còn nợ

Không có top theo kênh bán hoặc thương hiệu.

---

## 7. Acceptance Criteria UX

1. Người dùng lọc được báo cáo bán hàng theo khoảng ngày dài.
2. Doanh thu tính theo hóa đơn hoàn thành, không phụ thuộc đã thu đủ tiền.
3. Báo cáo hiển thị rõ khách đã trả và còn nợ.
4. Hóa đơn sửa/hủy trong kỳ không bị mất khỏi audit.
5. Bấm mã hóa đơn mở chi tiết chứng từ.
6. Không có bộ lọc/cột kênh bán, COD, HĐĐT hoặc trả hàng.

---

← [Quay về Reports README](./README.md)

