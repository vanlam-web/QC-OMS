# 04-K02D-HANG-DOI.md — K02-D: HÀNG ĐỢI MÁY TRẠM

> **Trạng thái:** 🔨 Đang xây dựng
> **Phần:** 2.1
> **Trở về:** [01-K02-GIO-HANG.md](./01-K02-GIO-HANG.md)

---

## I. GIAO DIỆN

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🖨️ IN BẠT (x)    │    🖨️ IN DECAL (x)    │    ✂️ CẮT CNC (x)                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


| Block    | Icon | Màu nền    | Badge `(x)`      |
| -------- | ---- | ---------- | ---------------- |
| IN BẠT   | 🖨️  | Xanh dương | Số file đang đợi |
| IN DECAL | 🖨️  | Xanh lá    | Số file đang đợi |
| CẮT CNC  | ✂️   | Đỏ / Cam   | Số file đang đợi |


- Nằm dưới đáy K02, thay cho thanh điều hướng cũ
- Badge `(x)` = số file đang chờ, cập nhật realtime qua Supabase channel

---

## II. LUỒNG TƯƠNG TÁC

```
Click Khối máy
  → Hiện danh sách file chờ (Drawer / Modal)
      → Chọn 1 file → Xem chi tiết đơn
          → Bấm [Hủy] / [Đẩy đơn]
              → Logic check xung đột đối tác:
                  Nếu khách đã có Tab nháp mở
                  → Hiện lựa chọn: [Gộp đơn] hoặc [Tạo đơn mới]
```

**Mô tả chi tiết từng bước:**

1. **Click vào block** (VD: `🖨️ IN BẠT`) → Mở danh sách file đang chờ của máy in bạt
2. **Chọn 1 file** trong danh sách → Xem chi tiết đơn hàng kèm thông số m²
3. **Hành động:**
  - `[Hủy]` → Xóa lệnh khỏi hàng đợi, không chuyển vào đơn
  - `[Đẩy đơn]` → Đẩy file vào giỏ hàng K02-A
4. **Check xung đột đối tác:**
  - Nếu khách hàng trong file đã có Tab nháp đang mở → hỏi nhân viên `[Gộp đơn]` hay `[Tạo đơn mới]`
  - Nếu khách chưa có Tab nào → tự động tạo Tab mới rồi đẩy vào

---

## III. TRẠNG THÁI REALTIME


| Trạng thái block  | Mô tả                                                |
| ----------------- | ---------------------------------------------------- |
| **Bình thường**   | Hiển thị số badge `(x)`                              |
| **Có file mới**   | Nhấp nháy (Pulse animation) + âm thanh thông báo nhẹ |
| **Không có file** | Badge hiển thị `(0)`, không nhấp nháy                |


> Hàng đợi cập nhật realtime — không cần reload thủ công. Chi tiết kênh dữ liệu thuộc tầng Database/Backend.

---

## IV. LƯU Ý VỀ CẢNH BÁO KHUI ĐỘNG

> **Lưu ý về cảnh báo khui động (`[⚠️ 🍾 Khui cuộn mới]` / `[⚠️ 🍾 Khui tấm mới]`):**
> Icon động này hiển thị tại dòng file trong K02-D khi cuộn dở / tấm lỡ không đủ cho lệnh in/CNC.
> Chi tiết trigger và xử lý ngầm xem [01d-K01-KHUI.md §IX](../K01/01d-K01-KHUI.md#ix-phân-biệt-với-cảnh-báo-khui-động-k02-d) và [02c-K02A-M2-KHUI.md §3](./02c-K02A-M2-KHUI.md#3-cơ-chế-cảnh-báo-khui-động-cho-cuộn--tấm).

---

← [Quay về K02 Tổng quan](./01-K02-GIO-HANG.md)
