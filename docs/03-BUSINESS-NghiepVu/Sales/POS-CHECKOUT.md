# POS-CHECKOUT — Nghiệp vụ thanh toán

> **Trạng thái:** 🔨 Đang xây dựng
> **Nguồn:** Di chuyển từ `02-PRD-UX-PhongCanh/POS/K03/04-K03D-THANH-TOAN.md` (Section III)

---

## 1. MỤC ĐÍCH

Khi nhân viên bấm **THANH TOÁN** (`F9`), hệ thống thực thi 3 nhóm nghiệp vụ:

| Nhóm | Chi tiết |
|---|---|
| **Tính toán** | Tiền hàng → Trừ chiết khấu → Khách cần trả → Khách đưa → Tiền thừa / Nợ |
| **Hệ thống** | Lưu đơn hàng → Trừ kho vật tư → Tạo hóa đơn → Ghi nhận dòng tiền phát sinh |
| **Tiện ích** | Sinh bill text → Lưu vào Clipboard → Gửi Zalo |

---

## 2. NHÓM 1 — TÍNH TOÁN THANH TOÁN

### BR-CHK-01: Quy trình tính tiền

```
Tiền hàng (từ K02-C)
    ↓
Trừ chiết khấu (F8 — bảng giá / % giảm của đối tác)
    ↓
= Khách cần trả
    ↓
Nhập số tiền khách đưa
    ↓
= Tiền thừa (khách đưa > cần trả)  HOẶC  Nợ gối (khách đưa < cần trả)
```

### BR-CHK-02: Tiền thừa / Nợ gối

| Điều kiện | Kết quả |
|---|---|
| Khách đưa **>** Khách cần trả | `Tiền thừa = Khách đưa − Khách cần trả` |
| Khách đưa **=** Khách cần trả | `Tiền thừa = 0` |
| Khách đưa **<** Khách cần trả | `Nợ gối = Khách cần trả − Khách đưa` |

### BR-CHK-03: Điều kiện thanh toán thành công

| Điều kiện | Mô tả |
|---|---|
| Giỏ hàng không rỗng | Phải có ít nhất 1 dòng sản phẩm |
| Không có lỗi validation | Toàn bộ dòng hợp lệ (kích thước > 0, SL > 0) |

---

## 3. NHÓM 2 — XỬ LÝ HỆ THỐNG

### BR-CHK-04: Trừ kho vật tư

Khi đơn bán thành công, hệ thống **luôn trừ kho** theo các dòng hàng đã chốt.

| Loại dòng | Hành vi trừ kho |
|---|---|
| **Loại 1 (m²)** | Trừ định mức nguyên liệu tương ứng diện tích: `Tổng m² × Định mức (m²/lần)` |
| **Loại 2 (Cái)** | Trừ số lượng tồn kho |
| **Loại 3 (Combo/BOM)** | Trừ từng vật tư thành phần theo BOM. Nếu chọn "Không lưu — Chỉ trừ kho" thì không sinh mã Combo mới, nhưng vẫn trừ kho |

### BR-CHK-05: Lưu đơn hàng

| Trạng thái | Mô tả |
|---|---|
| Đơn mới | Tạo hóa đơn mới với đầy đủ thông tin |
| Đơn cũ | Cập nhật hóa đơn, giải phóng lock |

### BR-CHK-06: Ghi nhận dòng tiền

Khi có tiền thực thu phát sinh (`khách đưa > 0`), hệ thống sinh **Phiếu thu** ghi nhận số tiền khách đưa vào Sổ Quỹ.

Nếu khách chưa trả tiền hoặc chỉ trả một phần, phần còn nợ được lưu theo đơn hàng để theo dõi công nợ; Sổ Quỹ chỉ ghi số tiền thực nhận.

> Sổ Quỹ là bảng ghi nhận luồng tiền vào/ra — thuộc module Tài chính.

---

## 4. NHÓM 3 — TIỆN ÍCH

### BR-CHK-07: Sinh Bill text cho Zalo

Sau khi thanh toán thành công, hệ thống tự động biên dịch đơn hàng thành chuỗi văn bản sạch và **lưu vào Clipboard**.

Nhân viên mở Zalo → `Ctrl + V` → gửi cho khách.

> Bill text format thuộc thiết kế UX — xem `02-PRD-UX-PhongCanh/POS/K03/04-K03D-THANH-TOAN.md` Section IV.

---

## 5. LUỒNG TỔNG HỢP

```
Nhân viên bấm [THANH TOÁN] (F9)
    ↓
Dialog thanh toán hiện ra
    → Hiển thị: Tổng tiền | Chiết khấu | Khách cần trả
        → Nhân viên nhập số tiền khách đưa
            → Hệ thống tính: Tiền thừa / Còn nợ
                → Nhân viên bấm [XÁC NHẬN]
                    → Đơn hàng được lưu (BR-CHK-05)
                    → Kho vật tư được trừ (BR-CHK-04)
                    → Dòng tiền thực thu được ghi nhận nếu có (BR-CHK-06)
                    → Bill text được copy vào Clipboard (BR-CHK-07)
                        → Nhân viên Ctrl+V gửi Zalo cho khách
```

---

← [Quay về Sales README](./README.md)
