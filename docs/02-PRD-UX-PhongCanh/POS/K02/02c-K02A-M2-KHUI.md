# 02c-K02A-M2-KHUI.md — K02-A: CẦU NỐI m² ↔ MÉT DÀI/TẤM & LOGIC KHUI ĐỘNG

> **Thuộc khối:** [02-K02A-DONG-SP.md](./02-K02A-DONG-SP.md) — Phần V
>
> **Trạng thái:** 🔨 Đang xây dựng
>
> **Trở về:** [02-K02A-DONG-SP.md](./02-K02A-DONG-SP.md) | [01-K02-GIO-HANG.md](./01-K02-GIO-HANG.md)

---

**Bài toán gốc:** Hệ thống xử lý sự bất đồng bộ giữa **Đơn vị tính thương mại** (`m²` — bán ra cho khách) và **Đơn vị tính lưu kho** (Mét dài cho Cuộn, Tấm cho Alu/Mica).

---

## 1. Bản đồ quy đổi dữ liệu (Data Mapping)

| Loại hàng | Nhập kho (Đầu vào) | Bán ra tại POS (Đầu ra) | Cơ chế trừ kho thực tế (Ngầm) |
|---|---|---|---|
| **Khổ dài** (Bạt, Decal, PP) | Theo Mét dài (`m`) của từng khổ rộng cụ thể. VD: Cuộn khổ 3.2m dài 80m; Cuộn khổ 1.52m dài 50m. | Theo `m²` = `Rộng × Dài × SL` | Trừ theo **mét dài di động** của cuộn đang khui có khổ tương ứng. Không trừ `m²` tổng. |
| **Tấm** (Alu, Mica, Formex) | Theo Số lượng Tấm nguyên quy chuẩn cố định (`1.22m × 2.44m`). | Theo `m²` hoặc Cái/Tấm lẻ kích thước tùy chọn. | Ưu tiên trừ **Tấm lỡ khổ** trong kho mẩu thừa. Nếu không vừa → Trừ nguyên 1 Tấm chuẩn và sinh ra tấm lỡ mới. |

---

## 2. Thuật toán tự động chọn khổ & tính diện tích mặc định

Khi nhân viên nhập kích thước tại POS, hệ thống tự động thực hiện chuỗi toán ngầm để đưa ra Khổ cuộn hoặc Cách cắt tấm tối ưu (hao hụt ít nhất).

---

### 2a. Đối với hàng Khổ dài (Bạt, Decal, PP)

**Bước 1 — Cộng biên:**
Lấy kích thước khách đặt cộng biên vật liệu theo quy định:

```
W_phôi = W_khách + 0.10 m   (Bạt: +10cm)
W_phôi = W_khách + 0.05 m   (Decal: +5cm)
```

**Bước 2 — Quét khổ tối ưu:**
Hệ thống quét toàn bộ các khổ cuộn hiện có trong kho của mã hàng đó (VD: kho đang có các cuộn khổ: 1.52m, 2.2m, 3.2m).

**Bước 3 — Chọn mặc định:**
Lọc ra các khổ cuộn có `Khổ rộng cuộn ≥ W_phôi` (hoặc `L_phôi` nếu xoay chiều file). Trong các khổ đủ điều kiện, khổ nào có **phần thừa chiều rộng nhỏ nhất** sẽ được hệ thống tự động chọn làm mặc định.

**Bước 4 — Trừ kho mét dài:**
Khi file được in thành công, hệ thống không trừ `m²` tổng mà tìm đúng **ID của cuộn đang khui** thuộc khổ đó và trừ thẳng vào chiều dài:

```
Chiều dài cuộn dở mới = Chiều dài cuộn dở cũ - L_phôi
```

---

### 2b. Đối với hàng Tấm (Alu, Mica, Formex)

