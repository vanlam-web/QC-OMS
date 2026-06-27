# 01-K03A-DOI-TAC.md — K03-A: HỒ SƠ ĐỐI TÁC & BỘ LỌC GIÁ

> **Trạng thái:** 🔨 Đang xây dựng
> **Phần:** 2.1
> **Trở về:** [01-POS-LAYOUT.md](../01-POS-LAYOUT.md)

---

## I. GIAO DIỆN

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [👤 Tìm/Thêm khách hàng (F4)...]                                                                              │
│  [Đối tác đã chọn ▼]    Bảng giá: [% chiết khấu ▼]                                    [× Bỏ chọn KH]         │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## II. CHỨC NĂNG

| Thành phần | Mô tả | Phím tắt |
|---|---|---|
| **Tìm/Thêm nhanh KH** | Tìm kiếm và chọn khách hàng đã có trong hệ thống. Nếu chưa có, nhập nhanh thông tin và `Enter` để tạo mới | `F4` |
| **Bảng giá chiết khấu** | Dropdown áp dụng bảng giá riêng cho khách hàng đã chọn. Tự động tính lại Thành tiền trong K02-A khi đổi bảng giá | — |
| **Bỏ chọn KH** | Reset về trạng thái Khách lẻ (không áp bảng giá, không gắn đối tác vào đơn) | — |

---

## III. TRẠNG THÁI ĐỐI TÁC

| Trạng thái | Hiển thị |
|---|---|
| **Chưa chọn** | Input placeholder: `Tìm/Thêm khách hàng (F4)...`, không hiển thị bảng giá |
| **Đã chọn** | Hiển thị tên KH + Bảng giá đang áp + Nút `[× Bỏ chọn KH]` |
| **Thiếu SĐT** | Kích hoạt Toast `K03-B` nhắc nhở bổ sung SĐT |

---

## IV. THAM CHIẾU DỮ LIỆU

| Nội dung | Mục đích | Chi tiết |
|---|---|---|
| Hồ sơ đối tác | Lưu thông tin khách hàng / đối tác | [→ POS-TABLES.md §1](../../../04-DATABASE/Sales/POS-TABLES.md#1-bảng-publiccustomers--đối-tác--khách-hàng) |
| Bảng giá | Danh sách bảng giá áp dụng | [→ POS-TABLES.md §2](../../../04-DATABASE/Sales/POS-TABLES.md#2-bảng-publicprice_lists--bảng-giá) |

---

← [Quay về Master Map](../01-POS-LAYOUT.md)
