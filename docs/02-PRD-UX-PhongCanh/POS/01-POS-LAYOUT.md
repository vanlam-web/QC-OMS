# 01-POS-LAYOUT.md — BẢN ĐỒ TỔNG THỂ MÀN HÌNH BÁN HÀNG (POS MASTER BLUEPRINT)

> **Trạng thái:** 🔨 Đang xây dựng
> **Phần:** 2.1

---

## I. MẶT BẰNG TỔNG THỂ (GLOBAL GRID — CỐ ĐỊNH 1 LUỒNG BÁN)

Loại bỏ hoàn toàn dải nút đáy cũ của KiotViet (Bán thường, Bán nhanh, Bán giao hàng). Toàn bộ màn hình POS khóa cứng cho một luồng bán duy nhất, chia làm 3 dải ngang cố định:

```
================================================================================================
[ K01: THANH ĐIỀU HƯỚNG ĐỈNH & ĐA NHIỆM TABS (Top Bar) — Trải dài 100% chiều ngang]
================================================================================================
|| K02: KHỐI GIỎ HÀNG & ĐIỀU PHỐI MÁY TRẠM (~65%)| K03: KHỐI ĐỐI TÁC & CHỌN SẢN PHẨM (~35%)     |
||-----------------------------------------------|----------------------------------------------|
|| [K02-A] Giỏ hàng động — Tính m² & Bung Combo  | [K03-A] Hồ sơ đối tác & Bộ lọc bảng giá      |
|| [K02-B] Ghi chú tổng toàn đơn hàng            | [K03-B] Bong bóng nhắc nhở SĐT (Tự ẩn 3s)    |
|| [K02-C] Bộ đếm tổng m² & Tiền (Realtime)      | [K03-C] Lưới chọn nhanh sản phẩm (3 cột)     |
||-----------------------------------------------|----------------------------------------------|
|| [K02-D] Hàng đợi máy trạm (IN BẠT/DECAL/CNC)                 [K03-D] [THANH TOÁN] (Phím F9)  |
================================================================================================
```

**Nguyên tắc cốt lõi:** Đây là "bộ khung xương" cố định. Khi triển khai, chỉ cần dựng Layout (CSS Grid/Flexbox) chuẩn chỉnh trước, sau đó đổ ruột tính năng vào từng khối bên trong.

---

## II. VAI TRÒ VÀ THÀNH PHẦN CHI TIẾT TỪNG KHỐI

---

### K01 — THANH ĐIỀU HƯỚNG ĐỈNH & ĐA NHIỆM TABS (Top Bar)

- **Vị trí:** Trải dài 100% chiều ngang, cố định sát mép trên cùng của giao diện.
- **Vai trò:** Trung tâm điều phối đa nhiệm, quản lý luồng làm việc tổng quan của nhân viên thu ngân tại quầy.
- **Cấu tạo:** **Trái** — Ô tìm kiếm nhanh (`F3`); **Giữa** — Dải Tab đa hóa đơn; **Phải** — Lịch sử, Đèn Realtime, Hồ sơ nhân viên.

> 📄 **Tài liệu chi tiết logic:** [01-K01-TOPBAR.md](./K01/01-K01-TOPBAR.md)

---

### K02 — KHỐI GIỎ HÀNG & ĐIỀU PHỐI MÁY TRẠM (Bên Trái ~65%)

> **Vai trò:** Khu vực làm việc nặng nhất — tập trung toàn bộ logic tính toán quy cách ngành in và điều phối sản xuất dưới xưởng.

📄 **[Tổng quan K02 — Logic tiếp nhận sản phẩm](./K02/01-K02-GIO-HANG.md)**

| Khối con | File |
|---|---|
| K02-A + K02-C: Giỏ hàng động & Bộ đếm tổng | [02-K02A-DONG-SP.md](./K02/02-K02A-DONG-SP.md) |
| K02-B: Ghi chú đơn hàng tổng | [03-K02B-GHI-CHU.md](./K02/03-K02B-GHI-CHU.md) |
| K02-D: Hàng đợi máy trạm | [04-K02D-HANG-DOI.md](./K02/04-K02D-HANG-DOI.md) |

---

### K03 — KHỐI ĐỐI TÁC & CHỌN SẢN PHẨM NHANH (Bên Phải ~35%)

> **Vai trò:** Quản lý thông tin khách hàng, chọn nhanh dịch vụ phổ biến và kích hoạt chốt dòng tiền.

| Khối con | File |
|---|---|
| K03-A: Hồ sơ đối tác & Bộ lọc giá | [01-K03A-DOI-TAC.md](./K03/01-K03A-DOI-TAC.md) |
| K03-B: Bong bóng nhắc nhở SĐT (Toast) | [02-K03B-TOAST.md](./K03/02-K03B-TOAST.md) |
| K03-C: Lưới chọn nhanh sản phẩm (3 cột) | [03-K03C-LUOI-SP.md](./K03/03-K03C-LUOI-SP.md) |
| K03-D: Nút [IN] / [THANH TOÁN] | [04-K03D-THANH-TOAN.md](./K03/04-K03D-THANH-TOAN.md) |

---

## III. LUỒNG ĐI CỦA ĐƠN HÀNG (Đọc để hiểu hệ thống chạy thế nào)

> *Để hiểu cách các khối phối hợp với nhau, hãy xem quy trình xử lý một đơn hàng thực tế tại xưởng Văn Lâm.*

