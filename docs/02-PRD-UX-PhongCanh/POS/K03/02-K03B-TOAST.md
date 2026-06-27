# 02-K03B-TOAST.md — K03-B: BONG BÓNG THÔNG BÁO TOAST

> **Trạng thái:** 🔨 Đang xây dựng
> **Phần:** 2.1
> **Trở về:** [01-POS-LAYOUT.md](../01-POS-LAYOUT.md)

---

## I. GIAO DIỆN

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  [K03-A: Hồ sơ đối tác]                                                                       │
│                                                                                               │
│                                    ┌──────────────────────────────┐                           │
│                                    │ ⚠️ Bổ sung SĐT KH           │  ← Toast trượt ra         │
│                                    └──────────────────────────────┘                           │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Màu nền:** Vàng cam (`#FFA500`) hoặc cam nhạt
- **Vị trí:** Xuất hiện cạnh bên phải / phía dưới K03-A
- **Animation:** Slide-in từ trên → Fade-out sau 3 giây

---

## II. LOGIC KÍCH HOẠT

| Bước | Hành vi                                 | Chi tiết                                                                                                   |
| ---- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1    | Chọn / tạo đối tác tại K03-A            | [→ TOAST-API.md §1](../../../05-BACKEND-MayChu/POS/TOAST-API.md#1-kiểm-tra-sđt-khách-hàng) |
| 2    | Hệ thống kiểm tra hồ sơ                 | [→ TOAST-API.md §1.2](../../../05-BACKEND-MayChu/POS/TOAST-API.md#12-validation) |
| 3    | Nếu `phone` rỗng/null → kích hoạt Toast | [→ TOAST-API.md §1.3](../../../05-BACKEND-MayChu/POS/TOAST-API.md#13-workflow) |

---

## III. LOGIC HIỂN THỊ

| Bước | Hành vi                                                  |
| ---- | -------------------------------------------------------- |
| 1    | Toast trượt ra từ trên với nội dung: `⚠️ Bổ sung SĐT KH` |
| 2    | Giữ nguyên trong **3 giây**                              |
| 3    | Tự động Fade-out (ẩn dần) nếu nhân viên không tương tác  |

---

## IV. LOGIC TƯƠNG TÁC

| Hành động                          | Phản hồi                                 | Chi tiết                                                                                           |
| ---------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Click vào Toast** (trong 3 giây) | Bật Pop-over nhập nhanh SĐT tại chỗ      | —                                                                                                  |
| **Gõ SĐT + `Enter`**               | Lưu SĐT, đóng Pop-over, ẩn Toast | [→ TOAST-API.md §2](../../../05-BACKEND-MayChu/POS/TOAST-API.md#2-lưu-sđt-khách-hàng) |
| **Không click** (hết 3 giây)       | Toast tự động Fade-out, SĐT vẫn để trống | —                                                                                                  |

---

← [Quay về Master Map](../01-POS-LAYOUT.md)