**Bước 1 — Ưu tiên Tấm lỡ:**
Hệ thống vào **Kho tấm lỡ khổ** để tìm các mẩu Alu/Mica thừa từ các lần cắt trước xem có tấm nào chứa vừa kích thước khách đặt không. Nếu có nhiều tấm vừa, chọn tấm có **diện tích nhỏ nhất** để tiêu thụ đồ thừa trước.

**Bước 2 — Sử dụng Tấm nguyên:**
Nếu kho tấm lỡ không có mẩu nào vừa, hệ thống tự động chọn **Tấm nguyên quy chuẩn `1.22m × 2.44m`** làm mặc định.

**Bước 3 — Bóc tách sinh mẩu thừa:**
Khi cắt, hệ thống chạy thuật toán chia tấm thẳng. Phần diện tích còn lại nếu **lớn hơn hạn mức giữ lại** (VD: `> 0.1m²`) sẽ được tự động lưu ngược lại vào kho tấm lỡ với kích thước cụ thể để dùng cho đơn sau.

---

## 3. Cơ chế "Cảnh báo khui động" (CHO CUỘN & TẤM)

Cơ chế Cảnh báo khui chỉ xuất hiện tại **Hàng đợi máy trạm (K02-D)** hoặc màn hình điều phối file khi hệ thống phát hiện vật tư dùng dở hiện tại **không đủ** để đáp ứng lệnh sản xuất.

---

### 3a. Luồng khui cuộn bạt/decal động (Loại hàng: Khổ dài)

| Trạng thái | Xử lý |
|---|---|
| **Điều kiện kích hoạt** | Thợ bấm chuẩn bị xuất file in. Hệ thống lấy `L_phôi` của đơn hàng so sánh với Chiều dài còn lại của cuộn đang khui trong máy in đó. |
| **Nếu `L_phôi > Chiều dài cuộn dở hiện tại`** | Hệ thống khóa lệnh in, dòng file nhấp nháy **cảnh báo đỏ**. Hiển thị Icon động `[⚠️ 🍾 Khui cuộn mới]` ngay tại dòng file đó. |
| **Hành động thợ** | Thợ tiến hành thay cuộn mới vật lý ngoài xưởng, sau đó click `[⚠️ 🍾 Khui cuộn mới]`. |
| **Xử lý ngầm** | Ép mét dài cuộn dở cũ về 0 → Trừ 1 cuộn nguyên ở kho lớn → Nạp đầy số mét nguyên (80m hoặc 50m...) vào máy → **Mở khóa lệnh IN**. |

---

### 3b. Luồng khui tấm Alu/Mica động (Loại hàng: Tấm)

| Trạng thái | Xử lý |
|---|---|
| **Điều kiện kích hoạt** | Lệnh gia công CNC/Laser được chuyển xuống máy trạm. Hệ thống kiểm tra "Bể tấm lỡ khổ phù hợp" và "Tấm dở đang cắt tại máy" đều bằng 0 hoặc không có tấm nào đủ kích thước để chứa phôi cắt của đơn hàng. |
| **Cảnh báo** | Hệ thống hiển thị: `"Không có tấm lỡ phù hợp. Cần bẻ tấm nguyên!"` kèm Icon động `[⚠️ 🍾 Khui tấm mới]`. |
| **Hành động thợ** | Thợ lấy tấm Alu/Mica nguyên khổ `1.22m × 2.44m` đặt lên bàn máy, click `[⚠️ 🍾 Khui tấm mới]`. |
| **Xử lý ngầm** | (1) Trừ -1 Tấm nguyên trong Kho tổng lớn. (2) Tạo phiên làm việc tấm dở hiện tại. (3) Phần thừa còn lại (nếu đạt chuẩn giữ lại) được treo "Chờ thu hồi" hoặc nạp thẳng vào danh sách Tấm lỡ khổ ngay khi máy chạy xong. |

---

## 4. Cụm nút Khui tự do ngoài giao diện Main POS

