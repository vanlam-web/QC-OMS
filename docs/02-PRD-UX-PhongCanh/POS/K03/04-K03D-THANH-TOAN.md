# 04-K03D-THANH-TOAN.md — K03-D: CỤM NÚT TÁC VỤ CHỐT ĐƠN

> **Trạng thái:** 🔨 Đang xây dựng
> **Phần:** 2.1
> **Trở về:** [01-POS-LAYOUT.md](../01-POS-LAYOUT.md)

---

## I. GIAO DIỆN

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    [IN]                              [THANH TOÁN]                                │
│                                 (Màu xám - Phụ)               (Màu chủ đạo, lớn nhất - F9)                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## II. NÚT [IN]

| Thuộc tính | Giá trị |
|---|---|
| **Loại** | Tác vụ phụ |
| **Màu** | Xám |
| **Kích thước** | Nhỏ hơn nút THANH TOÁN |
| **Chức năng** | In đơn tạm — in bill ra máy in nhiệt để khách/kỹ thuật đối soánh trước khi chốt |

---

## III. NÚT [THANH TOÁN]

| Thuộc tính | Giá trị |
|---|---|
| **Loại** | Tác vụ chính |
| **Màu** | Màu chủ đạo (VD: xanh dương / xanh lá đậm) |
| **Kích thước** | Lớn nhất trong khối K03 |
| **Phím tắt** | `F9` |

---

### 3 nhóm logic khi bấm THANH TOÁN

| Nhóm | Chi tiết |
|---|---|
| **Tính toán** — Tiền hàng → Chiết khấu → Khách cần trả → Khách đưa → Tiền thừa / Nợ | [→ POS-CHECKOUT.md §2](../../../03-BUSINESS-NghiepVu/Sales/POS-CHECKOUT.md#2-nhóm-1--tính-toán-thanh-toán) |
| **Hệ thống** — Lưu đơn hàng → Trừ kho vật tư → Ghi nhận dòng tiền nếu có | [→ POS-CHECKOUT.md §3](../../../03-BUSINESS-NghiepVu/Sales/POS-CHECKOUT.md#3-nhóm-2--xử-lý-hệ-thống) |
| **Tiện ích** — Sinh bill text → Clipboard → Zalo | [→ POS-CHECKOUT.md §4](../../../03-BUSINESS-NghiepVu/Sales/POS-CHECKOUT.md#4-nhóm-3--tiện-ích) |

---

### Luồng chi tiết bước THANH TOÁN

```
Nhân viên bấm [THANH TOÁN] (F9)
  → Dialog thanh toán hiện ra
      → Hiển thị: Tổng tiền | Chiết khấu | Khách cần trả
          → Nhân viên nhập số tiền khách đưa
              → Hệ thống tính: Tiền thừa / Còn nợ
                  → Nhân viên bấm [XÁC NHẬN]
                      → Đơn được lưu
                      → Kho vật tư được trừ
                      → Dòng tiền thực thu được ghi vào Sổ Quỹ nếu có
                      → Bill text được copy vào Clipboard
                          → Nhân viên Ctrl+V gửi Zalo cho khách
```

---

## IV. KIẾN TRÚC BILL TEXT (ZALO)

```
================================
   CỬA HÀNG IN ẢNH VĂN LÂM
   ĐC: ...
   SDT: ...
================================
Ngay: DD/MM/YYYY HH:mm
NV: [Tên nhan vien]
KH: [Tên khach hang]
--------------------------------
1. In bat thuong
   1.2m x 2.5m x 2 = 6.0 m²
   Don gia: 40,000/m²
   Thanh tien: 240,000
...
--------------------------------
TONG M2 IN  : 6.0 m²
TONG TIEN   : 480,000
GIAM TRU    : 0
KHACH TRA   : 500,000
TIEN THUA   : 20,000
================================
   Cam on quy khach!
```

---

← [Quay về Master Map](../01-POS-LAYOUT.md)
