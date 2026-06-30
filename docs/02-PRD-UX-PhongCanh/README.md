# PHẦN 2: ĐẶC TẢ TÍNH NĂNG & UX

> **Trạng thái:** 🔨 Đang xây dựng

---

## 📁 Cấu trúc thư mục

```
02-PRD-UX/
├── README.md                     ← (file này)
├── POS/                         ← Trang Bán hàng
    ├── [01-POS-LAYOUT.md](./POS/01-POS-LAYOUT.md)                   ← Bản đồ tổng thể
    ├── [POS/README.md](./POS/README.md)                              ← Chỉ mục POS
    │
    ├── K01/                    ← Khối K01: Thanh đỉnh
    │   └── [01-K01-TOPBAR.md](./POS/K01/01-K01-TOPBAR.md)
    │
    ├── K02/                    ← Khối K02: Giỏ hàng & Máy trạm
    │   ├── [01-K02-GIO-HANG.md](./POS/K02/01-K02-GIO-HANG.md)      ← Tổng quan & Logic tiếp nhận
    │   ├── [02-K02A-DONG-SP.md](./POS/K02/02-K02A-DONG-SP.md)       ← Dòng SP động + Bộ đếm tổng (K02-A & K02-C)
    │   ├── [03-K02B-GHI-CHU.md](./POS/K02/03-K02B-GHI-CHU.md)      ← Ghi chú đơn hàng tổng
    │   └── [04-K02D-HANG-DOI.md](./POS/K02/04-K02D-HANG-DOI.md)   ← Hàng đợi máy trạm
    │
    └── K03/                    ← Khối K03: Đối tác & Sản phẩm
        ├── [01-K03A-DOI-TAC.md](./POS/K03/01-K03A-DOI-TAC.md)      ← Hồ sơ đối tác & Bộ lọc giá (K03-A)
        ├── [02-K03B-TOAST.md](./POS/K03/02-K03B-TOAST.md)            ← Bong bóng Toast SĐT (K03-B)
        ├── [03-K03C-LUOI-SP.md](./POS/K03/03-K03C-LUOI-SP.md)      ← Lưới sản phẩm nhanh (K03-C)
        └── [04-K03D-THANH-TOAN.md](./POS/K03/04-K03D-THANH-TOAN.md) ← Nút chốt đơn (K03-D)
├── Inventory/                   ← Kho hàng & Hàng hóa
    ├── [Inventory/README.md](./Inventory/README.md)
    ├── [Inventory/01-INVENTORY-LAYOUT.md](./Inventory/01-INVENTORY-LAYOUT.md)
    ├── [Inventory/02-PRODUCT-STOCK-LIST.md](./Inventory/02-PRODUCT-STOCK-LIST.md)
    ├── [Inventory/03-ROLL-SHEET-OBJECTS.md](./Inventory/03-ROLL-SHEET-OBJECTS.md)
    ├── [Inventory/04-STOCKTAKE.md](./Inventory/04-STOCKTAKE.md)
    └── [Inventory/05-INVENTORY-ADJUSTMENTS.md](./Inventory/05-INVENTORY-ADJUSTMENTS.md)
├── SalesDocuments/              ← Chứng từ bán hàng
    ├── [SalesDocuments/README.md](./SalesDocuments/README.md)
    ├── [SalesDocuments/01-SALES-DOCUMENT-LIST.md](./SalesDocuments/01-SALES-DOCUMENT-LIST.md)
    └── [SalesDocuments/02-SALES-DOCUMENT-DETAIL.md](./SalesDocuments/02-SALES-DOCUMENT-DETAIL.md)
├── Customers/                   ← Quản lý khách hàng
    ├── [Customers/README.md](./Customers/README.md)
    ├── [Customers/01-CUSTOMER-LIST.md](./Customers/01-CUSTOMER-LIST.md)
    └── [Customers/02-CUSTOMER-DETAIL.md](./Customers/02-CUSTOMER-DETAIL.md)
├── PriceBook/                   ← Quản lý bảng giá
    ├── [PriceBook/README.md](./PriceBook/README.md)
    ├── [PriceBook/01-PRICE-LIST.md](./PriceBook/01-PRICE-LIST.md)
    └── [PriceBook/02-PRICE-LIST-DETAIL.md](./PriceBook/02-PRICE-LIST-DETAIL.md)
├── Finance/                     ← Sổ quỹ, công nợ và đối soát
    ├── [Finance/README.md](./Finance/README.md)
    ├── [Finance/01-FINANCE-LAYOUT.md](./Finance/01-FINANCE-LAYOUT.md)
    ├── [Finance/02-CASHBOOK.md](./Finance/02-CASHBOOK.md)
    ├── [Finance/03-CUSTOMER-DEBT.md](./Finance/03-CUSTOMER-DEBT.md)
    └── [Finance/04-RECONCILIATION.md](./Finance/04-RECONCILIATION.md)
├── Reports/                     ← Báo cáo và phân tích
    ├── [Reports/README.md](./Reports/README.md)
    ├── [Reports/01-END-OF-DAY.md](./Reports/01-END-OF-DAY.md)
    ├── [Reports/02-SALES-REPORT.md](./Reports/02-SALES-REPORT.md)
    ├── [Reports/03-DEBT-REPORT.md](./Reports/03-DEBT-REPORT.md)
    ├── [Reports/04-INVENTORY-REPORT.md](./Reports/04-INVENTORY-REPORT.md)
    └── [Reports/05-FINANCE-REPORT.md](./Reports/05-FINANCE-REPORT.md)
└── System/                      ← Tài khoản, quyền và máy trạm
    ├── [System/README.md](./System/README.md)
    └── [System/01-USERS-PERMISSIONS.md](./System/01-USERS-PERMISSIONS.md)
```

