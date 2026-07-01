# 01d-K01-KHUI.md — K01-D: POPUP KHUI VẬT TƯ TỰ DO

> **Trạng thái:** 🔨 Đang xây dựng
> **Phần:** 2.1 — K01
> **Trở về:** [01-K01-TOPBAR.md](./01-K01-TOPBAR.md)
> **File cha:** K01 — Thanh đỉnh Top Bar

---

## I. VỊ TRÍ & TẦM QUAN TRỌNG

**Vị trí:** Khu vực 3 trên Top Bar — nằm giữa thanh tab đa hóa đơn (Khu vực 2) và cụm tiện ích (Khu vực 4).

**Tầm với:** Top Bar hiển thị **trên mọi màn hình** hệ thống POS — kể cả khi đang ở giỏ hàng, hàng đợi máy sản xuất, hay báo cáo kho. Nút `[🍾 KHUI VẬT TƯ]` luôn sẵn sàng thao tác.

**Người dùng mục tiêu:**

| Vai trò | Khi nào dùng |
|---|---|
| **Thu ngân** | Phát hiện vật tư dùng cho đơn bị lỗi, cần ghi nhận hao hụt ngoài đơn |
| **Thợ in / Thợ CNC** | Cuộn bạt bị chuột cắn, tấm alu bị cong vênh, led bị hỏng — cần khai báo thay thế |
| **Quản lý kho** | Kiểm tra và xác nhận khui vật tư mới khi thợ báo hỏng |

---

## II. WIREFRAME TỔNG THỂ TOP BAR

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Khu vực 1                    │  Khu vực 2                              │  Khu vực 3         │  Khu vực 4              │
│  ─────────────────────        │  ─────────────────────────────────      │  ───────────────    │  ─────────────────────  │
│  [ 🔍 Tìm hàng... (F3) ]     │  [‹] [Hóa đơn 1 ✕] [Hóa đơn 2 ✕] [+] │  [🍾 KHUI VẬT TƯ]  │  🕒  🟢  [🔄]  [👤]  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
  II.1 — Search                  II.2 — Tabs Đa HĐ                        II.3 — Khui              II.4 — Tiện ích
