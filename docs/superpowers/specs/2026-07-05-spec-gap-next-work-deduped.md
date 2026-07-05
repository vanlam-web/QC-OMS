# Spec Gap Next Work — Deduped

> Ngay lap: 2026-07-05
> Nhanh: `codex/spec-docs`
> Trang thai: Draft dieu phoi da dong bo voi main local sau commit `68f3cff`

## 1. Nguyen tac loc trung

Khong viet lai cac noi dung da co trong:

- `docs/DEVELOPMENT-PLAN.md`
- `docs/PHASE-CHECKLIST.md`
- `docs/superpowers/specs/2026-06-30-qc-oms-spec-gap-backlog.md`
- Source of Truth cac tang `02-PRD-UX`, `03-BUSINESS`, `04-DATABASE`, `05-BACKEND`

File nay chi giu nhung viec con thieu o muc **implementation bridge**: noi giua dac ta da co va viec code can lam, de tranh AI sau viet lai roadmap hoac lam trung module.

## 1B. Checklist hien trang

- [x] Loai viec trung voi roadmap/checklist cu.
- [x] Tao Inventory UI implementation bridge.
- [x] Sync SalesDocuments docs theo filter/detail hien tai.
- [x] Tao Finance UI implementation bridge.
- [x] Tao Reports API/UI bridge.
- [x] Bo sung Business Inventory ve ton tam m2, chuan hoa dan, khui vat tu, tam/reo.
- [x] Dong bo docs vao main local trong commit `68f3cff`.
- [ ] Push `main` len remote.
- [ ] Owner review lai docs sau khi push.

## 2. Viec da loai vi trung

| Viec | Ly do loai |
|---|---|
| Viet lai roadmap Phase 0-8 | Da co trong `docs/DEVELOPMENT-PLAN.md` |
| Viet lai checklist phase | Da co trong `docs/PHASE-CHECKLIST.md` |
| Viet lai Sales/POS checkout, debt, cashbook foundation | Da co Business/DB/API va da implement qua cac phase truoc |
| Viet lai Inventory policy tong | Da co Business Inventory, Database Inventory va Backend Inventory API |
| Viet lai Production queue draft | Da co `2026-07-01-production-queue-contract-draft.md`; chi can chuyen thanh SoT khi bat dau phase |
| Viet lai BOM boundary draft | Da co `2026-07-01-bom-combo-mvp-boundary-draft.md`; chua nen implement sau khi chua toi phase |
| Viet lai Bill/Printer/Messaging draft | Da co `2026-07-01-bill-printer-messaging-draft.md` |
| Viet lai Production/Backup baseline | Da co `docs/07-DEPLOYMENT-TrienKhai/PRODUCTION.md` va `BACKUP-RESTORE.md` |
| Mo scope Dat hang, Tra hang, COD, Van don, HDĐT, VAT, HR, campaign retail | Da bi loai trong MVP scope |

## 3. Viec con nen dac ta tiep

### P0 — Inventory UI implementation bridge

Trang thai hien tai: da tao bridge va main local da co Inventory UI baseline.

Ly do giu: docs hien co chu yeu la SoT nghiep vu/API. Bridge noi ro UI dung API nao, page nao lam truoc, field nao co that, field nao an lai.

Can dac ta:

- route/page Inventory nao lam trong lat cat dau
- filter, search, table columns, footer/tong
- mapping API hien co sang UI
- trang thai loading/empty/error
- phan nao chi doc, phan nao duoc sua
- phan nao khong lam: BOM sau, production auto stock, purchase object nang cao neu chua du du lieu

Output de xuat:

- `docs/superpowers/specs/2026-07-05-inventory-ui-implementation-bridge.md`

Da lam:

- [x] `docs/superpowers/specs/2026-07-05-inventory-ui-implementation-bridge.md`
- [x] Main local co `/inventory`, list, detail, movement history va normal stock adjustment UI.

### P1 — SalesDocuments docs sync

Ly do giu: code SalesDocuments moi duoc sua filter/detail/UI. Docs can khop lai de AI sau khong them lai field da bo hoac goi API history khi chua co du lieu.

Can dac ta/cap nhat:

- filter hien tai: thoi gian, trang thai thanh toan, phuong thuc thanh toan, nguoi ban/nguoi tao, bang gia
- nhung filter KiotViet bi bo vi QC-OMS khong co schema/du lieu
- tab lich su thanh toan hien thi nhung chua goi API history
- chi tiet readonly, mo bang click row, khong lam sua/huy trong lat cat nay

Output de xuat:

- cap nhat `docs/02-PRD-UX-PhongCanh/SalesDocuments/01-SALES-DOCUMENT-LIST.md`
- cap nhat `docs/02-PRD-UX-PhongCanh/SalesDocuments/02-SALES-DOCUMENT-DETAIL.md`

Da sync:

- [x] filter hien tai, nguoi ban/nguoi tao gom mot, tab lich su thanh toan chua goi API rieng.

### P2 — Finance UI implementation bridge

Ly do giu: Business/DB/API Finance da co, nhung UI implement can noi ro trang nao dung du lieu nao de khong bi lan sang ke toan thue hoac module mua dich vu rieng.

Can dac ta:

- Cashbook list/filter/footer
- Customer debt list/detail/receipt flow
- Reconciliation layout va nguon so lieu
- payment method/finance account selector dung chung
- phan khong lam: vi dien tu, QR bank partner, VAT/HDĐT, so ke toan thue

Output de xuat:

- `docs/superpowers/specs/2026-07-05-finance-ui-implementation-bridge.md`

Da lam:

- [x] `docs/superpowers/specs/2026-07-05-finance-ui-implementation-bridge.md`
- [x] Main local co `/finance`, accounts/cashbook, customer debt, debt collection form va voucher readonly list.

### P3 — Reports API/UI bridge

Ly do giu: Reports co PRD, nhung chua co cau noi API/data source. Neu implement ngay de bi moi module tu tinh khac nhau.

Can dac ta:

- bao cao dau tien: End of Day
- data source: orders, payments, cashbook, debt, stock movements
- so nao la chinh thuc, so nao tam thoi khi Purchase/gia von chua du
- filter thoi gian mac dinh va cach tranh mat du lieu vi `Thang nay`
- khong lam: kenh ban, VAT/HDĐT, HR/hoa hong, nhan khau hoc retail

Output de xuat:

- `docs/superpowers/specs/2026-07-05-reports-api-ui-bridge.md`

Da lam:

- [x] `docs/superpowers/specs/2026-07-05-reports-api-ui-bridge.md`
- [x] Main local co `/reports`, End of Day, Sales, Debt va Inventory report baseline.

## 4. Viec de sau, chua viet tiep bay gio

| Viec | Ly do |
|---|---|
| BOM UI/API/schema chi tiet | Da co draft boundary; doi toi phase BOM de chot theo du lieu thuc |
| Production queue SoT day du | Da co draft; doi khi bat dau ingestion/realtime day du |
| Bill advanced/messaging SoT | Da co draft; doi sau SalesDocuments/Bill print nhu cau ro hon |
| Purchase roll/sheet object P4 | Doi Inventory object model on dinh hon |
| Production hardening checklist | Doi ha tang production that ro cong cu monitoring/alert |

## 5. Thu tu de xuat sau khi loc trung

1. Inventory UI implementation bridge.
2. SalesDocuments docs sync.
3. Finance UI implementation bridge.
4. Reports API/UI bridge.

`docs/IMPLEMENTATION-CHECKLIST.md` hien da duoc luong implement commit trong `68f3cff`; file nay chi giu checklist dac ta/dieu phoi de tranh trung roadmap.
