# WORKFLOW-AUTO-SPEC-IMPLEMENT — Ke hoach tu dong phoi hop cac luong Codex

> **Vai tro:** Source of Truth van hanh.
> **Nguoi quyet dinh:** Owner chot uu tien nghiep vu lon.
> **Cap nhat:** 2026-07-03.

---

## 1. Muc tieu

Tai lieu nay la thoa thuan van hanh giua cac luong Codex:

- **Spec/UX Gate:** giu Source of Truth, kiem KiotViet, chot scope, review PR theo nghiep vu.
- **Implement:** code, test, mo PR, sua feedback, merge khi du dieu kien.
- **Review:** kiem tra du an khi Owner yeu cau, chay test/build/lint, review rui ro, phat hien drift va chuan bi bao cao/handoff cho Spec hoac Implement.

Muc tieu la giam viec Owner phai tra loi qua lai. Cac luong duoc phep tu giao viec, tu bao trang thai, tu review voi nhau neu slice da nam trong quy dao da chot.

Bat buoc dong vong giao viec: luong nao nhan handoff, review request, blocker question, hoac Review issue tu luong khac thi phai bao cao lai truc tiep cho luong do khi xong, khi bi block, hoac khi defer. Owner khong phai nhac hoac chuyen loi giua cac luong.

Bang dieu phoi active nam tai `docs/PROJECT-COORDINATION.md`. Moi slice/PR quan trong phai co current owner, next owner va next action ro rang. Neu Owner phai hoi "dang den dau" ma cac luong phai doan tu lich su chat, do la loi dieu phoi can sua.

---

## 2. Nguyen tac van hanh

1. **Owner chi can chot huong lon.**
   - Vi du: chon Purchase/Supplier truoc Production.
   - Sau khi Owner chot huong, Spec duoc tu tach slice va giao Implement.

2. **Spec khong giao suong.**
   Moi handoff phai co:
   - base branch/commit
   - SoT files
   - in scope
   - out of scope
   - acceptance checklist
   - verification checklist
   - cac diem cam tu mo
   - current owner
   - next owner
   - next action

3. **Implement khong tu mo scope.**
   Neu gap phan ngoai slice, Implement phai bao Spec bang cau hoi cu the, kem de xuat.

4. **Spec review truoc khi coi la dung.**
   PR quan trong phai qua Spec/UX gate, ngay ca khi CI xanh.

5. **Review ho tro kiem tra va handoff.**
   Review co the duoc Owner goi bat ky luc nao de kiem tra tinh trang du an, test, review rui ro, hoac chuan bi viec cho Spec/Implement. Review khong tu sua feature neu Owner chi yeu cau kiem tra.
   Neu Review giao viec cho luong khac, Review phai ghi issue vao `docs/REVIEW-ISSUES.md`, noi ro luong phu trach phai bao lai, va re-check sau khi luong phu trach bao da fix.

6. **Chi keo Owner vao khi co quyet dinh nghiep vu that.**
   Khong hoi Owner ve wording nho, layout nho, hoac viec ky thuat co the tu quyet theo pattern codebase.

---

## 3. Vong lap tu dong

### Giai doan A — Spec chon slice

Spec doc theo thu tu:

1. `docs/WORKFLOW-SPEC-IMPLEMENT.md`
2. `docs/PHASE-CHECKLIST.md`
3. SoT module dang lam trong `docs/02-PRD-UX-PhongCanh`, `docs/03-BUSINESS-NghiepVu`, `docs/04-DATABASE`, `docs/05-BACKEND-MayChu`
4. Trang thai PR/branch moi nhat
5. KiotViet live/reference neu slice can doi chieu nghiep vu

**Checklist Giai doan A:**

- [ ] Da xac dinh module uu tien hien tai.
- [ ] Da xac dinh slice nho, co the test rieng.
- [ ] Da doc SoT lien quan.
- [ ] Da tach ro in scope/out of scope.
- [ ] Da danh dau cac diem rui ro: tien, quy, cong no, kho, chung tu, schema kho sua.
- [ ] Da quyet dinh co can hoi Owner khong.
- [ ] Neu tao slice/PR quan trong, da tao/cap nhat work item trong `docs/PROJECT-COORDINATION.md`.

**Dieu kien chuyen sang B:**

- Slice ro, rui ro duoc gioi han, khong can Owner chot them.

---

### Giai doan B — Spec giao viec cho Implement

Spec gui sang luong Implement theo format:

