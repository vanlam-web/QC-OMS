# PHẦN 3: KIẾN TRÚC DỮ LIỆU (DATABASE SCHEMA)

> 🔨 Đang xây dựng — Foundation/System đã chốt Giai đoạn 0; Sales mới có một phần

---

## Nội dung đã có

| File | Mô tả | Trạng thái |
|------|--------|------------|
| [01-ERD.md](./01-ERD.md) | ERD phát triển theo giai đoạn; Foundation/System đã chốt | 🔨 Một phần |
| [03-RLS.md](./03-RLS.md) | RLS Foundation/System | ✅ Chốt Giai đoạn 0 |
| [System/AUTH-PERMISSIONS.md](./System/AUTH-PERMISSIONS.md) | Organization, Profile, Workstation và Permission | ✅ Chốt Giai đoạn 0 |
| `Sales/POS-TABLES.md` | Bảng phục vụ POS: customer, product, pricing, quote/order snapshot | 🔨 Một phần |

---

## Mục tiêu Phần 3

Thiết kế các bảng lưu trữ trên **Supabase**, định nghĩa rõ các cột dữ liệu và liên kết giữa các bảng.

---

## Nội dung theo domain

| Domain | Tables | Trạng thái |
|--------|--------|------------|
| **Sales** | customers, customer_groups, price_lists, price_list_items, products, price history, orders, order_items đã có; checkout/finance chưa đặc tả | 🔨 Một phần |
| **Finance** | payments, expenses, cashbook | ⬜ Chưa có |
| **Inventory** | inventory, inventory_logs | ⬜ Chưa có |
| **System** | organizations, profiles, workstations, permissions, audit permission | ✅ Chốt Giai đoạn 0 |

---

← [ Quay về README chính](../README.md)
