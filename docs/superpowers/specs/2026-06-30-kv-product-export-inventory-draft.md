# KV Product Export Inventory Draft

> Ngay lap: 2026-06-30  
> Trang thai: Draft phan tich export KV, khong phai Source of Truth nghiep vu  
> Nguon du lieu: `/Users/vanlam/Downloads/DanhSachSanPham_KV30062026-122559-834.xlsx`  
> Pham vi: Hang hoa, don vi tinh, ton kho, trang thai ban hang, combo/BOM tham khao cho QC-OMS

## 1. Muc tieu

File nay ghi lai nhung gi rut ra tu export san pham KiotViet de tang toc dac ta Inventory/BOM cho QC-OMS.

Nguyen tac ap dung:

- KV chi la du lieu tham khao, khong copy 1:1.
- Phan nao hop nghiep vu QC-OMS se de xuat giu.
- Phan nao chua chac se hoi Owner chot.
- Phan nao lam phuc tap hoac khong hop MVP se de xuat bo hoac doi.
- Sau khi Owner chot, moi cap nhat Source of Truth o `docs/03`, `docs/04`, `docs/05`.

## 2. Tom tat export

Workbook co 1 sheet:

```text
DanhSachSanPham_KV30062026-1225
```

Tong so dong du lieu: 656.

Cot trong export:

```text
Loai hang
Nhom hang(3 Cap)
Ma hang
Ten hang
Thuong hieu
Gia ban
Gia von
Ton kho
KH dat
Du kien het hang
Ton nho nhat
Ton lon nhat
DVT
Ma DVT Co ban
Quy doi
Hinh anh
Trong luong
Dang kinh doanh
Duoc ban truc tiep
Mo ta
Mau ghi chu
Vi tri
Hang thanh phan
Thoi gian tao
```

## 3. Thong ke quan trong

### 3.1. Loai hang

```text
Hang hoa: 460
Combo - dong goi: 184
Dich vu: 12
```

Nhan xet:

- QC-OMS can tach ro `product_type`: vat tu/hang hoa, thanh pham/combo, dich vu.
- KV dung `Combo - dong goi` cho nhieu mat hang co cong thuc thanh phan. QC-OMS khong nen mac dinh tat ca combo deu giong nhau; can chot lai BOM/Combo sau.

### 3.2. Trang thai kinh doanh

```text
Dang kinh doanh = 1: 495
Dang kinh doanh = 0: 161
Duoc ban truc tiep = 1: 656
Duoc ban truc tiep = 0: 0
```

Nhan xet:

- `Dang kinh doanh` trong KV co the map sang `status = active/inactive`.
- `Duoc ban truc tiep` khong giup phan loai vi tat ca dong deu bang 1.
- QC-OMS da chot san pham inactive khong tim thay trong POS, chi thay o trang Hang hoa qua bo loc trang thai.

### 3.3. Don vi tinh

Export co 93 gia tri DVT khac nhau, gom ca khac nhau do viet hoa/viet thuong.

DVT pho bien:

```text
Cai: 82
m2: 65
Tam: 62
m: 61
Tac: 56
To: 38
cai: 37
blank: 31
cay: 17
m toi: 14
Ram: 11
Cuon/cuon: 14
```

Nhan xet:

- QC-OMS can chuan hoa danh muc don vi tinh, khong giu nguyen 93 gia tri nhu KV.
- Can tach `unit_name` hien thi va `unit_kind` nghiep vu, vi `Cai/cai`, `Cay/cay`, `Tam/tam/Ta'm` dang bi trung y nghia.
- Cac don vi dang gom kich thuoc vao ten DVT nhu `Kho 91`, `Kho 127`, `500 To`, `1000 To`, `5 kg`, `10 kg` can hoi lai co nen la unit hay la quy cach/variant.

### 3.4. Don vi co quy doi

Co 140 dong co `Ma DVT Co ban`.

Vi du:

