# POS-ORDER-LIFECYCLE — Vòng đời đơn hàng POS

> **Trạng thái:** 🔨 Đang xây dựng

---

## 1. MỤC ĐÍCH

Tài liệu này là Source of Truth cho trạng thái đơn hàng POS, gồm hóa đơn nháp, báo giá và hóa đơn bán hàng.

---

## 2. LOẠI MÃ ĐƠN

| Loại | Mã | Ý nghĩa |
|---|---|---|
| Hóa đơn nháp | Chưa có mã chính thức hoặc dùng tên tab tạm | Đang nhập/sửa trên POS, chưa lưu thành chứng từ bán hàng |
| Báo giá | `BG...` | Đơn hàng ở trạng thái báo giá, dùng để gửi giá cho khách |
| Hóa đơn bán hàng | `HD...` | Đơn hàng đã xác nhận bán/thanh toán |

---

## 3. QUY TẮC BÁO GIÁ

### BR-ORD-01: Báo giá vẫn lưu trong đơn hàng

Báo giá được lưu trong nhóm dữ liệu đơn hàng để dễ quản lý, tra cứu và mở lại.

Báo giá không phải hóa đơn bán hàng hoàn thành.

### BR-ORD-02: Không phát sinh kho và tiền

Khi tạo báo giá:

- Không trừ kho.
- Không ghi sổ quỹ.
- Không ghi công nợ.
- Không ghi doanh thu.

### BR-ORD-03: Mở lại báo giá

Khi sửa báo giá, hệ thống mở báo giá trở lại màn hình POS như một hóa đơn nháp.

Nhân viên được sửa dòng hàng, khách hàng, bảng giá, chiết khấu và ghi chú như đơn nháp bình thường.

### BR-ORD-04: Chuyển báo giá thành hóa đơn

Khi khách đồng ý, báo giá được mở lại thành đơn nháp để kiểm tra/sửa lần cuối rồi thanh toán.

Khi thanh toán thành công, hệ thống tạo hóa đơn bán hàng với mã `HD...`; mã `BG...` vẫn được giữ trong lịch sử để truy vết nguồn gốc báo giá.

---

← [Quay về Sales README](./README.md)
