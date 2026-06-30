# ERD — Sơ đồ quan hệ dữ liệu QC-OMS

> **Trạng thái:** 🔨 Phát triển theo giai đoạn
> **Đã chốt:** Foundation/System — Giai đoạn 0
> **Chưa chốt:** Checkout/Finance/Workstation

---

## 1. FOUNDATION / SYSTEM

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "has"
    ORGANIZATIONS ||--o{ PROFILES : "contains"
    ORGANIZATIONS ||--o{ WORKSTATIONS : "owns"
    PROFILES ||--o{ USER_PERMISSIONS : "receives"
    PERMISSIONS ||--o{ USER_PERMISSIONS : "grants"
    PROFILES ||--o{ USER_PERMISSIONS : "granted_by"
    ORGANIZATIONS ||--o{ PERMISSION_AUDIT_LOGS : "owns"
    PROFILES ||--o{ PERMISSION_AUDIT_LOGS : "actor"
    PROFILES ||--o{ PERMISSION_AUDIT_LOGS : "target"
```

Chi tiết cột, constraint và index: [System/AUTH-PERMISSIONS.md](./System/AUTH-PERMISSIONS.md).

---

## 2. SALES

Hiện có đặc tả một phần tại [Sales/POS-TABLES.md](./Sales/POS-TABLES.md), gồm Customer, Product, Pricing, báo giá và snapshot dòng hàng. Checkout, payment, cashbook, debt allocation và stock movement sẽ được chốt trước Giai đoạn 4.

---

## 3. INVENTORY

Hiện có đặc tả một phần tại [Inventory/INVENTORY-TABLES.md](./Inventory/INVENTORY-TABLES.md), gồm đơn vị tồn, cấu hình tồn kho sản phẩm, quy đổi đơn vị, cuộn vật lý, tấm/tấm lỡ, stock movement và phiếu kiểm kho.

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ INVENTORY_UNITS : owns
    PRODUCTS ||--|| PRODUCT_INVENTORY_SETTINGS : configures
    INVENTORY_UNITS ||--o{ PRODUCT_INVENTORY_SETTINGS : stock_unit
    PRODUCTS ||--o{ PRODUCT_UNIT_CONVERSIONS : converts
    PRODUCTS ||--o{ INVENTORY_ROLLS : has
    PRODUCTS ||--o{ INVENTORY_SHEETS : has
    PRODUCTS ||--o{ STOCK_MOVEMENTS : moves
    INVENTORY_ROLLS ||--o{ STOCK_MOVEMENTS : roll_movement
    INVENTORY_SHEETS ||--o{ STOCK_MOVEMENTS : sheet_movement
    STOCKTAKES ||--o{ STOCKTAKE_ITEMS : contains
    STOCKTAKES ||--o{ STOCK_MOVEMENTS : balances
    STOCKTAKE_ITEMS ||--o{ STOCK_MOVEMENTS : adjusts
```

---

## 4. FINANCE

Chưa chốt. Chỉ bổ sung vào ERD sau khi Business Rule tương ứng hoàn thiện và trước Giai đoạn 4.

---

## 5. WORKSTATION QUEUE

Chưa chốt. `workstations` nền tảng đã có; event/queue/history sẽ được thiết kế trước Giai đoạn 6 sau khi hợp đồng tích hợp máy sản xuất được xác nhận.

---

## 6. QUY TẮC CẬP NHẬT

- Mỗi thay đổi quan hệ phải cập nhật file schema domain trước hoặc trong cùng patch.
- ERD chỉ hiển thị quan hệ đã chốt, không dùng bảng dự kiến làm Source of Truth.
- Migration thực tế phải khớp với schema domain và ERD tại thời điểm triển khai.
