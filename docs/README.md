# TÀI LIỆU DỰ ÁN — QC-OMS

> **Xưởng Văn Lâm** — Hệ thống Quản lý Sản xuất & Bán hàng
>
> **Điểm vào:** [00-OVERVIEW-TongQuan/README.md](./00-OVERVIEW-TongQuan/README.md)

---

## 📌 Chú thích trạng thái

| Ký hiệu | Ý nghĩa |
|---|---|
| ✅ | Đã chốt — hoàn tất, không thay đổi trừ khi có lý do lớn |
| 🔨 | Đang xây dựng — có nội dung, cần hoàn thiện |
| ⬜ | Chưa bắt đầu — folder trống hoặc chỉ có _RULES.md |
| ⚠️ | Cảnh báo — có issue đã ghi nhận trong AUDIT_REPORT.md + AUDIT-V2.md |

---

## 📂 Mục lục toàn bộ tài liệu

### Tầng 0 — Điểm vào

| File | Mô tả | Trạng thái |
|---|---|---|
| [00-OVERVIEW-TongQuan/README.md](./00-OVERVIEW-TongQuan/README.md) | Tổng quan toàn bộ hệ thống tài liệu | ✅ |
| [DOCUMENT_RULES.md](./DOCUMENT_RULES.md) | Quy tắc quản lý tài liệu (nguồn gốc) | ✅ |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Kiến trúc 8 tầng — Source of Truth | ✅ |
| [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md) | Roadmap phát triển FE + BE theo từng giai đoạn | ✅ |
| [AUDIT_REPORT.md](./AUDIT_REPORT.md) | Báo cáo audit tuân thủ — 2026-06-26 | ✅ |
| [AUDIT-V2.md](./AUDIT-V2.md) | Đối chiếu audit & checklist patch — 2026-06-27 | ✅ |

---

### Tầng 1 — Tầm nhìn

| File | Mô tả | Trạng thái |
|---|---|---|
| [01-VISION-TamNhin/README.md](./01-VISION-TamNhin/README.md) | Mục lục tầm nhìn | ✅ |
| [01-VISION-TamNhin/01-VISION.md](./01-VISION-TamNhin/01-VISION.md) | Vision, Mission, Giá trị cốt lõi | ✅ |
| [01-VISION-TamNhin/02-TARGET-STATE-QC-OMS.md](./01-VISION-TamNhin/02-TARGET-STATE-QC-OMS.md) | Dich den cuoi cung: QC-OMS la he thong duy nhat thay QuanLyXuong cu | ✅ |
| [01-VISION-TamNhin/_RULES.md](./01-VISION-TamNhin/_RULES.md) | Quy tắc layer 01 | ✅ |

---

### Tầng 2 — Đặc tả Tính năng & UX

| File | Mô tả | Trạng thái |
|---|---|---|
| [02-PRD-UX-PhongCanh/README.md](./02-PRD-UX-PhongCanh/README.md) | Mục lục PRD-UX | ✅ |
| [02-PRD-UX-PhongCanh/_RULES.md](./02-PRD-UX-PhongCanh/_RULES.md) | Quy tắc layer 02 | ✅ |

#### Trang POS — Màn hình Bán hàng

| File | Mô tả | Trạng thái |
|---|---|---|
| [02-PRD-UX-PhongCanh/POS/README.md](./02-PRD-UX-PhongCanh/POS/README.md) | Mục lục POS | ✅ |
| [02-PRD-UX-PhongCanh/POS/01-POS-LAYOUT.md](./02-PRD-UX-PhongCanh/POS/01-POS-LAYOUT.md) | Bản đồ tổng thể màn hình POS | ✅ |

#### K01 — Thanh đỉnh (Top Bar)

| File | Mô tả | Trạng thái |
|---|---|---|
| [POS/K01/01-K01-TOPBAR.md](./02-PRD-UX-PhongCanh/POS/K01/01-K01-TOPBAR.md) | Tổng quan K01 | 🔨 |
| [POS/K01/01a-K01-SEARCH-TABS.md](./02-PRD-UX-PhongCanh/POS/K01/01a-K01-SEARCH-TABS.md) | Tìm kiếm F3 & Đa Tab | 🔨 |
| [POS/K01/01b-K01-PROFILE-SHORTCUTS.md](./02-PRD-UX-PhongCanh/POS/K01/01b-K01-PROFILE-SHORTCUTS.md) | Hồ sơ & Phím tắt | ⚠️ |
| [POS/K01/01c-K01-ARCH-SAFETY.md](./02-PRD-UX-PhongCanh/POS/K01/01c-K01-ARCH-SAFETY.md) | Kiến trúc & An toàn dữ liệu | ⚠️ |