```text
[Spec -> Implement handoff]

Target slice:
- ...

Base:
- branch/commit: ...

SoT files:
- ...

In scope:
- ...

Out of scope:
- ...

Acceptance checklist:
- ...

Verification required:
- ...

Must ask Spec before:
- ...

Current owner:
- Spec

Next owner:
- Implement

Next action:
- ...
```

**Checklist Giai doan B:**

- [ ] Handoff co target slice cu the.
- [ ] Handoff co base branch/commit.
- [ ] Handoff co day du SoT files.
- [ ] Handoff co in scope/out of scope.
- [ ] Handoff co acceptance checklist.
- [ ] Handoff co verification required.
- [ ] Handoff co danh sach "Must ask Spec before".
- [ ] Handoff co current owner, next owner, next action.
- [ ] Da gui handoff sang Implement thread.

**Dieu kien chuyen sang C:**

- Implement da nhan viec hoac da bat dau branch/PR.
- Implement phai bao lai Spec bang `[Implement -> Spec]` khi can review, gap blocker, hoac defer scope.
- Neu handoff den tu Review hoac co Review issue ID, Implement cung phai bao lai Review bang `[Implement -> Review]`.
- `docs/PROJECT-COORDINATION.md` da co next owner la Implement hoac report ghi ro vi sao slice khong can board entry.

---

### Giai doan C — Implement thi cong

Implement tu lam neu scope da ro.

Implement phai bao Spec neu:

- can doi schema/API lau dai ngoai SoT
- phat hien SoT thieu hoac mau thuan
- dung vao stock movement, payable, payment, cashbook, debt allocation
- can tao side effect khong nam trong slice
- can bo acceptance criteria vi qua lon

**Checklist Giai doan C:**

- [ ] Branch dung prefix `codex/`.
- [ ] PR neu co phai ghi SoT followed.
- [ ] Code khong mo scope ngoai handoff.
- [ ] Test moi phu hop rui ro slice.
- [ ] Verification da chay local.
- [ ] Known gaps duoc ghi ro, khong giau duoi UI.
- [ ] Neu co blocker, cau hoi gui Spec co option va de xuat.

**Dieu kien chuyen sang D:**

- Implement gui `[Implement -> Spec review request]` kem PR/commit/scope/test/gaps.
- Hoac Owner yeu cau Review kiem tra truoc khi Spec review.
- Neu slice lien quan Review issue ID, Implement da gui `[Implement -> Review]` hoac ghi ro chua san sang Review re-check.

---

### Giai doan D — Review/Spec gate

Neu Owner yeu cau hoac slice co rui ro, Review kiem tra truoc:

1. Doc scope/branch/PR hien tai.
2. Chay verification phu hop.
3. Ghi ro pass/fail, risk, drift, known gaps.
4. Gui bao cao cho Owner/Spec/Implement.

Sau do Spec review theo thu tu:

1. Doc handoff Implement gui lai.
2. Xem PR/diff.
3. So voi SoT va acceptance checklist.
4. Kiem tra khong co side effect ngoai scope.
5. Kiem tra test/CI.
6. Neu can, doi chieu KiotViet live/reference.

Phan loai finding:

- **Must fix before merge:** sai tien, kho, cong no, chung tu, schema, hoac trai quyet dinh Owner.
- **Follow-up acceptable:** thieu polish nhung khong sai du lieu va da ghi ro la foundation.
- **Future scope:** dung la nam ngoai slice da chot.

Spec phai gui ket qua review truc tiep lai Implement bang `[Spec -> Implement]`. Neu review lien quan issue Review giao, Spec cung phai gui `[Spec -> Review]` de Review re-check va cap nhat `docs/REVIEW-ISSUES.md`.

Ket qua review phai ghi ro:

- current owner
- next owner
- next action
- Owner decision needed

**Checklist Giai doan D:**

- [ ] Review da chay neu Owner yeu cau hoac slice co rui ro cao.
- [ ] Da doc PR/diff.
- [ ] Da doi chieu SoT.
- [ ] Da doi chieu acceptance checklist.
- [ ] Da kiem tra out of scope khong bi lam lan.
- [ ] Da kiem tra verification Implement bao cao.
- [ ] Da kiem tra CI neu co PR.
- [ ] Da ghi finding theo 3 muc: Must fix, Follow-up, Future scope.
- [ ] Da gui ket luan sang Implement.
- [ ] Da ghi next owner: Implement neu must-fix, Review neu can re-check, hoac Owner neu can quyet dinh.