```text
Fomex 5mm: Tam -> Tac/Tam CNC/Tac CNC
Alu: Tam -> Tac hoac m toi
Mica: Tam -> m toi hoac m2
Giay: Ram -> To
Sat: Cay -> m
Bat/decal/PP: Cuon -> cac kho in
Keo/muc: Thung/Can -> chai/lit
```

Nhan xet:

- QC-OMS can co mo hinh quy doi don vi.
- Nhung khong nen copy cach KV dung nhieu dong san pham rieng cho moi DVT neu co the lam model gon hon.
- Can chot luong ban hang va tru kho cho san pham co nhieu don vi: ban theo DVT phu thi tru ton cua DVT co ban hay ton rieng tung DVT.

### 3.5. Ton kho

Thong ke ton kho:

```text
Tong ton kho so hoc: 38,792.817
Dong ton kho = 0: 249
Dong ton kho am: 57
Tong ton am: -6,045.12
Ton kho max: 5,746
```

Nhan xet:

- KV dang cho phep hoac da phat sinh ton am.
- QC-OMS can chot chinh sach ban qua ton: chan, canh bao cho qua, hay cho am theo quyen.
- Ton am trong export co ca hang hoa vat tu, giay, alu/fomex/mica, dich vu/phi van chuyen bi nhap nhu hang hoa.

### 3.6. Hang inactive van co ton

Co 63 dong `Dang kinh doanh = 0` nhung `Ton kho != 0`.

Nhan xet:

- QC-OMS can cho san pham inactive van nam trong ton kho va bao cao.
- POS khong duoc ban/tim san pham inactive.
- Trang Hang hoa can bo loc inactive va van hien so ton de xu ly/chuyen doi/kiem ke.

### 3.7. Combo/BOM

Co 189 dong co `Hang thanh phan`.

Dinh dang KV:

```text
MaThanhPhan:SoLuong|MaThanhPhan:SoLuong
```

Vi du:

```text
HH = DCS:0.6|F5:0.3
IDC = DCS:0.1
SP000525 = DCS:1.2|A5T:0.42|SP000124:4.5
```

Tat ca ma thanh phan trong export deu tim thay trong danh muc san pham.

Nhan xet:

- QC-OMS nen co BOM/Combo rieng, nhung can dac ta sau Inventory.
- Can chot combo dung de ban thanh pham, de tinh dinh muc vat tu, hay ca hai.
- Can chot BOM co duoc sua theo tung don hang khong.

## 4. De xuat giu tu KV

### 4.1. Giu

- `Ma hang` la ma san pham bat buoc va unique trong organization.
- `Ten hang` la bat buoc.
- `Loai hang` can co nhung nen chuan hoa thanh enum QC-OMS.
- `Nhom hang(3 Cap)` can giu de phan loai, nhung nen tach thanh category tree.
- `Gia ban`, `Gia von` can co trong san pham, nhung gia ban mac dinh van di theo bang gia da chot.
- `Ton kho`, `KH dat`, `Ton nho nhat`, `Ton lon nhat` can dung cho inventory/reorder.
- `DVT`, `Ma DVT Co ban`, `Quy doi` la du lieu quan trong cho quy doi.
- `Dang kinh doanh` map sang active/inactive.
- `Hang thanh phan` dung lam tham khao cho BOM/Combo.

### 4.2. Can hoi lai truoc khi giu

- Co cho ton kho am trong MVP khong.
- Don vi nao la unit that su, don vi nao la quy cach/variant.
- Co quan ly ton tung DVT rieng hay chi ton theo don vi co ban.
- Combo/BOM tru kho khi nao: luc tao don, luc xuat kho, hay luc hoan thanh san xuat.
- `KH dat` co can MVP khong hay de sau.
- `Du kien het hang` co can MVP khong hay chi tinh sau.
- `Thuong hieu`, `Vi tri`, `Trong luong`, `Mau ghi chu` co can trong MVP khong.

### 4.3. De xuat khong copy 1:1

