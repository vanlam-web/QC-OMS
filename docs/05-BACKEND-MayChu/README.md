# PHẦN 5: MÁY CHỦ & API (BACKEND)

> 🔨 Đang xây dựng — Foundation đã chốt Giai đoạn 0; POS, Inventory, Finance, Purchase và Production Queue đã có một phần

---

## Nội dung đã có

| File | Mô tả | Trạng thái |
|------|--------|------------|
| [FOUNDATION-TECHNICAL-DESIGN.md](./FOUNDATION-TECHNICAL-DESIGN.md) | Kiến trúc FE–BE, source layout và security baseline | ✅ Chốt Giai đoạn 0 |
| [FOUNDATION-API.md](./FOUNDATION-API.md) | API Auth/Profile/Permission/Workstation | ✅ Chốt Giai đoạn 0 |
| `POS/ARCHITECTURE.md` | Kiến trúc State Manager, LocalStorage, Concurrency Lock | 🔨 Một phần |
| `POS/AUTH.md` | Permission-based Access Control | ✅ Nền tảng Giai đoạn 0 |
| `POS/TOAST-API.md` | API xử lý Toast SĐT (K03-B) | ✅ Hoàn tất |
| `Inventory/INVENTORY-API.md` | API tồn kho, cuộn/tấm/tấm lỡ, stock movement và kiểm kho | 🔨 Một phần |
| `Finance/FINANCE-API.md` | API tài khoản quỹ, công nợ, thu nợ, sổ quỹ, phiếu thu/chi và đối soát | 🔨 Một phần |
| `Purchase/PURCHASE-API.md` | API NCC, phiếu nhập, post nhập hàng và thanh toán NCC | 🔨 Một phần |
| `Production/PRODUCTION-RECONCILIATION-API.md` | API đối soát sản xuất / hàng đợi máy | 🔨 Một phần |
| `BOM/BOM-API.md` | API BOM/combo vật tư | 🔨 Draft |
| `BACKEND_CONVENTIONS.md` | Quy ước API, naming, validation, error handling | ✅ Hoàn tất |

---

## Nội dung dự kiến theo module

| Module | Mô tả | Trạng thái |
|--------|--------|------------|
| **POS** | Customer/Product/Pricing, Order/Quote/Checkout/Sửa hóa đơn và Toast API đã có một phần | 🔨 Một phần |
| **Inventory** | API tồn kho, cuộn/tấm/tấm lỡ, stock movement và kiểm kho đã có một phần | 🔨 Một phần |
| **Finance** | API công nợ, thu nợ, sổ quỹ, phiếu thu/chi và đối soát đã có một phần | 🔨 Một phần |
| **Purchase** | Supplier, purchase receipt draft/post, supplier payments, purchase roll/sheet objects | 🔨 Một phần |
| **Production Queue** | Hàng đợi máy sản xuất, claim/add-to-draft/dismiss/restore | 🔨 Một phần |

## Bằng chứng implement/test hiện có

- Routes/use-cases: `routes/purchase.ts`, `use-cases/purchase.ts`, `routes/production-queue.ts`, `use-cases/production-queue.ts`.
- Function tests: `purchase_receipts_test.ts`, `suppliers_test.ts`, `production_queue_test.ts`.

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
