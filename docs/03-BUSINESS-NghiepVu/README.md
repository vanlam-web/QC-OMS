# PHẦN 3: NGHIỆP VỤ (BUSINESS)

> **Source of Truth** cho toàn bộ nghiệp vụ của QC-OMS.

---

## Mục đích

Folder này trả lời các câu hỏi:

- Nghiệp vụ hoạt động như thế nào?
- Điều kiện áp dụng là gì?
- Quy trình xử lý ra sao?
- Công thức tính như thế nào?
- Khi nào được phép hoặc không được phép thực hiện?

---

## Phạm vi tầng

| Phân loại | Nội dung |
|-----------|----------|
| **CHỈ GHI** | Business Rule · Business Workflow · Quy trình nghiệp vụ · State Machine · Điều kiện và điều kiện biên · Công thức tính toán · Domain Event (ngữ nghĩa) · Chính sách nghiệp vụ · Acceptance Criteria nghiệp vụ |
| **THAM CHIẾU** | Feature · UI · Database · API · Workflow kỹ thuật · Integration — chỉ để giải thích nghiệp vụ |
| **KHÔNG GHI** | UI/Wireframe · Database Schema · SQL · API Specification · Backend Workflow · Code · Hạ tầng triển khai |

---

## Thứ tự phát triển

Theo nguyên tắc top-down, **03-BUSINESS chỉ được thiết kế khi**:

1. ✅ 01-VISION đã có Vision & Scope
2. ✅ 02-PRD-UX đã có Feature Specification

> Khi Business thay đổi → cập nhật 03-BUSINESS trước → rồi 02-PRD-UX → rồi 04-DATABASE → rồi 05-BACKEND.

---

## Nội dung đã có

| Domain | File | Mô tả | Trạng thái |
|--------|------|--------|------------|
| **Sales** | `Sales/POS-CUSTOMER.md` | Quy tắc khách hàng POS: SĐT, mã khách, tên khách và nhóm khách | 🔨 Đang xây dựng |
| **Sales** | `Sales/POS-PRICING.md` | Quy tắc giá bán POS: bảng giá, giá sửa tay, lịch sử giá và đơn vị bán | 🔨 Đang xây dựng |
| **Sales** | `Sales/POS-ORDER-CALC.md` | Quy tắc tính giỏ hàng (ĐVT m² / Cái / Combo) | ✅ Hoàn tất |
| **Sales** | `Sales/POS-ORDER-LIFECYCLE.md` | Vòng đời đơn hàng POS: nháp, báo giá, hóa đơn bán hàng | 🔨 Đang xây dựng |
| **Sales** | `Sales/POS-CHECKOUT.md` | Nghiệp vụ thanh toán (trừ kho, sổ quỹ, tiền thừa/nợ) | ✅ Hoàn tất |
| **Sales** | `Sales/POS-CUSTOMER-DEBT.md` | Nghiệp vụ công nợ khách hàng | 🔨 Đang xây dựng |
| **Finance** | `Finance/CASHBOOK.md` | Nghiệp vụ sổ quỹ, phiếu thu, phiếu chi và đối soát | 🔨 Đang xây dựng |

---

## Nội dung dự kiến

| Domain | Mô tả | Trạng thái |
|--------|--------|------------|
| **Inventory** | Nhập/xuất kho vật tư, tồn kho | ⬜ Chưa có |
| **Workstation** | Máy trạm, queue xưởng, điều phối | ⬜ Chưa có |

---

## Cấu trúc chuẩn một Business Rule

Mỗi Business Rule nên có:

1. ID
2. Mục đích
3. Mô tả
4. Điều kiện áp dụng
5. Quy trình xử lý
6. Ngoại lệ
7. Acceptance Criteria

---

← [ Quay về README chính](../README.md)