#### K02 — Giỏ hàng & Máy trạm (Bên trái ~65%)

| File | Mô tả | Trạng thái |
|---|---|---|
| [POS/K02/01-K02-GIO-HANG.md](./02-PRD-UX-PhongCanh/POS/K02/01-K02-GIO-HANG.md) | Tổng quan K02 | ⚠️ |
| [POS/K02/02-K02A-DONG-SP.md](./02-PRD-UX-PhongCanh/POS/K02/02-K02A-DONG-SP.md) | Dòng SP động (m²/Cái/Combo) + Bộ đếm tổng | ⚠️ |
| [POS/K02/03-K02B-GHI-CHU.md](./02-PRD-UX-PhongCanh/POS/K02/03-K02B-GHI-CHU.md) | Ghi chú đơn hàng tổng | 🔨 |
| [POS/K02/04-K02D-HANG-DOI.md](./02-PRD-UX-PhongCanh/POS/K02/04-K02D-HANG-DOI.md) | Hàng đợi máy trạm | 🔨 |

#### K03 — Đối tác & Sản phẩm (Bên phải ~35%)

| File | Mô tả | Trạng thái |
|---|---|---|
| [POS/K03/01-K03A-DOI-TAC.md](./02-PRD-UX-PhongCanh/POS/K03/01-K03A-DOI-TAC.md) | Hồ sơ đối tác & Bộ lọc giá | ⚠️ |
| [POS/K03/02-K03B-TOAST.md](./02-PRD-UX-PhongCanh/POS/K03/02-K03B-TOAST.md) | Bong bóng thông báo Toast SĐT | ⚠️ |
| [POS/K03/03-K03C-LUOI-SP.md](./02-PRD-UX-PhongCanh/POS/K03/03-K03C-LUOI-SP.md) | Lưới sản phẩm nhanh | 🔨 |
| [POS/K03/04-K03D-THANH-TOAN.md](./02-PRD-UX-PhongCanh/POS/K03/04-K03D-THANH-TOAN.md) | Nút chốt đơn IN / THANH TOÁN | ⚠️ |

> ⚠️ **File có cảnh báo audit** — nội dung có phần ghi sai tầng. Xem chi tiết tại [AUDIT_REPORT.md](./AUDIT_REPORT.md) + [AUDIT-V2.md](./AUDIT-V2.md).

---

### Tầng 3 — Nghiệp vụ

| File | Mô tả | Trạng thái |
|---|---|---|
| [03-BUSINESS-NghiepVu/_RULES.md](./03-BUSINESS-NghiepVu/_RULES.md) | Quy tắc layer 03 | ✅ |
| [03-BUSINESS-NghiepVu/Sales/README.md](./03-BUSINESS-NghiepVu/Sales/README.md) | Mục lục nghiệp vụ Sales | 🔨 |
| [03-BUSINESS-NghiepVu/Sales/POS-CUSTOMER.md](./03-BUSINESS-NghiepVu/Sales/POS-CUSTOMER.md) | Nghiệp vụ khách hàng POS | 🔨 |
| [03-BUSINESS-NghiepVu/Sales/POS-PRICING.md](./03-BUSINESS-NghiepVu/Sales/POS-PRICING.md) | Nghiệp vụ giá bán POS | 🔨 |
| [03-BUSINESS-NghiepVu/Sales/POS-ORDER-CALC.md](./03-BUSINESS-NghiepVu/Sales/POS-ORDER-CALC.md) | Nghiệp vụ tính tiền đơn POS | 🔨 |
| [03-BUSINESS-NghiepVu/Sales/POS-ORDER-LIFECYCLE.md](./03-BUSINESS-NghiepVu/Sales/POS-ORDER-LIFECYCLE.md) | Nghiệp vụ vòng đời đơn POS | 🔨 |
| [03-BUSINESS-NghiepVu/Sales/POS-CHECKOUT.md](./03-BUSINESS-NghiepVu/Sales/POS-CHECKOUT.md) | Nghiệp vụ chốt đơn POS | 🔨 |
| [03-BUSINESS-NghiepVu/Sales/POS-CUSTOMER-DEBT.md](./03-BUSINESS-NghiepVu/Sales/POS-CUSTOMER-DEBT.md) | Nghiệp vụ công nợ khách hàng | 🔨 |
| [03-BUSINESS-NghiepVu/Finance/README.md](./03-BUSINESS-NghiepVu/Finance/README.md) | Mục lục nghiệp vụ Finance | 🔨 |
| [03-BUSINESS-NghiepVu/Finance/CASHBOOK.md](./03-BUSINESS-NghiepVu/Finance/CASHBOOK.md) | Nghiệp vụ sổ quỹ, phiếu thu/chi và đối soát | 🔨 |
| [03-BUSINESS-NghiepVu/Inventory/README.md](./03-BUSINESS-NghiepVu/Inventory/README.md) | Mục lục nghiệp vụ Inventory | 🔨 |
| [03-BUSINESS-NghiepVu/Inventory/STOCK-RULES.md](./03-BUSINESS-NghiepVu/Inventory/STOCK-RULES.md) | Chính sách tồn kho, trừ kho, tồn âm, cuộn/tấm/tấm lỡ | 🔨 |
| [03-BUSINESS-NghiepVu/Inventory/UNIT-CONVERSION.md](./03-BUSINESS-NghiepVu/Inventory/UNIT-CONVERSION.md) | Đơn vị tồn chính, đơn vị bán phụ và quy đổi | 🔨 |
| [03-BUSINESS-NghiepVu/Inventory/STOCKTAKE.md](./03-BUSINESS-NghiepVu/Inventory/STOCKTAKE.md) | Phiếu kiểm kho, cân bằng kho và phiếu tự động khi sửa tồn | 🔨 |
| [03-BUSINESS-NghiepVu/Inventory/PRODUCTION-RECONCILIATION.md](./03-BUSINESS-NghiepVu/Inventory/PRODUCTION-RECONCILIATION.md) | Đối soát OMS/bill với dữ liệu máy sản xuất | 🔨 |

