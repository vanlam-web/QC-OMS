# Finance UI Implementation Bridge

> Ngay lap: 2026-07-05
> Trang thai: Draft bridge cho implementation, khong thay Source of Truth.
> Lien quan: `docs/02-PRD-UX-PhongCanh/Finance/`, `docs/03-BUSINESS-NghiepVu/Finance/CASHBOOK.md`, `docs/04-DATABASE/Finance/`, `docs/05-BACKEND-MayChu/Finance/FINANCE-API.md`

## 1. Thu tu lam

Thu tu de xuat:

1. So quy.
2. Cong no khach hang.
3. Doi soat cuoi ngay.

Ly do: So quy la nen de Reports va doi soat. Cong no can dung du lieu hoa don/thu no. Doi soat chi nen lam khi so quy hien dung.

## 2. So quy

### UI can co

- Filter sidebar dung layout chung.
- Summary nam trong khu vuc filter hoac footer/list summary theo style chung, khong tao card lon rieng.
- Table chinh: ma phieu, thoi gian, loai thu chi, nguoi nop/nhan, quy/tai khoan, gia tri, hach toan, trang thai.
- Nut tao phieu thu/chi thu cong chi hien neu co quyen/phase lam toi.

### Mapping API

| UI | API |
|---|---|
| Tai khoan/quy | `GET /finance/accounts` |
| List so quy | `GET /finance/cashbook` |
| Phieu thu lien quan hoa don | `GET /finance/payment-receipts` hoac detail tu cashbook entry |
| Chi tiet phieu thu | `GET /finance/payment-receipts/{id}` |

### Filter MVP

- quy tien: tien mat, tung tai khoan bank, tong quy
- thoi gian
- loai: thu/chi
- loai thu chi
- trang thai
- hach toan KQKD
- nguoi tao
- nguoi nop/nhan

Tim theo ma phieu phai co co che khong bi filter thoi gian che ket qua.

## 3. Cong no khach hang

### UI can co

- List khach con no.
- Search khach theo ma/ten/SDT neu co.
- Mo detail cong no theo khach.
- Detail hien hoa don con no cu nhat truoc.
- Thu no ngoai checkout de phase rieng neu chua can thao tac ngay.

### Mapping API

| UI | API |
|---|---|
| List cong no | `GET /finance/customer-debts` |
| Detail cong no | `GET /finance/customers/{customer_id}/debt` |
| Thu no | `POST /finance/debt-collections` |

Khong tao cong no am/khach tra truoc trong MVP. Neu thu vuot no, UI phai chan truoc va Backend van la nguon validate cuoi.

## 4. Doi soat cuoi ngay

Doi soat chi lam sau khi So quy list va account selector on dinh.

UI can tach:

- tien mat trong ket
- tung tai khoan ngan hang
- so he thong
- so thuc te
- chenh lech
- ghi chu

Khong doi soat chuyen khoan bang mot tong chung.

## 5. Khong lam trong Finance bridge nay

- vi dien tu
- QR ting ting/bank partner
- VAT/HDĐT
- so ke toan thue
- approval nhieu buoc
- mua dich vu thanh module rieng
- tu dong doi soat API ngan hang

## 6. Performance va UX

- Initial So quy khong load detail phieu per-row.
- Account list co the cache ngan han vi it doi.
- Cashbook list phai paginate backend.
- Detail row/panel phai hien loading ngay khi click.
- So tien thu/chi can canh phai; chi nen dung mau canh bao nhe, khong tao vien mau vang rieng le khac style.

## 7. Acceptance criteria

1. So quy load bang list request chinh va account lookup.
2. Loc duoc tien mat/tung bank/tong quy.
3. Thu/chi hien dung dau va canh phai.
4. Phieu tu POS/thu no chi readonly, khong co nut sua roi.
5. Cong no detail sap xep hoa don no cu nhat truoc.
6. UI khong hien cac module tai chinh ngoai scope MVP.
