# 00-OVERVIEW — TỔNG QUAN DỰ ÁN QC-OMS

> ✅ Chốt — 2026-06-26

---

## 1. GIỚI THIỆU

**QC-OMS** là hệ thống quản lý vận hành nội bộ (OMS) chuyên biệt cho **Xưởng Quảng Cáo Văn Lâm**.

- **Hiện tại:** Quản lý đơn hàng in ấn — đồng bộ Realtime từ máy trạm sản xuất đến quầy thu ngân.
- **Tương lai:** Đóng gói thành giải pháp SaaS độc lập để bán cho các xưởng quảng cáo khác.

### Bộ máy sử dụng

| Vai trò | Quyền hạn cốt lõi |
|---|---|
| 👑 **Chủ xưởng** | Toàn quyền, xem báo cáo tài chính |
| 💰 **Thu ngân** | POS, tạo đơn, chốt bill, gộp đơn |
| 🔧 **Thợ máy** | Vận hành máy in/CNC, cập nhật trạng thái sản xuất |

---

## 2. SƠ ĐỒ TỔNG QUAN (HIGH-LEVEL MAP)

### 2.1. Thứ tự phát triển bắt buộc

Mọi tài liệu phải phát triển theo thứ tự từ trên xuống. Tầng dưới chỉ được thiết kế khi tầng trên đã thống nhất.

```
VISION ─────────────────────────────────────────────────────────────────────────
│                                                                               │
01-VISION ──────────── PRD ───────────── BUSINESS ────────── DATABASE ────────
│                         │                   │                │                │
02-PRD-UX ──────────── 03-BUSINESS ──── 04-DATABASE ─── 05-BACKEND ─────────
│                                            │                │                │
06-INTEGRATION ─────────────────────────── 07-DEPLOYMENT ───────────────────
```

### 2.2. Trạng thái hiện tại từng tầng

| # | Tầng | Thư mục | Trạng thái | Ai đọc |
|---|---|---|---|---|
| 0 | Tổng quan | `00-OVERVIEW-TongQuan/` | ✅ Chốt | Mọi người — điểm vào |
| 1 | Tầm nhìn | `01-VISION-TamNhin/` | ✅ Chốt | Chủ xưởng, người mới |
| 2 | Tính năng & UX | `02-PRD-UX-PhongCanh/` | 🔨 Đang làm | Thiết kế UX |
| 3 | Nghiệp vụ | `03-BUSINESS-NghiepVu/` | ⬜ Chưa | Dev, người viết logic |
| 4 | Cơ sở dữ liệu | `04-DATABASE/` | ⬜ Chưa | DBA, backend dev |
| 5 | Máy chủ & API | `05-BACKEND-MayChu/` | ⬜ Chưa | Backend dev |
| 6 | Tích hợp bên ngoài | `06-INTEGRATION-KetHop/` | ⬜ Chưa | Dev, người kết nối |
| 7 | Triển khai | `07-DEPLOYMENT-TrienKhai/` | ⬜ Chưa | DevOps, sysadmin |

### 2.3. Ai nên đọc tài liệu nào

| Vai trò | Đọc theo thứ tự |
|---|---|
| 👑 **Chủ xưởng** muốn hiểu sản phẩm | 00 → 01 |
| 💰 **Thu ngân** muốn hiểu POS | 00 → 01 → 02 (POS) |
| 🔧 **Thợ máy** muốn hiểu luồng đơn | 00 → 01 |
| 🎨 **UX Designer** | 00 → 01 → 02 |
| 💻 **Frontend Dev** | 00 → 01 → 02 → 05 |
| 💻 **Backend Dev** | 00 → 01 → 02 → 03 → 04 → 05 → 06 |
| 🏗️ **DevOps / Sysadmin** | 00 → 01 → 07 |

---

## 3. CẤU TRÚC TÀI LIỆU

### 3.1. Danh sách đầy đủ

| Phần | Thư mục | Mục đích | Trạng thái |
|---|---|---|---|
| 0 | [00-OVERVIEW-TongQuan](./README.md) | Điểm vào — sơ đồ, mục lục, ai đọc gì | ✅ Chốt |
| 1 | [01-VISION-TamNhin](../01-VISION-TamNhin/README.md) | Tầm nhìn, mục tiêu chiến lược, bộ máy | ✅ Chốt |
| 2 | [02-PRD-UX-PhongCanh](../02-PRD-UX-PhongCanh/README.md) | Đặc tả tính năng & giao diện POS | 🔨 Đang làm |
| 3 | [03-BUSINESS-NghiepVu](../03-BUSINESS-NghiepVu/_RULES.md) | Quy tắc nghiệp vụ cốt lõi | ⬜ Chưa |
| 4 | [04-DATABASE](../04-DATABASE/README.md) | Sơ đồ quan hệ, định nghĩa bảng | ⬜ Chưa |
| 5 | [05-BACKEND-MayChu](../05-BACKEND-MayChu/README.md) | API, xác thực, quyền | ⬜ Chưa |
| 6 | [06-INTEGRATION-KetHop](../06-INTEGRATION-KetHop/_RULES.md) | Tích hợp máy in, Zalo, QR | ⬜ Chưa |
| 7 | [07-DEPLOYMENT-TrienKhai](../07-DEPLOYMENT-TrienKhai/_RULES.md) | Triển khai, CI/CD, monitoring | ⬜ Chưa |

### 3.2. Kiến trúc kỹ thuật hiện tại

| Lớp | Công nghệ |
|---|---|
| Frontend | React + TypeScript + Vite |
| UI | Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Deploy | Vercel |

---

## 4. NHỮNG ĐIỀU CẦN BIẾT TRƯỚC KHI ĐỌC

### Quy tắc quản lý tài liệu

Mọi AI làm việc trên dự án này đều tuân theo [DOCUMENT_RULES.md](../DOCUMENT_RULES.md) ở thư mục gốc. Nguyên tắc quan trọng nhất:

- **Mỗi thông tin chỉ có một nơi gốc** — không copy nội dung.
- **Mỗi tầng chỉ chứa đúng trách nhiệm của tầng đó** — không ghi code trong PRD, không ghi nghiệp vụ trong UI.
- **Không ghi sai tầng** — Business vào Database, API vào Business, UI vào Database đều bị cấm.

### Báo cáo tuân thủ

Dự án đã được audit ngày 2026-06-26. Một số file trong tầng 02 (PRD-UX) hiện chứa nội dung thuộc tầng khác — đã được đánh dấu cảnh báo. Xem: [AUDIT_REPORT.md](../AUDIT_REPORT.md).

---

← [ Quay về docs/README.md](../README.md)

*Điểm vào duy nhất — Xưởng Văn Lâm — QC-OMS*
