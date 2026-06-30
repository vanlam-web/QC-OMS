# PHẦN 3: KIẾN TRÚC DỮ LIỆU (DATABASE SCHEMA)

> 🔨 Đang xây dựng — Foundation/System đã chốt Giai đoạn 0; Sales và Inventory đang có một phần

---

## Nội dung đã có

| File | Mô tả | Trạng thái |
|------|--------|------------|
| [01-ERD.md](./01-ERD.md) | ERD phát triển theo giai đoạn; Foundation/System đã chốt | 🔨 Một phần |
| [03-RLS.md](./03-RLS.md) | RLS Foundation/System | ✅ Chốt Giai đoạn 0 |
| [System/AUTH-PERMISSIONS.md](./System/AUTH-PERMISSIONS.md) | Organization, Profile, Workstation và Permission | ✅ Chốt Giai đoạn 0 |
| `Sales/POS-TABLES.md` | Bảng phục vụ POS: customer, product, pricing, quote/order, sửa chứng từ và snapshot dòng hàng | 🔨 Một phần |
| `Inventory/INVENTORY-TABLES.md` | Bảng kho vật tư: đơn vị, cấu hình tồn kho, stock movement, cuộn, tấm và kiểm kho | 🔨 Một phần |
| `Finance/PAYMENT-DEBT-TABLES.md` | Bảng thanh toán POS, phân bổ công nợ và quỹ/tài khoản nhận tiền | 🔨 Một phần |
| `Finance/CASHBOOK-TABLES.md` | Bảng sổ quỹ, phiếu thu/chi thủ công và đối soát cuối ngày | 🔨 Một phần |

---

## Mục tiêu Phần 3

Thiết kế các bảng lưu trữ trên **Supabase**, định nghĩa rõ các cột dữ liệu và liên kết giữa các bảng.

---

## Nội dung theo domain

| Domain | Tables | Trạng thái |
|--------|--------|------------|
| **Sales** | customers, customer_groups, price_lists, price_list_items, products, price history, orders, order_items, order_status_history | 🔨 Một phần |
| **Finance** | finance_accounts, payment_receipts, payment_receipt_methods, customer_debt_entries, customer_debt_allocations, cashbook_vouchers, cashbook_entries, cash_reconciliations, cash_reconciliation_items | 🔨 Một phần |
| **Inventory** | inventory_units, product_inventory_settings, product_unit_conversions, inventory_rolls, inventory_sheets, stock_movements, stocktakes, stocktake_items | 🔨 Một phần |
| **System** | organizations, profiles, workstations, permissions, audit permission | ✅ Chốt Giai đoạn 0 |

---

← [ Quay về README chính](../README.md)
