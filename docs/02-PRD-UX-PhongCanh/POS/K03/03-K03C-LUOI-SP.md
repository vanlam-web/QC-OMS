# 03-K03C-LUOI-SP.md — K03-C: LƯỚI SẢN PHẨM NHANH

> **Trạng thái:** 🔨 Đang xây dựng
> **Phần:** 2.1
> **Trở về:** [01-POS-LAYOUT.md](../01-POS-LAYOUT.md)

---

## I. GIAO DIỆN

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                                              │
│  │  [Ảnh SP]       │  │  [Ảnh SP]       │  │  [Ảnh SP]       │                                              │
│  │  Tên sản phẩm   │  │  Tên sản phẩm   │  │  Tên sản phẩm   │                                              │
│  │  40,000/m²      │  │  65,000/m²      │  │  80,000/cái     │                                              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                                              │
│  │  ...             │  │  ...             │  │  ...             │                                              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘                                              │
│                                                                                            [< 1 / 13 >]  [‹] [›] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## II. THÀNH PHẦN

| Thành phần | Mô tả |
|---|---|
| **Lưới 3 cột** | Hiển thị sản phẩm theo hàng |
| **Ô sản phẩm** | Chứa Ảnh + Tên + Giá — click bất kỳ điểm nào để thêm vào giỏ |
| **Phân trang** | `[< 1 / 13 >]` = Trang hiện tại / Tổng số trang |
| **Nút điều hướng trang** | `[‹]` trang trước, `[›]` trang sau |

---

## III. HÀNH VI CLICK

- **Click vào ô bất kỳ** → Thêm sản phẩm vào K02-A (áp dụng đúng Logic tiếp nhận: m² / Cái / Combo)
- Nếu đang ở trang khác, click vẫn thêm bình thường (không cần chuyển trang)

---

## IV. THANH PHÂN TRANG

| Thành phần | Chi tiết |
|---|---|
| **Format** | `[< 1 / 13 >]` |
| **Nút `[‹]`** | Quay về trang trước (disabled nếu đang trang 1) |
| **Nút `[›]`** | Tiến đến trang sau (disabled nếu đang trang cuối) |
| **Mỗi trang** | Hiển thị tối đa 12 sản phẩm (4 hàng × 3 cột) |

---

← [Quay về Master Map](../01-POS-LAYOUT.md)
