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

Hiện có đặc tả một phần tại [Sales/POS-TABLES.md](./Sales/POS-TABLES.md), gồm Customer, Product, Pricing, báo giá, hóa đơn, sửa chứng từ và snapshot dòng hàng. Payment, cashbook và debt allocation chi tiết sẽ được chốt ở Finance.

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ CUSTOMERS : owns
    ORGANIZATIONS ||--o{ CUSTOMER_GROUPS : owns
    CUSTOMER_GROUPS ||--o{ CUSTOMERS : groups
    PRICE_LISTS ||--o{ CUSTOMER_GROUPS : default_for
    PRICE_LISTS ||--o{ PRICE_LIST_ITEMS : contains
    PRODUCTS ||--o{ PRICE_LIST_ITEMS : priced
    CUSTOMERS ||--o{ CUSTOMER_PRODUCT_PRICE_HISTORY : has
    PRODUCTS ||--o{ CUSTOMER_PRODUCT_PRICE_HISTORY : has
    CUSTOMERS ||--o{ ORDERS : buys
    PRICE_LISTS ||--o{ ORDERS : applied_to
    ORDERS ||--o{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : snapshot_of
    ORDERS ||--o{ ORDER_STATUS_HISTORY : changes
    ORDERS ||--o{ ORDERS : revises
    ORDERS ||--o{ ORDERS : converts_quote
```

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

Hiện có đặc tả một phần tại [Finance/PAYMENT-DEBT-TABLES.md](./Finance/PAYMENT-DEBT-TABLES.md) và [Finance/CASHBOOK-TABLES.md](./Finance/CASHBOOK-TABLES.md), gồm quỹ/tài khoản, phiếu thu, phương thức thu, công nợ theo hóa đơn, phân bổ tiền trả nợ, sổ quỹ và đối soát.

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ FINANCE_ACCOUNTS : owns
    FINANCE_ACCOUNTS ||--o{ PAYMENT_RECEIPT_METHODS : receives
    PAYMENT_RECEIPTS ||--o{ PAYMENT_RECEIPT_METHODS : splits
    CUSTOMERS ||--o{ PAYMENT_RECEIPTS : pays
    ORDERS ||--o{ PAYMENT_RECEIPTS : paid_by
    CUSTOMERS ||--o{ CUSTOMER_DEBT_ENTRIES : has
    ORDERS ||--o{ CUSTOMER_DEBT_ENTRIES : debt_for
    PAYMENT_RECEIPTS ||--o{ CUSTOMER_DEBT_ALLOCATIONS : allocates
    CUSTOMER_DEBT_ALLOCATIONS ||--o{ CUSTOMER_DEBT_ENTRIES : creates
    ORDERS ||--o{ CUSTOMER_DEBT_ALLOCATIONS : receives_payment
    FINANCE_ACCOUNTS ||--o{ CASHBOOK_VOUCHERS : account
    FINANCE_ACCOUNTS ||--o{ CASHBOOK_ENTRIES : ledger
    PAYMENT_RECEIPT_METHODS ||--o| CASHBOOK_ENTRIES : posts
    CASHBOOK_VOUCHERS ||--o| CASHBOOK_ENTRIES : posts
    CASH_RECONCILIATIONS ||--o{ CASH_RECONCILIATION_ITEMS : contains
    FINANCE_ACCOUNTS ||--o{ CASH_RECONCILIATION_ITEMS : reconciled
```

---

## 5. WORKSTATION QUEUE

Chưa chốt. `workstations` nền tảng đã có; event/queue/history sẽ được thiết kế trước Giai đoạn 6 sau khi hợp đồng tích hợp máy sản xuất được xác nhận.

---

## 6. QUY TẮC CẬP NHẬT

- Mỗi thay đổi quan hệ phải cập nhật file schema domain trước hoặc trong cùng patch.
- ERD chỉ hiển thị quan hệ đã chốt, không dùng bảng dự kiến làm Source of Truth.
- Migration thực tế phải khớp với schema domain và ERD tại thời điểm triển khai.
