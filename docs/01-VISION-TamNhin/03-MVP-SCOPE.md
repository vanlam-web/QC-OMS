# MVP SCOPE - Pham vi QC-OMS hien tai

> Trang thai: Da chot dinh huong theo Owner - 2026-07-01  
> Source of Truth: pham vi san pham hien tai de tranh copy du KiotViet.

---

## 1. Nguyen tac chung

QC-OMS tham khao KiotViet de hoc cach to chuc thao tac va du lieu, nhung khong copy 100%.

Pham vi MVP uu tien luong van hanh thuc te cua xuong:

```text
POS ban dut -> hoa don -> tru kho -> thu tien/cong no -> so quy -> doi soat -> bao cao quan tri
```

Nhung man hinh KiotViet khong co du lieu thuc te, it dung, hoac thuoc retail/online/thue se bi loai khoi MVP tru khi Owner chot lai.

---

## 2. Trong scope MVP

| Nhom | Noi dung giu |
|---|---|
| POS ban hang | Ban dut tai quay, bao gia, mo lai bao gia de checkout thanh hoa don |
| Chung tu ban hang | Bao gia `BG...`, hoa don `HD...`, hoa don sua dang `MaCu.01`, chung tu da huy |
| Khach hang | Ma khach, ten khach, SĐT tuy chon/unique neu co, nhom khach, bang gia, lich su ban, cong no |
| Bang gia | Bang gia chung, bang gia theo nhom khach, gia sua tay luu lich su theo khach + san pham |
| Hang hoa/kho | San pham dang ban/ngung ban, ton vat ly cuon/tam/tam lo, quy doi don vi, tru kho khi luu hoa don |
| Kiem kho | Phieu tam, can bang kho, huy phieu, phieu tu dong khi sua ton hang thuong |
| Dieu chinh ton | Dieu chinh/huy vat tu toi gian; ly do nhu huy vat tu, dung noi bo neu can |
| Tai chinh | So quy tien mat, tai khoan ngan hang, phieu thu/chi, thu no, phan bo no hoa don cu nhat truoc |
| Doi soat | Doi soat cuoi ngay theo tien mat va tung tai khoan ngan hang |
| Bao cao | Cuoi ngay, ban hang, cong no, hang hoa/ton kho, tai chinh quan tri |
| He thong | Tai khoan, quyen tick theo permission, active/inactive, may tram |

---

## 3. Ngoai scope hien tai

| Nhom | Quyet dinh |
|---|---|
| Dat hang KiotViet | Khong lam. QC-OMS chi ban dut; bao gia khong phai don dat hang |
| Giao hang/van don | Khong lam van don, doi tac giao hang, trang thai giao hang, khu vuc giao hang |
| COD/ban giao hang | Khong lam COD, phi giao hang, doi soat giao hang |
| Ban online | Khong lam website/Zalo shop/kenh ban online trong MVP |
| Tra hang ban | Khong lam trong MVP; hoa don sai xu ly bang sua chung tu `MaCu.01` va huy chung tu cu |
| Tra hang nhap | De sau Purchase/Supplier |
| Hoa don dien tu/VAT/thue | Khong phat hanh HĐĐT, khong tinh VAT/thue ke toan trong QC-OMS hien tai |
| Thuong hieu retail | Khong tao field/module/report rieng; neu can thi ghi trong ten/ma/nhom hang |
| Diem thuong/loyalty | Khong lam tich diem, khuyen mai tu dong, sinh nhat/gioi tinh retail |
| Nhan su cham cong | Khong lam lich lam viec, bang cham cong, bang luong, hoa hong/KPI |
| Mua dich vu rieng | Trong MVP xu ly bang phieu chi So quy neu can |
| Vi dien tu | Chua lam; MVP chi tien mat va ngan hang |

---

## 4. De sau MVP

| Nhom | Khi nao xem lai |
|---|---|
| Nha cung cap/Purchase | Khi chot nhap kho vat ly theo cuon/tam, gia von va cong no NCC |
| Gia von/lai lo day du | Khi Purchase, chi phi san xuat va phuong phap gia von da chot |
| May san xuat tu tru kho | Khi giai quyet duoc cach ghep file may san xuat voi bill/hoa don |
| Production/Work Orders | Neu sau nay can quan ly viec can san xuat/cho lay hang rieng voi POS |
| Gui tin tu dong | Sau khi bill, khach hang va log gui on dinh; hien tai chi ho tro mo/copy de nhan vien gui |

---

## 5. Quy tac ap dung cho implement

1. Neu mot man KiotViet co truong/chuc nang nam ngoai scope tren, khong dua vao UI/API/DB MVP.
2. Neu can luu thong tin phu nhu ten cong ty, MST, dia chi phap ly, chi xem la thong tin noi bo cua khach, khong mo luong HĐĐT/VAT.
3. Bao gia khong giu hang, khong tru kho, khong tao doanh thu, khong tao so quy va khong tao cong no.
4. Hoa don da luu la moc ghi nhan ban hang: tru kho, ghi thanh toan/cong no, so quy va bao cao.
5. Doi voi spec moi tham khao KiotViet, phai doi chieu file nay truoc khi chuyen vao Source of Truth chi tiet.

---

## 6. Tham chieu

- Audit KiotViet: [2026-07-01-kv-web-qc-oms-audit.md](../superpowers/specs/2026-07-01-kv-web-qc-oms-audit.md)
- Luong ban hang: [POS-ORDER-LIFECYCLE.md](../03-BUSINESS-NghiepVu/Sales/POS-ORDER-LIFECYCLE.md)
- Chung tu ban hang: [SalesDocuments/README.md](../02-PRD-UX-PhongCanh/SalesDocuments/README.md)
- So quy: [CASHBOOK.md](../03-BUSINESS-NghiepVu/Finance/CASHBOOK.md)
