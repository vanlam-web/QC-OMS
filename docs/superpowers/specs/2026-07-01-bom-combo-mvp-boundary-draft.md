# BOM/Combo MVP Boundary Draft

> Ngay lap: 2026-07-01  
> Trang thai: Draft dieu phoi, chua phai Source of Truth Business/DB/API  
> Nguon: PRD K02-A, export KiotViet, Inventory business da chot.

---

## 1. Ly do can draft

PRD K02-A hien co nhieu y tuong manh:

- Combo cap 1/cap 2.
- Nut sua BOM tren dong POS.
- Deep-scan khi checkout.
- Khui vat tu dong.
- Tong gia vat tu kho de doi chieu bien loi nhuan.

Trong khi do Business Inventory da chot MVP theo huong don gian:

- Tru kho khi luu/chot hoa don chinh thuc.
- Du lieu may san xuat khong tu tru kho.
- Roll/sheet quan ly vat ly rieng.
- BOM/Combo chua chot sau.

Draft nay khoa ranh gioi de implement khong vo tinh lam BOM phuc tap qua som.

---

## 2. Nguyen tac MVP de xuat

### 2.1. Ban hang va tinh tien

Combo trong POS truoc het la **dong ban hang**.

MVP phai luu snapshot dong combo:

- ma/tên combo tai thoi diem ban
- so luong
- don gia
- thanh tien
- ghi chu
- neu co kich thuoc thi luu kich thuoc co cau truc
- neu nhan vien sua vat tu trong combo thi luu snapshot cho chung tu

Gia ban combo khong bat buoc bang tong gia vat tu thanh phan. Gia ban van theo bang gia/nhan vien sua gia.

### 2.2. Tru kho

MVP chia 2 cap:

| Truong hop | Cach xu ly |
|---|---|
| Combo co BOM ro rang, thanh phan da cau hinh don vi/so luong day du | Co the tru kho theo thanh phan khi chot hoa don |
| Combo chua co BOM ro hoac nhan vien tao/sua tu do | Chi luu snapshot dong ban; khong tu deep-scan/tru vat tu thanh phan neu chua du cau hinh |
| Vat tu roll/sheet trong combo | Neu tru thanh phan thi van phai theo rule roll/sheet vat ly, khong tru tong m2 gop |
| Combo long combo | Khong bat buoc deep-scan trong MVP; neu chua chot thi coi combo con la snapshot dong hang |

Nguyen tac an toan: **khong du cau hinh thi khong tu dong tru vat tu con**. He thong co the canh bao thieu cau hinh de quan ly bo sung sau.

### 2.3. Khong tu luu combo moi

Khi nhan vien sua BOM trong don:

- Mac dinh chi luu snapshot trong chung tu.
- Khong tu tao SKU/combo moi.
- Neu can "Luu Combo moi", day la thao tac quan tri danh muc va de sau MVP.

---

## 3. UI K02-A nen hieu the nao

Trong MVP, K02-A co the giu nut `[Sua BOM]` neu san pham da co BOM ro.

Nhung can giam ky vong:

- Khong bat buoc ho tro combo cap 2 deep-scan.
- Khong bat buoc tinh loi nhuan chuan ke toan tu BOM.
- Tong gia vat tu kho neu hien thi chi la tham khao, khong phai loi nhuan chot.
- Neu BOM thieu cau hinh, checkout khong nen crash; hien canh bao va chi luu snapshot dong ban theo rule da chot.

Thong diep UI de sau:

```text
Combo nay chua du cau hinh vat tu de tru kho tu dong.
Hoa don van duoc luu; vui long kiem tra ton kho/bo sung BOM sau.
```

---

## 4. Data model de sau

Khi chuyen thanh Source of Truth, co the can:

- `product_boms`
- `product_bom_items`
- `order_item_bom_snapshots`
- relation tu BOM item sang product/vat tu
- version BOM de biet hoa don da ban theo cau hinh nao
- validation chong vong lap neu cho combo long combo

Chua tao DB/API ngay neu chua chot:

- combo cap 1/cap 2
- BOM co version khong
- BOM sua trong don co luu thanh template moi khong
- deep-scan toi may cap

---

## 5. Checkout behavior de xuat

```text
Checkout hoa don
  -> Validate dong ban
  -> Voi dong normal/area/linear/sheet: tru kho theo rule Inventory
  -> Voi dong combo:
       neu co BOM ro va du cau hinh:
         tao stock movement cho thanh phan
       neu BOM thieu/chua chot:
         luu snapshot combo
         khong tu tao stock movement con
         ghi canh bao/flag de quan ly xu ly sau neu can
  -> Ghi tien/cong no/so quy nhu binh thuong
```

Can chot sau:

- Neu BOM thieu cau hinh thi co cho checkout khong?
- Neu cho checkout, co can hien canh bao bat buoc xac nhan khong?
- Co cho stock movement am cho vat tu thanh phan nhu hang thuong khong?

Khuyen nghi MVP: cho checkout, hien canh bao khong chan ban, vi owner da uu tien thao tac gon va ban thieu ton van duoc cho tiep.

---

## 6. Quan he voi khui vat tu

Khui vat tu la luong Inventory vat ly, khong nen nam trong BOM MVP.

Ranh gioi:

- BOM noi "can vat tu nao".
- Inventory/roll/sheet noi "lay cuon/tam nao".
- Production queue/may san xuat noi "may da chay file nao".
- Checkout hoa don la moc ghi stock movement MVP.

Khui dong theo may san xuat co the dung de de xuat/chon vat tu sau, nhung khong thay the rule checkout trong MVP.

---

## 7. De xuat cap nhat PRD sau

Khi co thoi gian, nen ha mot so cau trong K02-A tu "bat buoc" thanh "sau MVP":

- "Deep-Scan khi thanh toán" -> sau MVP neu BOM da chot.
- "Combo cap 2 khoa/deep scan backend" -> draft, chua bat buoc.
- "Tong gia vat tu kho" -> tham khao, khong phai loi nhuan chuan.
- "Luu Combo moi" -> chuc nang quan tri danh muc, de sau.

---

## 8. Cau hoi can chot truoc khi implement BOM

1. MVP co can tru vat tu thanh phan cho combo nao khong, hay tat ca combo tru theo dong hang chinh truoc?
2. Neu combo co BOM thieu cau hinh, checkout duoc di tiep hay phai chan?
3. Khi nhan vien sua BOM trong don, co bao gio luu thanh combo moi ngay tai POS khong?
4. Co can combo long combo trong MVP khong?
5. Gia ban combo co doc lap voi tong chi phi vat tu khong? Draft de xuat: co, gia ban doc lap.
