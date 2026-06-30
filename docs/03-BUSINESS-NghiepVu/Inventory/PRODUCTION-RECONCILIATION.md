# PRODUCTION-RECONCILIATION — Đối soát OMS và máy sản xuất

> **Trạng thái:** 🔨 Đang xây dựng
> **Phạm vi:** Cách QC-OMS dùng dữ liệu máy sản xuất trong MVP

---

## 1. Mục tiêu

Dữ liệu máy sản xuất giúp QC-OMS so sánh giữa:

```text
OMS/bill ghi nhận khách đặt gì
vs
máy sản xuất thực tế chạy gì
```

Trong MVP, dữ liệu này phục vụ giám sát và đối soát, chưa dùng để tự động trừ kho.

---

## 2. Không tự động trừ kho từ máy sản xuất

### BR-REC-01: Production data không tạo stock movement MVP

MVP không dùng dữ liệu máy sản xuất để tự động trừ kho chính thức.

Lý do:

- tạo đơn/bill chưa chắc đã sản xuất
- file trên máy sản xuất có thể đặt tên bất kỳ
- một file sản xuất có thể chứa nhiều chi tiết
- chưa có cách match file máy sản xuất với bill/dòng bill đủ chắc để tự động trừ kho

Stock movement chính thức trong MVP đi theo đơn/bill và quy tắc kho đã chốt.

---

## 3. Phạm vi đối soát

### BR-REC-02: Các chỉ số đối soát

Production data dùng để tính và hiển thị các chỉ số đối soát:

- file chạy nhưng chưa thấy bill tương ứng
- bill có hàng sản xuất nhưng chưa thấy file chạy
- kích thước theo bill
- kích thước máy chạy
- số lượng theo bill
- số lượng máy chạy
- tổng `m2` theo bill
- tổng `m2` máy chạy
- chênh lệch `m2`
- số lần chạy lại/in lại
- hao hụt tham khảo

Các chỉ số này không tự động sinh stock movement trong MVP.

---

## 4. Nâng cấp sau MVP

### BR-REC-03: Tự động gắn file/bill là spec sau

Khi sau này có rule match chắc hơn giữa file máy sản xuất và bill/dòng bill, QC-OMS sẽ mở spec riêng để nâng cấp:

```text
production file/event -> bill/order item -> stock movement
```

Spec sau phải chốt rõ:

- file nào thuộc bill nào
- một file nhiều chi tiết xử lý ra sao
- khi nào được tự động trừ kho
- khi nào cần người dùng xác nhận
- cách điều chỉnh nếu máy chạy khác bill

---

## 5. Acceptance Criteria

- Production data không tự tạo stock movement trong MVP.
- Báo cáo đối soát hiển thị được chênh lệch giữa bill và máy chạy.
- File chạy chưa khớp bill không làm thay đổi tồn kho.
- Hệ thống vẫn có thể dùng dữ liệu máy sản xuất để cảnh báo và phân tích hao hụt tham khảo.
