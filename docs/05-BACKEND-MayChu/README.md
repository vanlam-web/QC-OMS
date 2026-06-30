# PHẦN 5: MÁY CHỦ & API (BACKEND)

> 🔨 Đang xây dựng — POS module mới có một phần, các module khác dự kiến

---

## Nội dung đã có

| File | Mô tả | Trạng thái |
|------|--------|------------|
| `POS/ARCHITECTURE.md` | Kiến trúc State Manager, LocalStorage, Concurrency Lock | 🔨 Một phần |
| `POS/AUTH.md` | Permission-based Access Control | 🔨 Một phần |
| `POS/TOAST-API.md` | API xử lý Toast SĐT (K03-B) | ✅ Hoàn tất |
| `BACKEND_CONVENTIONS.md` | Quy ước API, naming, validation, error handling | ✅ Hoàn tất |

---

## Nội dung dự kiến theo module

| Module | Mô tả | Trạng thái |
|--------|--------|------------|
| **POS** | Customer/Product/Pricing, Order/Quote và Toast API đã có; Checkout chưa đặc tả API riêng | 🔨 Một phần |
| **Inventory** | Nhập/xuất kho, tồn kho | ⬜ Chưa có |
| **Finance** | Sổ quỹ, phiếu thu/chi | ⬜ Chưa có |
| **Workstation** | Máy trạm, queue | ⬜ Chưa có |

---

## Mục đích

Đây là **Source of Truth** cho cách hệ thống thực thi nghiệp vụ. Trả lời các câu hỏi:

- API cung cấp những gì?
- Validation thực hiện ở đâu?
- Workflow thực thi ra sao?
- Hệ thống kiểm tra quyền như thế nào?

---

## Trách nhiệm tầng

| Đặc tả | Chi tiết |
|---|---|
| **CHỈ GHI** | API Specification · Use Case · Workflow · Validation · Auth · Permission · Error Handling · Request/Response Model |
| **THAM CHIẾU** | Business Rule (03) · Database (04) · Feature (02) · Integration (06) — không đặc tả lại |
| **KHÔNG GHI** | Vision · Feature đầy đủ · UI/Wireframe · Business Rule đầy đủ · Database Schema · Frontend Code · Hạ tầng |

---

## Cấu trúc chuẩn mỗi file

Mỗi tài liệu Backend nên có 8 phần (không bắt buộc nếu Use Case đơn giản):

```
1. Mục đích
2. Input
3. Validation
4. Workflow
5. Permission
6. Output
7. Error Handling
8. Business Rule liên quan  ← chỉ tham chiếu, không đặc tả lại
```

---

## Thứ tự phát triển

Theo nguyên tắc top-down, **05-BACKEND chỉ được thiết kế khi**:

1. ✅ 03-BUSINESS đã có Business Rule rõ ràng
2. ✅ 04-DATABASE đã có Schema
3. ✅ 02-PRD-UX đã có Feature Specification

> Khi Business thay đổi → cập nhật 03-BUSINESS trước → rồi 04-DATABASE → rồi 05-BACKEND.
> Không thiết kế Backend trước Business.

---

← [ Quay về 00-OVERVIEW-TongQuan](../00-OVERVIEW-TongQuan/README.md)
