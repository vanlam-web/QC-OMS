# POS — MÀN HÌNH BÁN HÀNG

> **Trạng thái:** 🔨 Đang xây dựng

---

## 📁 Cấu trúc thư mục

```
02-PRD-UX/
└── POS/
    ├── [01-POS-LAYOUT.md](./01-POS-LAYOUT.md)                     ← Bản đồ tổng thể
    │
    ├── K01/                      ← Khối K01: Thanh đỉnh
    │   └── [01-K01-TOPBAR.md](./K01/01-K01-TOPBAR.md)
    │
    ├── K02/                      ← Khối K02: Giỏ hàng & Máy trạm
    │   ├── [01-K02-GIO-HANG.md](./K02/01-K02-GIO-HANG.md)       ← Tổng quan & Logic tiếp nhận
    │   ├── [02-K02A-DONG-SP.md](./K02/02-K02A-DONG-SP.md)       ← Dòng SP động (m² / Cái / Combo)
    │   ├── [03-K02B-GHI-CHU.md](./K02/03-K02B-GHI-CHU.md)       ← Ghi chú đơn hàng tổng
    │   └── [04-K02D-HANG-DOI.md](./K02/04-K02D-HANG-DOI.md)     ← Hàng đợi máy trạm
    │
    └── K03/                      ← Khối K03: Đối tác & Sản phẩm
        ├── [01-K03A-DOI-TAC.md](./K03/01-K03A-DOI-TAC.md)       ← Hồ sơ đối tác & Bộ lọc giá
        ├── [02-K03B-TOAST.md](./K03/02-K03B-TOAST.md)             ← Bong bóng Toast SĐT
        ├── [03-K03C-LUOI-SP.md](./K03/03-K03C-LUOI-SP.md)       ← Lưới sản phẩm nhanh
        └── [04-K03D-THANH-TOAN.md](./K03/04-K03D-THANH-TOAN.md) ← Nút chốt đơn
```

---

## 🗺️ Sơ đồ khối

```
┌──────────────────────────────────────────────────────────────────────────┐
│  K01: Thanh đỉnh (100%)                                                 │
├─────────────────────────────────┬────────────────────────────────────────┤
│  K02: Giỏ hàng (~65%)          │  K03: Đối tác & SP (~35%)             │
│                                 │                                        │
│  K02-A: Dòng SP động           │  K03-A: Hồ sơ đối tác + Bảng giá      │
│  K02-B: Ghi chú đơn hàng tổng  │  K03-B: Toast thông báo SĐT            │
│  K02-C: Bộ đếm tổng realtime   │  K03-C: Lưới sản phẩm nhanh           │
│  K02-D: Hàng đợi máy trạm      │  K03-D: Nút [IN] / [THANH TOÁN]       │
└─────────────────────────────────┴────────────────────────────────────────┘
```

---

## 📋 Trạng thái các khối

| Khối | File | Trạng thái |
|---|---|---|
| Bản đồ tổng thể | [01-POS-LAYOUT.md](./01-POS-LAYOUT.md) | ✅ |
| K01: Top Bar | [K01/01-K01-TOPBAR.md](./K01/01-K01-TOPBAR.md) | 🔨 |
| K02-A: Dòng SP động | [K02/02-K02A-DONG-SP.md](./K02/02-K02A-DONG-SP.md) | 🔨 |
| K02-B: Ghi chú đơn hàng | [K02/03-K02B-GHI-CHU.md](./K02/03-K02B-GHI-CHU.md) | 🔨 |
| K02-C: Bộ đếm tổng | *(trong 02-K02A)* | 🔨 |
| K02-D: Hàng đợi máy trạm | [K02/04-K02D-HANG-DOI.md](./K02/04-K02D-HANG-DOI.md) | 🔨 |
| K03-A: Hồ sơ đối tác | [K03/01-K03A-DOI-TAC.md](./K03/01-K03A-DOI-TAC.md) | 🔨 |
| K03-B: Toast SĐT | [K03/02-K03B-TOAST.md](./K03/02-K03B-TOAST.md) | 🔨 |
| K03-C: Lưới sản phẩm | [K03/03-K03C-LUOI-SP.md](./K03/03-K03C-LUOI-SP.md) | 🔨 |
| K03-D: Thanh toán | [K03/04-K03D-THANH-TOAN.md](./K03/04-K03D-THANH-TOAN.md) | 🔨 |

**K01 không có README.md riêng** — vì K01 chỉ có 1 file `01-K01-TOPBAR.md` (file đó đã liệt kê 4 khu vực trong bảng nội bộ của nó).

---

← [Quay về 02-PRD-UX-PhongCanh README](../README.md)