---

### Tầng 4 — Cơ sở dữ liệu

| File | Mô tả | Trạng thái |
|---|---|---|
| [04-DATABASE/README.md](./04-DATABASE/README.md) | Mục lục Database | ✅ |
| [04-DATABASE/_RULES.md](./04-DATABASE/_RULES.md) | Quy tắc layer 04 | ✅ |
| [04-DATABASE/01-ERD.md](./04-DATABASE/01-ERD.md) | ERD theo giai đoạn; Foundation/System đã chốt | 🔨 |
| [04-DATABASE/03-RLS.md](./04-DATABASE/03-RLS.md) | RLS Foundation/System | ✅ |
| [04-DATABASE/System/AUTH-PERMISSIONS.md](./04-DATABASE/System/AUTH-PERMISSIONS.md) | Schema Auth, Profile, Workstation và Permission | ✅ |
| [04-DATABASE/Sales/README.md](./04-DATABASE/Sales/README.md) | Mục lục Schema Sales | 🔨 |
| [04-DATABASE/Sales/POS-TABLES.md](./04-DATABASE/Sales/POS-TABLES.md) | Schema POS: khách hàng, bảng giá, sản phẩm, báo giá và snapshot dòng hàng | 🔨 |
| [04-DATABASE/Inventory/README.md](./04-DATABASE/Inventory/README.md) | Mục lục Schema Inventory | 🔨 |
| [04-DATABASE/Inventory/INVENTORY-TABLES.md](./04-DATABASE/Inventory/INVENTORY-TABLES.md) | Schema Inventory: đơn vị, cấu hình tồn kho, stock movement, cuộn, tấm và kiểm kho | 🔨 |

---

### Tầng 5 — Máy chủ & API

| File | Mô tả | Trạng thái |
|---|---|---|
| [05-BACKEND-MayChu/README.md](./05-BACKEND-MayChu/README.md) | Mục lục Backend | ✅ |
| [05-BACKEND-MayChu/_RULES.md](./05-BACKEND-MayChu/_RULES.md) | Quy tắc layer 05 | ✅ |
| [05-BACKEND-MayChu/BACKEND_CONVENTIONS.md](./05-BACKEND-MayChu/BACKEND_CONVENTIONS.md) | Quy ước phát triển Backend | ✅ |
| [05-BACKEND-MayChu/FOUNDATION-TECHNICAL-DESIGN.md](./05-BACKEND-MayChu/FOUNDATION-TECHNICAL-DESIGN.md) | Kiến trúc FE–BE và source layout nền tảng | ✅ |
| [05-BACKEND-MayChu/FOUNDATION-API.md](./05-BACKEND-MayChu/FOUNDATION-API.md) | API Auth, Profile, Permission và Workstation | ✅ |
| [05-BACKEND-MayChu/POS/README.md](./05-BACKEND-MayChu/POS/README.md) | Mục lục Backend POS | 🔨 |
| [05-BACKEND-MayChu/POS/ARCHITECTURE.md](./05-BACKEND-MayChu/POS/ARCHITECTURE.md) | Kiến trúc Backend POS | 🔨 |
| [05-BACKEND-MayChu/POS/AUTH.md](./05-BACKEND-MayChu/POS/AUTH.md) | Phân quyền POS | ✅ |
| [05-BACKEND-MayChu/POS/CUSTOMER-PRODUCT-PRICING-API.md](./05-BACKEND-MayChu/POS/CUSTOMER-PRODUCT-PRICING-API.md) | API Customer, Product và Pricing POS | 🔨 |
| [05-BACKEND-MayChu/POS/ORDER-API.md](./05-BACKEND-MayChu/POS/ORDER-API.md) | API báo giá và vòng đời đơn POS | 🔨 |
| [05-BACKEND-MayChu/POS/TOAST-API.md](./05-BACKEND-MayChu/POS/TOAST-API.md) | API Toast POS | 🔨 |

