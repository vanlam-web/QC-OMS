# PHẦN 3: KIẾN TRÚC DỮ LIỆU (DATABASE SCHEMA)

> 🔨 Đang xây dựng — Sales domain mới có một phần, các domain khác dự kiến

---

## Nội dung đã có

| File | Mô tả | Trạng thái |
|------|--------|------------|
| `Sales/POS-TABLES.md` | Bảng phục vụ POS (customers, price_lists, products, auth.users, realtime) | 🔨 Một phần |
| `01-ERD.md` | Sơ đồ quan hệ thực thể (Entity Relationship Diagram) | ⬜ Chưa có |
| `03-RLS.md` | Row Level Security & Policies | ⬜ Chưa có |

---

## Mục tiêu Phần 3

Thiết kế các bảng lưu trữ trên **Supabase**, định nghĩa rõ các cột dữ liệu và liên kết giữa các bảng.

---

## Nội dung theo domain

| Domain | Tables | Trạng thái |
|--------|--------|------------|
| **Sales** | customers, price_lists, products đã có; orders, order_items chưa đặc tả | 🔨 Một phần |
| **Finance** | payments, expenses, cashbook | ⬜ Chưa có |
| **Inventory** | inventory, inventory_logs | ⬜ Chưa có |
| **System** | users, audit_logs | ⬜ Chưa có |

---

← [ Quay về README chính](../README.md)