- Khong giu nguyen 93 DVT, can normalize.
- Khong coi `Duoc ban truc tiep` la rule vi export tat ca deu bang 1.
- Khong coi moi `Combo - dong goi` la thanh pham san xuat thuc su; can chot lai tung nhom.
- Khong dung DVT de chua quy cach phuc tap neu QC-OMS co truong rieng cho width/height/khổ/quy cach.
- Khong dua draft nay cho implementation lam Source of Truth.

## 5. Cau hoi can Owner chot

### Q1. Chinh sach ton am

Owner da chot:

```text
Khi POS ban hang ma ton khong du, he thong canh bao nhung van cho ban tiep.
```

Ghi chu dua vao Source of Truth sau:

- POS phai hien canh bao ton khong du truoc khi thanh toan/luu hoa don.
- Nhan vien van co the tiep tuc ban sau khi thay canh bao.
- Stock movement co the lam ton kho am.
- Bao cao ton kho phai hien ro cac mat hang ton am de xu ly sau.

Lua chon da chot: 2.

Khi POS ban hang ma ton khong du:

1. Chan ban.
2. Canh bao nhung cho ban tiep.
3. Cho ban am neu nguoi dung co quyen.

### Q2. Don vi va quy doi

Owner da chot:

```text
QC-OMS quan ly ton kho theo mot don vi ton chinh.
Don vi ban phu chi dung de ban, tinh gia va quy doi ve don vi ton chinh khi tru kho.
Hang dong goi dac biet co the tao SKU rieng khi that su la mat hang doc lap, khong phai rule mac dinh.
```

Ghi chu dua vao Source of Truth sau:

- Moi san pham co mot `stock_unit_id` lam don vi ton chinh.
- POS co the ban bang `sale_unit_id` khac neu co cau hinh quy doi.
- Khi ban bang don vi phu, stock movement luu ca so luong ban theo don vi hien thi va so luong da quy doi theo don vi ton chinh.
- Khong tao nhieu ton kho doc lap cho cung mot vat tu chi vi khac DVT.
- Neu hang dong goi la mat hang doc lap that su, tao SKU rieng va co lien ket quy doi/BOM rieng.

Lua chon da chot: ket hop theo huong mot ton goc cho vat tu chinh, SKU rieng chi khi can.

Voi san pham co don vi co ban va don vi phu, QC-OMS nen:

1. Quan ly ton theo mot don vi co ban, cac don vi phu chi de ban/quy doi.
2. Quan ly ton rieng theo tung DVT nhu cac dong san pham rieng.
3. Ket hop: vat tu chinh theo don vi co ban, hang dong goi theo ton rieng.

### Q3. Don vi co kem kich thuoc

Cac DVT nhu `Kho 91`, `Kho 127`, `500 To`, `1000 To`, `5 kg`, `10 kg` nen:

1. Tach thanh quy cach/variant, khong coi la DVT chuan.
2. Giu la DVT hien thi de nhanh va giong KV.
3. MVP giu tam, sau nay normalize.

### Q4. Inactive co ton

San pham ngung ban nhung con ton:

1. Van hien o trang Hang hoa va bao cao ton, khong hien POS.
2. Can co luong rieng de thanh ly/xuat huy.
3. Tam chi can loc trang thai, xu ly xuat huy de sau.

### Q5. BOM/Combo

Combo trong QC-OMS nen dung cho:

1. Ban hang thanh pham va tu dong tru vat tu theo dinh muc.
2. Chi de tinh gia/dinh muc tham khao, chua tu dong tru kho MVP.
3. Tach thanh module san xuat/BOM rieng sau Inventory.

## 6. De xuat thu tu dac ta tiep theo

1. Owner chot Q1-Q4 de viet Inventory Business.
2. Cap nhat Source of Truth Inventory:
   - `docs/03-BUSINESS-NghiepVu/Inventory/README.md`
   - `docs/03-BUSINESS-NghiepVu/Inventory/STOCK-RULES.md`
   - `docs/03-BUSINESS-NghiepVu/Inventory/UNIT-CONVERSION.md`
3. Sau do moi chot Q5 va viet BOM/Combo draft.
4. Sau khi Business chot, moi viet Database/API Inventory.