---

### Tầng 6 — Tích hợp bên ngoài

| File | Mô tả | Trạng thái |
|---|---|---|
| [06-INTEGRATION-KetHop/README.md](./06-INTEGRATION-KetHop/README.md) | Mục lục Integration | ✅ |
| [06-INTEGRATION-KetHop/_RULES.md](./06-INTEGRATION-KetHop/_RULES.md) | Quy tắc layer 06 | ✅ |
| [06-INTEGRATION-KetHop/INTEGRATION_CONVENTIONS.md](./06-INTEGRATION-KetHop/INTEGRATION_CONVENTIONS.md) | Quy ước phát triển Integration | ✅ |
| [06-INTEGRATION-KetHop/Legacy-QuanLyXuong/README.md](./06-INTEGRATION-KetHop/Legacy-QuanLyXuong/README.md) | Ngu canh he QuanLyXuong cu de QC-OMS hoc luong va di tru | 🔨 |
| `06-INTEGRATION-KetHop/*/` | **Chưa có Integration cụ thể** — đang chờ 05-BACKEND | ⬜ |

---

### Tầng 7 — Triển khai

| File | Mô tả | Trạng thái |
|---|---|---|
| [07-DEPLOYMENT-TrienKhai/README.md](./07-DEPLOYMENT-TrienKhai/README.md) | Mục lục Deployment | ✅ |
| [07-DEPLOYMENT-TrienKhai/_RULES.md](./07-DEPLOYMENT-TrienKhai/_RULES.md) | Quy tắc layer 07 | ✅ |
| [07-DEPLOYMENT-TrienKhai/DEPLOYMENT_CONVENTIONS.md](./07-DEPLOYMENT-TrienKhai/DEPLOYMENT_CONVENTIONS.md) | Quy ước triển khai & vận hành | ✅ |
| [07-DEPLOYMENT-TrienKhai/ENVIRONMENTS-CI.md](./07-DEPLOYMENT-TrienKhai/ENVIRONMENTS-CI.md) | Local, staging và CI/CD baseline | ✅ |
| `07-DEPLOYMENT-TrienKhai/*/` | Chưa có deployment riêng cho từng domain | ⬜ |

---

## 🔄 Thứ tự phát triển

```
Vision ✅ → PRD-UX 🔨 → Business 🔨 → Database 🔨 → Backend 🔨 → Integration ⬜ → Deployment 🔨 (baseline)
```

Mỗi tầng phải **chờ tầng trên hoàn thiện** trước khi bắt đầu chi tiết.

Xem chi tiết: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 📊 Tổng kết trạng thái

| Tầng | Thư mục | Trạng thái |
|---|---|---|
| 0 — Điểm vào | `00-OVERVIEW-TongQuan/` | ✅ |
| 1 — Tầm nhìn | `01-VISION-TamNhin/` | ✅ |
| 2 — Tính năng & UX | `02-PRD-UX-PhongCanh/` | 🔨 |
| 3 — Nghiệp vụ | `03-BUSINESS-NghiepVu/` | 🔨 |
| 4 — Cơ sở dữ liệu | `04-DATABASE/` | 🔨 |
| 5 — Máy chủ & API | `05-BACKEND-MayChu/` | 🔨 |
| 6 — Tích hợp | `06-INTEGRATION-KetHop/` | ⬜ |
| 7 — Triển khai | `07-DEPLOYMENT-TrienKhai/` | 🔨 Baseline Giai đoạn 0 |

---

*Cập nhật: 2026-06-28 — Chốt roadmap và thiết kế kỹ thuật Giai đoạn 0*