> Mỗi trang mới sẽ có thư mục riêng cùng cấp với `POS/`. Phần nhân viên hiện chỉ làm tài khoản/quyền trong `System/`, không làm chấm công/lương/hoa hồng.

---

## 📋 Trạng thái các khối

| Khối | File | Trạng thái |
|---|---|---|
| Bản đồ tổng thể POS | [POS/01-POS-LAYOUT.md](./POS/01-POS-LAYOUT.md) | ✅ |
| K01: Top Bar | [POS/K01/01-K01-TOPBAR.md](./POS/K01/01-K01-TOPBAR.md) | 🔨 |
| K02-A: Dòng SP động | [POS/K02/02-K02A-DONG-SP.md](./POS/K02/02-K02A-DONG-SP.md) | 🔨 |
| K02-B: Ghi chú đơn hàng | [POS/K02/03-K02B-GHI-CHU.md](./POS/K02/03-K02B-GHI-CHU.md) | 🔨 |
| K02-C: Bộ đếm tổng | *(trong 02-K02A-DONG-SP.md)* | 🔨 |
| K02-D: Hàng đợi máy trạm | [POS/K02/04-K02D-HANG-DOI.md](./POS/K02/04-K02D-HANG-DOI.md) | 🔨 |
| K03-A: Hồ sơ đối tác | [POS/K03/01-K03A-DOI-TAC.md](./POS/K03/01-K03A-DOI-TAC.md) | 🔨 |
| K03-B: Toast SĐT | [POS/K03/02-K03B-TOAST.md](./POS/K03/02-K03B-TOAST.md) | 🔨 |
| K03-C: Lưới sản phẩm | [POS/K03/03-K03C-LUOI-SP.md](./POS/K03/03-K03C-LUOI-SP.md) | 🔨 |
| K03-D: Thanh toán | [POS/K03/04-K03D-THANH-TOAN.md](./POS/K03/04-K03D-THANH-TOAN.md) | 🔨 |
| Inventory Layout | [Inventory/01-INVENTORY-LAYOUT.md](./Inventory/01-INVENTORY-LAYOUT.md) | 🔨 |
| Product Stock List | [Inventory/02-PRODUCT-STOCK-LIST.md](./Inventory/02-PRODUCT-STOCK-LIST.md) | 🔨 |
| Roll/Sheet Objects | [Inventory/03-ROLL-SHEET-OBJECTS.md](./Inventory/03-ROLL-SHEET-OBJECTS.md) | 🔨 |
| Stocktake UX | [Inventory/04-STOCKTAKE.md](./Inventory/04-STOCKTAKE.md) | 🔨 |
| Inventory Adjustments UX | [Inventory/05-INVENTORY-ADJUSTMENTS.md](./Inventory/05-INVENTORY-ADJUSTMENTS.md) | 🔨 |
| Sales Documents List | [SalesDocuments/01-SALES-DOCUMENT-LIST.md](./SalesDocuments/01-SALES-DOCUMENT-LIST.md) | 🔨 |
| Sales Document Detail | [SalesDocuments/02-SALES-DOCUMENT-DETAIL.md](./SalesDocuments/02-SALES-DOCUMENT-DETAIL.md) | 🔨 |
| Customer List | [Customers/01-CUSTOMER-LIST.md](./Customers/01-CUSTOMER-LIST.md) | 🔨 |
| Customer Detail | [Customers/02-CUSTOMER-DETAIL.md](./Customers/02-CUSTOMER-DETAIL.md) | 🔨 |
| Price List | [PriceBook/01-PRICE-LIST.md](./PriceBook/01-PRICE-LIST.md) | 🔨 |
| Price List Detail | [PriceBook/02-PRICE-LIST-DETAIL.md](./PriceBook/02-PRICE-LIST-DETAIL.md) | 🔨 |
| Finance Layout | [Finance/01-FINANCE-LAYOUT.md](./Finance/01-FINANCE-LAYOUT.md) | 🔨 |
| Cashbook UX | [Finance/02-CASHBOOK.md](./Finance/02-CASHBOOK.md) | 🔨 |
| Customer Debt UX | [Finance/03-CUSTOMER-DEBT.md](./Finance/03-CUSTOMER-DEBT.md) | 🔨 |
| Reconciliation UX | [Finance/04-RECONCILIATION.md](./Finance/04-RECONCILIATION.md) | 🔨 |
| Reports Overview | [Reports/README.md](./Reports/README.md) | 🔨 |
| End Of Day Report | [Reports/01-END-OF-DAY.md](./Reports/01-END-OF-DAY.md) | 🔨 |
| Sales Report | [Reports/02-SALES-REPORT.md](./Reports/02-SALES-REPORT.md) | 🔨 |
| Debt Report | [Reports/03-DEBT-REPORT.md](./Reports/03-DEBT-REPORT.md) | 🔨 |
| Inventory Report | [Reports/04-INVENTORY-REPORT.md](./Reports/04-INVENTORY-REPORT.md) | 🔨 |
| Finance Report | [Reports/05-FINANCE-REPORT.md](./Reports/05-FINANCE-REPORT.md) | 🔨 |
| System Users/Permissions | [System/01-USERS-PERMISSIONS.md](./System/01-USERS-PERMISSIONS.md) | 🔨 |

---

## 📌 Nguyên tắc đặc tả

> - Mỗi file chi tiết 1 khối, bắt đầu từ tree structure tổng quan
> - Mọi thứ trong Master Map đều có link tham chiếu đến file chi tiết
> - Không tự suy diễn nội dung chưa có trong cấu trúc
> - Wireframe tỉ lệ ~120 ký tự/dòng (tương thích màn hình 16:9)

---

← [Quay về README chính](../README.md)