**Dieu kien chuyen sang E:**

- Khong con Must fix before merge.
- CI/verification can thiet da xanh.

---

### Giai doan E — Merge va hau kiem

Implement merge khi:

- PR xanh.
- Spec/UX gate clear.
- Khong con Must fix.

Sau merge, Implement phai bao lai:

```text
[Implement -> Spec update]

Merged:
- PR:
- merge commit:

Post-merge verification:
- ...

Remaining notes:
- ...

Current owner:
- Implement

Next owner:
- Spec / Review / Owner

Next action:
- ...
```

**Checklist Giai doan E:**

- [ ] PR da merge vao `main`.
- [ ] Merge commit duoc ghi lai.
- [ ] Post-merge verification duoc chay neu can.
- [ ] Branch da cleanup neu phu hop.
- [ ] Known gaps con lai duoc ghi ro.
- [ ] Spec cap nhat queue/phase status neu can.

**Dieu kien chuyen sang F:**

- Spec da nhan merge update va khong co drift nghiep vu.
- `docs/PROJECT-COORDINATION.md` da duoc cap nhat/dong work item neu can.

---

### Giai doan F — Chon viec tiep theo

Spec tu chon viec tiep theo neu nam trong queue da chot.

Neu tiep theo co rui ro cao, Spec phai dung lai va hoi Owner truoc khi giao.

**Checklist Giai doan F:**

- [ ] Da xac dinh slice vua xong co can follow-up ngay khong.
- [ ] Da xem queue hien tai.
- [ ] Da xac dinh slice tiep theo.
- [ ] Da danh gia rui ro tien/kho/cong no/chung tu/schema.
- [ ] Neu rui ro thap: quay lai Giai doan A.
- [ ] Neu rui ro cao: hoi Owner bang cau hoi ngan, kem de xuat.

---

## 4. Dieu kien phai hoi Owner

Cac luong khong tu quyet neu gap mot trong cac truong hop:

- Co 2 cach nghiep vu deu dung nhung anh huong van hanh lau dai.
- Tao hoac sua logic tien, quy, cong no, stock movement, payable/payment/cashbook ma SoT chua ro.
- Doi schema/API nen tang kho sua sau nay.
- Muon bo acceptance criteria da chot.
- Muon mo module moi ngoai queue.
- KiotViet va QC-OMS co khac biet lon, can Owner chon cach di rieng.

---

## 5. Trang thai va queue hien tai

Trang thai sau PR #30:

- Da merge P1 Supplier foundation: PR #23, merge commit `ad19559`.
- Da merge P2 Purchase receipt draft/list/detail: PR #24, merge commit `0239061`.
- Da merge P3 Post purchase receipt normal items: PR #26, merge commit `2c87a6e`.
- Da merge Owner P5/P4 decision docs: PR #28, merge commit `0516a52`.
- Da tham khao KiotViet cho P5 ngay 2026-07-02: thanh toan NCC dung ma dang `PCPN...`, chi tiet phieu nhap co `Lich su thanh toan`, chi tiet NCC tab `No can tra nha cung cap` co action `Thanh toan`.
- Da merge P5 Supplier payments: PR #30, merge commit `afba242`.
- Slice tiep theo: P4 Roll/sheet purchase objects, nhung Spec phai doc Inventory object/lot model hien co truoc khi handoff.

Queue Purchase/Supplier uu tien:

1. **P2 Purchase receipt draft/list/detail** — done, merged PR #24
   - Normal items only.
   - Draft only.
   - No post.
   - No stock movement.
   - No supplier payable/payment/cashbook.
   - No latest purchase cost update.
   - Dung kho mac dinh trong MVP.
   - Co the nhap `paid_amount` de tinh con phai tra, nhung draft khong tao side effect so quy.
   - Quy tac sua ma `PN...` khi draft can check KiotViet truoc khi chot.

2. **P3 Post purchase receipt normal items** — done, merged PR #26
   - Co stock movement.
   - Co latest purchase cost.
   - Co supplier payable neu SoT da chot.
   - Phai review ky truoc merge.
   - Tang ton vao kho mac dinh.
   - Luon cap nhat gia nhap cuoi khi post.
   - Luu/giu lich su gia nhap de doi chieu.
   - Canh bao neu gia nhap thap hon gia nhap gan nhat/gia nen neu co.
   - Tao cong no NCC neu con phai tra > 0.
   - Cho phep con phai tra < 0 de the hien NCC no lai minh/tra thua.
   - Neu tra ngay, tao phieu chi/so quy trong transaction post.
   - Chuyen khoan uu tien STK/tai khoan ngan hang dung gan nhat, co lua chon tai khoan mac dinh hoac tai khoan khac.

