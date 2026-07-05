# Reports API/UI Bridge

> Ngay lap: 2026-07-05
> Trang thai: Draft bridge cho implementation, khong thay Source of Truth.
> Lien quan: `docs/02-PRD-UX-PhongCanh/Reports/`, Sales/Finance/Inventory Source of Truth.

## 1. Bao cao dau tien

Bao cao dau tien nen lam: **Bao cao cuoi ngay**.

Ly do:

- phuc vu doi soat hang ngay
- dung du lieu da co tu POS, hoa don, phieu thu, so quy, cong no
- giup phat hien lech tien/cong no truoc khi lam report phuc tap

## 2. Nguon du lieu

| Chi so/UI | Nguon du lieu |
|---|---|
| Doanh thu | Hoa don `HD...` hoan thanh, khong tinh chung tu da huy |
| Thuc thu | Payment receipts va cashbook entries posted |
| Tien mat | Cashbook entries tai khoan cash |
| Chuyen khoan | Cashbook entries theo tung finance account bank |
| Cong no moi | Hoa don trong ky con no |
| Thu no cu | Debt collections/payment allocations cho hoa don truoc ky |
| Tong chi | Cashbook vouchers/entries loai chi |
| Sua/huy chung tu | Chung tu `MaCu.01` va chung tu status canceled neu co |
| Ton kho | Stock movements, chi dung trong report kho sau |

Backend/API report nen la nguon tong hop chinh. UI khong nen tu lay nhieu list roi cong so lieu quan trong.

## 3. Filter mac dinh

Filter can co:

- thoi gian: hom nay, hom qua, tuan nay, thang nay, tuy chinh
- khach hang
- nguoi ban
- nguoi tao
- phuong thuc thanh toan/tai khoan tien

Quy tac quan trong:

- Tim ma chung tu/phieu thu exact phai mo rong hoac bo filter thoi gian neu filter hien tai che ket qua.
- Empty state phai noi ro dang khong co du lieu hay dang bi filter.
- Khong chi dua vao `Thang nay` de ket luan man hinh khong co du lieu.

## 4. API de xuat khi implement

Neu chua co API report rieng, tao endpoints sau thay vi de UI tu tinh:

| Method | Path | Muc dich |
|---|---|---|
| `GET` | `/reports/end-of-day` | Tong quan va bang chi tiet bao cao cuoi ngay |
| `GET` | `/reports/sales` | Sau End of Day; doanh thu, hoa don, nguoi ban |
| `GET` | `/reports/debt` | Sau Finance debt on dinh |
| `GET` | `/reports/inventory` | Sau Inventory UI/object model on dinh |

`/reports/end-of-day` response nen gom:

- summary totals
- breakdown theo tien mat/tung bank
- rows chi tiet co `source_type`, `source_id`, `document_code`
- pagination neu rows lon

## 5. So chinh thuc va so tam thoi

Chinh thuc trong MVP:

- doanh thu theo hoa don hoan thanh
- thuc thu theo so quy/payment receipt posted
- cong no theo debt entries/allocation

Tam thoi/chi tham khao:

- loi nhuan/gia von neu Purchase/gia von chua du
- ton vat ly cuon/tam neu object model chua implement day du
- chi phi san xuat neu BOM/Purchase chua chot

UI phai gan nhan ro so tham khao, khong goi la loi nhuan ke toan chuan.

## 6. Khong lam

- kenh ban
- VAT/HDĐT/thue ke toan
- HR/luong/hoa hong/KPI
- tuoi/gioi tinh/tinh thanh khach hang
- bao cao dat hang/giao hang/van don/COD
- bao cao tra hang ban trong scope hien tai

## 7. Acceptance criteria

1. Bao cao cuoi ngay lay du lieu tu API tong hop, khong tinh bang nhieu list tren UI.
2. So thuc thu khop So quy trong cung filter.
3. Cong no moi/thu no cu khop cong no theo hoa don.
4. Tien chuyen khoan tach theo tung tai khoan ngan hang.
5. Empty state khong lam nguoi dung hieu sai la mat du lieu.
6. Khong hien report ngoai MVP scope.