**Bước 1 — Tiếp nhận từ xưởng:**
Máy in bạt dưới xưởng chạy xong file, `K02-D` lập tức nhấp nháy báo có file mới. Thu ngân click vào file, hệ thống tự đẩy thông số m² lên giỏ hàng `K02-A`.

**Bước 2 — Định danh khách hàng:**
Thu ngân gõ tìm khách hàng ở `K03-A` (`F4`). Nếu khách thiếu SĐT, `K03-B` bắn bong bóng cam "⚠️ Bổ sung SĐT KH" — click nhập nhanh rồi `Enter`.

**Bước 3 — Gia công cấu trúc Combo:**
Đơn phức tạp cần biển bảng nhiều thành phần — thu ngân click dòng sản phẩm tại `K02-A` để bung form Combo, bóc nhanh mã Keo, Vít, Led từ bộ lọc Vật tư phụ.

**Bước 4 — Chốt đơn & Bắn Zalo:**
Thu ngân bấm `THANH TOÁN` (`F9`) tại `K03-D`. Hệ thống trừ kho, lưu quỹ, tự copy bill vào Clipboard. Thu ngân mở Zalo, `Ctrl + V` — khách nhận bill ngay.

---

## IV. DANH MỤC THAM CHIẾU FILE CHI TIẾT

| Khối | Tên gọi nghiệp vụ | File |
|---|---|---|
| K01 | Thanh đỉnh — Tạo tab đơn mới, phím tắt tìm kiếm (`F3`), tiện ích hệ thống | [01-K01-TOPBAR.md](./K01/01-K01-TOPBAR.md) |
| K02-A | Giỏ hàng động — Công thức tính m², form nhập ĐVT, giao diện Combo/BOM | [02-K02A-DONG-SP.md](./K02/02-K02A-DONG-SP.md) |
| K02-B | Ghi chú tổng toàn đơn hàng | [03-K02B-GHI-CHU.md](./K02/03-K02B-GHI-CHU.md) |
| K02-C | Bộ đếm tổng m² & tiền realtime | [02-K02A-DONG-SP.md](./K02/02-K02A-DONG-SP.md) |
| K02-D | Hàng đợi máy trạm — Xử lý gộp đơn / hủy lệnh từ xưởng | [04-K02D-HANG-DOI.md](./K02/04-K02D-HANG-DOI.md) |
| K03-A | Hồ sơ đối tác — Tìm/thêm KH (`F4`), áp bảng giá chiết khấu | [01-K03A-DOI-TAC.md](./K03/01-K03A-DOI-TAC.md) |
| K03-B | Bong bóng Toast — Pop-over nhập nhanh SĐT | [02-K03B-TOAST.md](./K03/02-K03B-TOAST.md) |
| K03-C | Lưới chọn nhanh sản phẩm (3 cột + phân trang) | [03-K03C-LUOI-SP.md](./K03/03-K03C-LUOI-SP.md) |
| K03-D | Nút chốt đơn — Logic trừ kho, sổ quỹ, cấu trúc text Zalo | [04-K03D-THANH-TOAN.md](./K03/04-K03D-THANH-TOAN.md) |

---

## V. QUY TẮC CẤU TRÚC CODE (ARCHITECTURE CODE RULES)

| Nội dung | Chi tiết |
|---|---|
| State Manager, Actions, cấu trúc thư mục | [→ ARCHITECTURE.md §1](../../05-BACKEND-MayChu/POS/ARCHITECTURE.md#1-kiến-trúc-state-manager-pos-store) |
| LocalStorage persistence (key, debounce, vòng đời) | [→ ARCHITECTURE.md §2](../../05-BACKEND-MayChu/POS/ARCHITECTURE.md#2-persistence--lưu-trữ-local-chống-sập-nguồn) |
| Khóa tranh chấp khi nhiều người cùng sửa đơn | [→ ARCHITECTURE.md §3](../../05-BACKEND-MayChu/POS/ARCHITECTURE.md#3-concurrency-lock--khóa-đơn-tranh-chấp) |
| Tab Overflow (scroll, không cần lưu scroll position) | [→ ARCHITECTURE.md §4](../../05-BACKEND-MayChu/POS/ARCHITECTURE.md#4-tab-overflow--xử-lý-tràn-dải-tab) |

> **Lưu ý:** Section V thuộc Giai đoạn 1 (UI Spec + Architecture Rule). Chi tiết Action bên trong Store sẽ được sinh code ở Giai đoạn 2.

---

## VI. CƠ CHẾ PHÂN QUYỀN (PERMISSION-BASED ACCESS CONTROL)

| Nội dung | Chi tiết |
|---|---|
| Mô hình Permission-based (không Role cứng) | [→ AUTH.md §1](../../05-BACKEND-MayChu/POS/AUTH.md#1-mô-hình) |
| Seed Permissions, đặc điểm kỹ thuật | [→ AUTH.md §3-4](../../05-BACKEND-MayChu/POS/AUTH.md#3-đặc-điểm-kỹ-thuật) |
| Ràng buộc triển khai UI | [→ AUTH.md §5](../../05-BACKEND-MayChu/POS/AUTH.md#5-ràng-buộc-triển-khai-ui) |

> Áp dụng cho toàn hệ thống QC-OMS: POS, Kho, Báo cáo, Back-office.

---

← [Quay về POS README](./README.md)

← [Quay về 02-PRD-UX-PhongCanh README](../README.md)