```

---

## III. POPUP KHAI BÁO KHUI TỰ DO

### 3.1. Trigger

Nhấn nút `[🍾 KHUI VẬT TƯ]` trên Top Bar → Popup overlay hiện ra, che phủ 40% màn hình, backdrop mờ tối.

### 3.2. Wireframe Popup

```
┌──────────────────────────────────────────────────────────────┐
│ 🍾 KHAI BÁO KHUI VẬT TƯ TỰ DO                        [✕] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Bước 1 — Chọn loại vật tư:                                │
│   ○ Vật tư phụ (Keo / Vít / Nguồn / LED / Bu lông...)    │
│   ● Khổ dài (Bạt Hiflex / Decal / PP / Canvas)           │
│   ○ Tấm (Alu / Mica / Formex)                             │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ Bước 2 — Thông tin khui:                                   │
│   Nhóm mã vật tư:  [ Bạt Hiflex 480g xuyên sáng    ▾]   │
│   Khổ rộng cuộn:   [  2.2  ] m                            │
│   Số mét/cuộn mới: [  80    ] m                            │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ Bước 3 — Ghi chú lý do khui:                              │
│   [ Cuộn bị chuột cắn đầu cuốn, còn ~77m dở        ]   │
│                                                              │
│                        [ HUỶ ]      [ XÁC NHẬN KHUI ]     │
└──────────────────────────────────────────────────────────────┘
```

---

## IV. CHI TIẾT TỪNG TRƯỜNG NHẬP LIỆU

### 4.1. Bước 1 — Loại vật tư

| Trường | Loại control | Bắt buộc | Mô tả |
|---|---|---|---|
| **Loại vật tư** | Radio button (3 lựa chọn) | ✅ | Chọn 1 trong 3 nhóm: Vật tư phụ / Khổ dài / Tấm |

**Hành vi động:**
- Khi chọn `Khổ dài` → Hiện trường: Nhóm mã vật tư, Khổ rộng cuộn, Số mét/cuộn mới.
- Khi chọn `Tấm` → Hiện trường: Nhóm mã vật tư, kích thước mặc định `1.22m × 2.44m`.
- Khi chọn `Vật tư phụ` → Hiện trường: Nhóm mã vật tư, Số lượng.

### 4.2. Bước 2 — Thông tin khui

| Trường | Hiện khi | Bắt buộc | Kiểu dữ liệu | Mô tả |
|---|---|---|---|---|
| **Nhóm mã vật tư** | Luôn hiện | ✅ | Dropdown tìm kiếm | Lọc động theo loại đã chọn ở Bước 1 |
| **Khổ rộng cuộn** | `Khổ dài` | ✅ | Number (0.1m → 10m) | Chiều rộng cuộn mới |
| **Số mét/cuộn mới** | `Khổ dài` | ✅ | Number (1m → 500m) | Chiều dài nguyên của cuộn mới |
| **Kích thước tấm** | `Tấm` | ✅ | Auto-filled `1.22m × 2.44m` | Tấm nguyên quy chuẩn |
| **Số lượng** | `Vật tư phụ` | ✅ | Integer (1 → 9999) | Số thùng/bao/hộp |

### 4.3. Bước 3 — Ghi chú

| Trường | Bắt buộc | Giới hạn | Ví dụ |
|---|---|---|---|
| **Lý do khui** | ✅ | 255 ký tự | `Cuộn bị chuột cắn đầu cuốn` / `Keo bị khô đông cứng` / `Tấm bị cong vênh` |

---

## V. USE CASE CHI TIẾT

### UC-01: Thợ in phát hiện cuộn bạt bị chuột cắn giữa chừng

| Bước | Hành động người dùng | Hệ thống phản hồi |
|---|---|---|
| 1 | Thợ phát hiện cuộn bạt 2.2m bị chuột cắn ~3m đầu cuốn, không thể in tiếp | — |
| 2 | Nhấn `[🍾 KHUI VẬT TƯ]` trên Top Bar | Popup khai báo hiện ra |
| 3 | Chọn `Khổ dài` → `Bạt Hiflex 480g xuyên sáng` → Khổ `2.2m` → Mét `80m` | Các trường được điền |
| 4 | Ghi chú: `Cuộn bị chuột cắn đầu cuốn, còn ~77m dở` | — |
| 5 | Nhấn `[XÁC NHẬN KHUI]` | Popup đóng, toast `"Đã khui: Bạt Hiflex 480g — Khổ 2.2m — 80m"` |
| 6 | *(Ngầm)* Trừ 1 cuộn nguyên khổ 2.2m khỏi kho lớn, nạp cuộn dở mới 80m vào phiên làm việc | — |

---

### UC-02: Thợ CNC phát hiện tấm Alu bị cong vênh không thể cắt

| Bước | Hành động người dùng | Hệ thống phản hồi |
|---|---|---|
| 1 | Thợ CNC kiểm tra tấm Alu 3mm chuẩn bị cong vênh nghiêm trọng | — |
| 2 | Nhấn `[🍾 KHUI VẬT TƯ]` | Popup hiện ra |
| 3 | Chọn `Tấm` → `Alu 3mm PNJ` | Hệ thống tự điền kích thước `1.22m × 2.44m` |
| 4 | Ghi chú: `Tấm bị cong vênh, không cắt được` | — |
| 5 | `[XÁC NHẬN KHUI]` | Đóng popup, toast `"Đã khui: Alu 3mm PNJ — 1.22×2.44m"` |
| 6 | *(Ngầm)* Trừ 1 tấm Alu nguyên khổ 1.22×2.44m trong kho lớn, tạo phiên tấm dở mới | — |

---

### UC-03: Nhân viên kho phát hiện hộp keo bị khô đông cứng

| Bước | Hành động người dùng | Hệ thống phản hồi |
|---|---|---|
| 1 | Kho phát hiện hộp keo trung thủy 300ml bị khô đặc | — |
| 2 | Nhấn `[🍾 KHUI VẬT TƯ]` | Popup hiện ra |
| 3 | Chọn `Vật tư phụ` → `Keo trung thủy 300ml` | — |
| 4 | Ghi chú: `Keo bị khô đông cứng, hết hạn sử dụng` | — |
| 5 | `[XÁC NHẬN KHUI]` | Đóng popup, toast `"Đã khui: Keo trung thủy 300ml — 1 chai"` |
| 6 | *(Ngầm)* Hủy số dở cũ về 0, trừ 1 chai keo nguyên khỏi kho, tính giá vốn bình quân gia quyền | — |

---

## VI. XỬ LÝ NGẦM THEO TỪNG LOẠI

| Loại vật tư | Xử lý ngầm khi Xác nhận |
|---|---|
| **Vật tư phụ** (Keo/Vít/Nguồn/LED/Bu lông...) | (1) Hủy số lượng dở ảo cũ về 0. (2) Trừ 1 thùng/bao/đơn vị nguyên từ kho lớn. (3) Tính **giá vốn bình quân gia quyền di động** cho mã đó. |
| **Khổ dài** (Bạt/Decal/PP/Canvas) | (1) Ép mét dài cuộn dở cũ của khổ đó về 0. (2) Trừ 1 cuộn nguyên khổ tương ứng ở kho lớn. (3) Tạo phiên làm việc cuộn dở mới với số mét mới. |
| **Tấm** (Alu/Mica/Formex) | (1) Ép tấm dở cũ về 0. (2) Trừ 1 tấm nguyên `1.22m × 2.44m` ở kho lớn. (3) Tạo phiên làm việc tấm dở mới với kích thước nguyên. |

---

## VII. GIAO DIỆN SAU KHI XÁC NHẬN

| Kết quả | Hành vi |
|---|---|
| **Thành công** | Popup tự đóng. Toast notification màu xanh hiển thị 3 giây ở góc phải dưới: `"Đã khui thành công: [Tên vật tư] — [Khổ] — [Số mét/số tấm]"`. |
| **Lỗi kết nối Supabase** | Toast báo đỏ: `"Lỗi kết nối. Vui lòng thử lại."` kèm nút `[Thử lại]`. Popup vẫn mở để không mất dữ liệu đã nhập. |
| **Click [X] hoặc bấm Escape** | Đóng popup, không lưu gì cả. |

---

## VIII. EDGE CASES — LỖI VÀ XỬ LÝ

| # | Tình huống | Hành vi hệ thống |
|---|---|---|
| 1 | Chưa chọn loại vật tư mà đã nhấn Xác nhận | Nút `[XÁC NHẬN KHUI]` bị vô hiệu hóa (disabled), tooltip: `"Vui lòng chọn loại vật tư"` |
| 2 | Chưa chọn mã vật tư | Tương tự — nút disabled, tooltip: `"Vui lòng chọn mã vật tư"` |
| 3 | Khổ rộng nhập ≤ 0 hoặc không phải số | Border trường đỏ, thông báo: `"Khổ rộng phải là số > 0"` |
| 4 | Số mét/cuộn nhập ≤ 0 | Tương tự — bắt buộc nhập số dương |
| 5 | Kho lớn đang hết hàng (số lượng = 0) | Toast cảnh báo vàng: `"Kho đã hết [Tên vật tư]. Vẫn ghi nhận sự cố!"` — cho phép xác nhận để lưu log sự cố |
| 6 | Nhập ký tự vào trường số | Bị loại bỏ tự động, chỉ chấp nhận số |
| 7 | Ghi chú quá 255 ký tự | Counter đỏ: `"255/255"` — không cho nhập thêm |

---

## IX. PHÂN BIỆT VỚI CẢNH BÁO KHUI ĐỘNG (K02-D)

| | **Popup Khui Tự do (K01-D — file này)** | **Cảnh báo Khui động (K02-D)** |
|---|---|---|
| **Vị trí** | Top Bar — mọi màn hình, mọi lúc | Dòng file trong hàng đợi máy sản xuất |
| **Kích hoạt** | Thủ công — người dùng chủ động click | Tự động — hệ thống phát hiện thiếu vật tư |
| **Trigger** | Click người dùng | `L_phôi > Chiều dài cuộn dở` hoặc không có tấm lỡ |
| **Mục đích** | Ghi nhận vật tư hỏng/phanh, khai báo khui mới độc lập | Chặn lệnh in/CNC, bắt thợ khui đúng vật tư đang thiếu |
| **Icon** | `[🍾 KHUI VẬT TƯ]` (tĩnh, cố định) | `[⚠️ 🍾 Khui cuộn mới]` (nhấp nháy đỏ, gắn trên dòng file) |

---

## X. LƯU VẾT KHUI VẬT TƯ

Mỗi lần xác nhận khui phải để lại lịch sử đủ để truy vết: ai khui, vật tư nào, số lượng/khổ liên quan, lý do và thời điểm thực hiện.

Chi tiết bảng lưu log thuộc tầng Database/Backend khi module Inventory được đặc tả.

---

← [Quay về K01 Top Bar](./01-K01-TOPBAR.md)