Để giữ khu vực giỏ hàng đơn (BOM) luôn sạch, các nút khui vật lý thủ công được gom ra **Thanh công cụ hệ thống bên ngoài** (không nằm trong khoang BOM của đơn hàng).

**Vị trí:** Thanh công cụ đỉnh (Top Bar) — cố định, hiển thị cho mọi người dùng xưởng.

**Wireframe Top Bar (minh họa rút gọn — xem wireframe chuẩn tại [K01/01-K01-TOPBAR.md](../K01/01-K01-TOPBAR.md)):**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [🔍 Tìm hàng hóa F3...]  [📊 Báo cáo kho]  [🍾 KHUI VẬT TƯ]  [⚙️ Thiết lập]                    User: Thợ Cắt │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

> ⚠️ **Lưu ý:** Wireframe trên là dạng rút gọn 1 dòng để minh họa vị trí các nút trong ngữ cảnh của K02. **Wireframe chính thức 4 khu vực** (Search / Tab Đa HĐ / Khui VT / Tiện ích) nằm ở `K01/01-K01-TOPBAR.md` §I. Khi triển khai UI phải dùng wireframe K01, không dùng wireframe rút gọn này.

---

### 4a. Nút Khai báo Khui tự do (Global Action)

**Nhiệm vụ:** Phục vụ riêng cho các trường hợp thợ bóc đồ mới **độc lập với đơn hàng**:

- Phát hiện cuộn bạt cũ bị chuột cắn hỏng.
- Bao vít bị đổ vỡ.
- Hộp keo bị khô...

**Popup Khui tự do:**

```
┌─────────────────────────────────────────────────────────┐
│ 🍾 KHAI BÁO KHUI VẬT TƯ TỰ DO                   [✕] │
├─────────────────────────────────────────────────────────┤
│ Loại vật tư:  [ Vật tư phụ (Keo/Vít/Nguồn...)  ▾]  │
│                  [ Khổ dài (Bạt/Decal/PP)          ▾]  │
│                  [ Tấm (Alu/Mica/Formex)             ▾]  │
│                                                         │
│ Chọn mã vật tư: [ Tìm kiếm...                      ]│
│ Khổ rộng:     [  2.2 m  ]   (nếu chọn Khổ dài)     │
│ Số mét/cuộn:  [  80    m  ]   (chiều dài cuộn mới)  │
│                                                         │
│ Ghi chú:       [ Lý do khui: cuộn bị chuột cắn...  ]│
│                                                         │
│                      [ XÁC NHẬN KHUI ]                 │
└─────────────────────────────────────────────────────────┘
```

**Quy trình xử lý khi Click [XÁC NHẬN KHUI]:**

| Loại vật tư | Xử lý ngầm |
|---|---|
| **Vật tư phụ** (Keo/Vít/LED...) | Hủy số lượng dở ảo cũ về 0 → Trừ 1 thùng/bao nguyên từ kho lớn → Tính toán **giá vốn bình quân gia quyền di động** cho mã đó. |
| **Khổ dài** (Bạt/Decal/PP) | Thợ chọn đúng Khổ rộng cần khui (VD: bạt khổ 2.2m). Hệ thống ép cuộn dở cũ của khổ đó về 0 → Trừ 1 cuộn nguyên khổ 2.2m ở kho lớn để bù vào. |
| **Tấm** (Alu/Mica) | Thợ chọn đúng khổ tấm. Hệ thống ép tấm dở cũ về 0 → Trừ 1 tấm nguyên khổ `1.22 × 2.44` ở kho lớn. |

> **Tóm tắt luồng tổng:** Ngoài POS cứ bán `m²` tính tiền bình thường cho khách. Còn máy trạm của thợ in, thợ CNC tự động theo dõi số **mét dài** và **số tấm** thực tế để ép khui kho chính xác.

---

← [Quay về 02-K02A-DONG-SP.md](./02-K02A-DONG-SP.md) | [01-K02-GIO-HANG.md](./01-K02-GIO-HANG.md)