3. **P5 Supplier payable/payment foundation** — done, merged PR #30
   - Tra tien NCC sau phieu nhap.
   - Nguoi dung chon phieu nhap cu the de tra.
   - Cho tra mot phan.
   - Khong cho tra thua trong P5.
   - Mot lan tra dung tien mat hoac chuyen khoan mot tai khoan.
   - Neu chuyen khoan, chon mot tai khoan ngan hang tu danh sach tai khoan dang co.
   - Ma phieu tra NCC dung prefix `PCPN...`.
   - UI co duong tra tu chi tiet NCC va chi tiet phieu nhap posted con no; ca hai mo cung mot form tra NCC bat buoc chon phieu nhap cu the.
   - Chi tiet phieu nhap posted co lich su thanh toan NCC toi thieu.

4. **P4 Roll/sheet purchase objects** — next, implement-ready after docs sync
   - Nhap cuon/tam theo vat ly.
   - Spec audit code 2026-07-02: dung bang `inventory_rolls` va `inventory_sheets` hien co, khong tao lot model moi trong P4 neu chua can.
   - Backend tu sinh ma ky thuat cho roll/sheet; UI khong bat nguoi dung quan ly ma tung cuon/tam.
   - Roll: tao mot `inventory_rolls` row moi cho moi cuon vat ly, tu batch cung thong so hoac danh sach chieu dai.
   - Sheet: MVP tao mot `inventory_sheets` row moi cho moi tam vat ly; nhap nhanh theo nhom kich thuoc/so tam.
   - Stock movement P4 phai gan `inventory_object_type` va object id tuong ung.
   - Da chot nen: cuon ho tro cung thong so va khac chieu dai; khong can ma tung cuon ruom ra.
   - Da chot nen: tam chu yeu cung kich thuoc, khong can ma tung tam, gia mua thuong theo tam.

5. **Production reconciliation readonly**
   - Chi doi soat doc-only.
   - Khong tu tru kho tu du lieu may san xuat neu Owner chua chot.

6. **UI Shell v1 / UI validation pass** — next after P4 MVP or earlier if Owner asks to inspect UI
   - SoT: `docs/02-PRD-UX-PhongCanh/System/00-UI-SHELL-V1.md`.
   - Muc tieu: chuan hoa shell, token, light/dark, responsive desktop/tablet/mobile, filter presets, button/chip rules.
   - Khong doi nghiep vu/backend neu khong bat buoc.
   - UI chi goi service/API; khong tu tinh ton kho/cong no/thanh toan that.
   - Can browser smoke de Owner xem workflow co dung cach van hanh thuc te khong.

---

## 6. Mau status ngan

Spec gui Owner khi can bao tien do:

```text
Trang thai:
- Dang o giai doan:
- Slice:
- PR/branch:
- Ket qua moi nhat:
- Blocker:
- Buoc tiep theo:
```

Review gui Owner/Spec/Implement sau khi kiem tra:

```text
[Review -> Owner/Spec/Implement]

Scope checked:
- ...

Commands run:
- ...

Result:
- ...

Findings:
- ...

Likely impact:
- ...

Recommended next action:
- ...

Review issue IDs:
- ...
```

Implement gui Spec khi xong slice:

```text
[Implement -> Spec review request]

Branch/PR/commit:
- ...

Scope implemented:
- ...

SoT followed:
- ...

Verification:
- ...

Known gaps:
- ...

Questions/blockers:
- ...
```

Spec gui Implement khi review xong:

```text
[Spec -> Implement review]

Result:
- Clear / Must fix / Follow-up acceptable

Findings:
- ...

Required before merge:
- ...

Allowed follow-up:
- ...

Next:
- ...
```

---

## 7. Quy tac chong lech quy dao

- Moi slice phai co checklist.
- Moi PR phai co SoT followed.
- Moi merge phai co merge update.
- Moi scope rui ro cao phai co Spec gate.
- Moi issue Review giao cho luong khac phai co entry trong `docs/REVIEW-ISSUES.md`.
- Moi issue da fix phai duoc Review re-check truoc khi dong.
- Khong "lam them cho tien" neu chua nam trong slice.
- Khong goi la xong neu chua co verification that.
- Khong de Owner lam dieu phoi hang ngay; Owner chi chot nghiep vu lon.
