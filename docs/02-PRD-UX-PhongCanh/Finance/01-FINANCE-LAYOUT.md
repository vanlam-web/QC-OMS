# FINANCE-LAYOUT — Bố cục tổng thể Tài chính

> **Nguồn tham khảo UI:** KiotViet Sổ quỹ ở viewport desktop.

---

## 1. Mục đích

Module Tài chính giúp nhân viên:

- xem sổ quỹ theo tiền mặt và từng tài khoản ngân hàng
- tạo phiếu thu/chi thủ công
- xem và thu công nợ khách hàng
- đối soát cuối ngày

QC-OMS giữ bố cục quen thuộc từ KiotViet: filter bên trái, vùng dữ liệu chính bên phải, summary phía trên bảng. Điểm khác là QC-OMS nhấn mạnh công nợ theo từng hóa đơn và đối soát từng tài khoản.

---

## 2. Navigation trong module

| View | Mục đích |
|---|---|
| Sổ quỹ | Xem dòng tiền, tạo phiếu thu/chi thủ công |
| Công nợ | Xem nợ theo khách/hóa đơn, thu nợ |
| Đối soát | Chốt tiền mặt/từng tài khoản cuối ngày |
| Tài khoản quỹ | Quản lý quỹ tiền mặt và tài khoản ngân hàng |

---

## 3. Bố cục desktop

```text
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ Top navigation: ... | Sổ quỹ | ...                                                        │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ Tài chính / Sổ quỹ                              [Tìm mã phiếu] [+ Thu] [+ Chi] [Cài đặt]  │
├───────────────────────┬────────────────────────────────────────────────────────────────────┤
│ FILTER SIDEBAR        │ SUMMARY CARDS                                                      │
│                       │ Tổng thu | Tổng chi | Tồn quỹ                                     │
│ Quỹ/Tài khoản         ├────────────────────────────────────────────────────────────────────┤
│ Thời gian             │ TABLE                                                              │
│ Loại chứng từ         │ checkbox | mã phiếu | thời gian | loại | người nộp/nhận | giá trị  │
│ Trạng thái            │                                                                    │
│ Người tạo             │ Pagination                                                         │
└───────────────────────┴────────────────────────────────────────────────────────────────────┘
```

---

## 4. Nguyên tắc UX

- Desktop ưu tiên bảng rộng, dễ quét dòng tiền.
- Số tiền thu hiển thị màu dương, số tiền chi hiển thị màu âm.
- Tiền mặt và từng tài khoản ngân hàng phải tách rõ.
- Không gộp toàn bộ chuyển khoản thành một số chung khi đối soát.
- Phiếu sinh từ POS/thu nợ chỉ xem, không sửa rời.
- Phiếu thu/chi thủ công có thể sửa bằng phiên bản mới, không sửa đè.

---

## 5. Trạng thái chung

| Trạng thái | UI |
|---|---|
| Loading | Skeleton cho summary và bảng |
| Empty | Trạng thái trống trong bảng; nhân viên nội bộ MVP thấy nút tạo phiếu/thao tác finance thường ngày |
| Filter empty | Có nút xóa bộ lọc |
| Permission denied | Chỉ dành cho tài khoản hạn chế đặc biệt hoặc truy cập nhầm vùng quản trị; nhân viên nội bộ MVP mặc định có quyền xem/thao tác finance thường ngày đã mở |
| Error | Banner lỗi, có nút thử lại |

---

## 6. Acceptance Criteria UX

1. Người dùng thấy rõ đang xem tiền mặt hay tài khoản ngân hàng nào.
2. Summary thu/chi/tồn quỹ thay đổi theo bộ lọc tài khoản và thời gian.
3. Phiếu thu/chi thủ công có nút tạo rõ ràng.
4. Phiếu từ POS/thu nợ không có nút sửa rời.
5. Công nợ và đối soát có lối vào riêng trong module Tài chính.

---

← [Quay về Finance README](./README.md)
