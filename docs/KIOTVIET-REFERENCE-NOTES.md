# KiotViet Reference Notes

> Last update: 2026-07-05
> Purpose: Record KiotViet-inspired UX ideas that fit QC-OMS, without copying unrelated retail modules.

## Direct UI Review

- Reviewed authenticated KiotViet UI opened by owner:
  - URL: `https://quangcaoinvanlam.kiotviet.vn/man/#/DashBoard`
  - Date: 2026-07-05
  - Mode: read-only review; no create/update/delete actions.

## What Fits QC-OMS

- Public KiotViet references checked:
  - Inventory/warehouse management: https://www.kiotviet.vn/huong-dan-su-dung-kiotviet/retail-thiet-lap/quan-ly-kho-hang/
  - Product list: https://www.kiotviet.vn/huong-dan-su-dung-kiotviet/retail-hang-hoa/danh-sach-hang-hoa/
  - Stocktake: https://www.kiotviet.vn/huong-dan-su-dung-kiotviet/retail-hang-hoa/kiem-kho/
  - Cashbook: https://www.kiotviet.vn/huong-dan-su-dung-kiotviet/retail-so-quy/so-quy/
  - Debt report: https://www.kiotviet.vn/wiki-ki-ot-viet/bao-cao-wiki/wiki-bao-cao-cong-no/
  - Combo/BOM-like goods: https://www.kiotviet.vn/huong-dan-su-dung-kiotviet/huong-dan-bar-cafe-nha-hang/danh-muc-hang-hoa-web-fnb/

- Reports should keep the same high-level buckets QC-OMS already added:
  - End-of-day report.
  - Sales report.
  - Customer debt report.
  - Inventory/product report.

- Cashbook should stay central and searchable:
  - Separate cash and bank views later.
  - Keep automatic entries from sales, debt collection, and purchase payments.
  - Add manual income/expense vouchers later only after current workflows are stable.

- Purchase/import workflow should remain connected to:
  - Supplier.
  - Inventory increase.
  - Supplier payable/debt.
  - Optional immediate payment.

- Customer debt should be easy to drill down:
  - Debt list by customer.
  - Detail by invoice.
  - Payment/collection history.
  - Later: top debt customers and debt aging.

- Reports should use practical filters:
  - Date range.
  - Payment method.
  - Customer/supplier.
  - Product/group later.

## UI Ideas Worth Adapting

- Product/inventory pages should stay table-first:
  - Fast search by code/name.
  - Status and inventory filters near the table.
  - Detail panel for selected product instead of forcing users into many pages.

- Inventory should support practical warehouse actions:
  - Stocktake list and stocktake detail.
  - Adjustment reason required for stock changes.
  - Movement history visible from product detail.
  - Later: multi-warehouse transfer only after single-warehouse workflow is stable.

- Cashbook should work like an operations ledger:
  - All cash/bank movements in one place.
  - Each entry tied to customer, supplier, sale, debt collection, or manual reason.
  - Manual receipt/payment vouchers added later with cancel/void flow.

- Customer debt should be owner-friendly:
  - Debt total by customer.
  - Drill down to invoices and payment history.
  - Quick collect action from customer debt detail.
  - Later: aging buckets such as due now, 7 days, 30 days.

- Reports should prioritize daily owner questions:
  - Today sold how much?
  - Collected how much money?
  - Who still owes money?
  - Which products/components are low or negative?

## Direct UI Findings

- Dashboard:
  - Shows today's sales result, revenue, returns, net revenue trend, top 10 best-selling products, top customers, and recent activity.
  - QC-OMS fit: add an owner dashboard after reports are stable.

- Product list:
  - Search by product code/name.
  - Filters include product group, brand, location, product type, business status, stock tracking, direct sale flag, created time.
  - Table columns include code, name, group, type, sell price, cost price, brand, stock, location, reserved/customer ordered quantity, created time, expected out-of-stock date, min/max stock level, status.
  - QC-OMS fit: keep current inventory table, later add reserved quantity, min/max stock, expected out-of-stock date, location.

- Cashbook:
  - Separate views for cash, bank, e-wallet, and total fund.
  - Has receipt/payment voucher actions.
  - Filters include voucher code, time, type, status, creator, staff, payer/receiver, phone, debt-impact options.
  - Summary cards include opening fund, total income, total expense, ending fund.
  - QC-OMS fit: upgrade finance UI with cash/bank/e-wallet tabs and manual receipt/payment vouchers.

- Customers:
  - Search by code/name/phone.
  - Table columns include customer code, name, phone, group, created date, last transaction date, current debt, total sales, net sales after returns, status.
  - QC-OMS fit: add customer list/detail outside finance debt screen; show debt and purchase history in one place.

- Invoices:
  - Search by invoice code, product code/name, customer, delivery code, order code, note.
  - Columns include invoice code, time, customer, seller, channel, total goods amount, discount, amount after discount, customer needs to pay, customer paid, remaining COD/receivable, delivery status, invoice status.
  - QC-OMS fit: improve sales document UI with payment status and receivable columns.

- Purchase/import:
  - Search by import voucher code, product, supplier, invoice number, delivery code, notes.
  - Columns include import code, time, supplier code/name, importer, total quantity, item count, total goods amount, discount, amount payable to supplier, paid supplier amount, status, input invoice number.
  - QC-OMS fit: purchase module should connect supplier payable, inventory increase, and payment.

## What Should Not Be Copied Yet

- Online sales channels.
- Loyalty/points/campaigns.
- Payroll/commission.
- E-invoice/tax accounting.
- Marketplace/channel reports.
- Full financial profit report with cost accounting before cost rules are complete.

## Suggested Backlog

- [ ] Split cashbook into tabs: all, cash, bank.
- [ ] Add manual cashbook voucher create/cancel.
- [ ] Add debt aging and top debt customers.
- [ ] Add report drilldown from KPI card to detail table.
- [ ] Add supplier debt/payable report.
- [ ] Add inventory value report after cost method is stable.
- [ ] Add export CSV/Excel for reports.
- [ ] Add quick links from reports to source rows: invoice, customer debt, product inventory.
- [ ] Add stocktake detail screen with counted quantity, expected quantity, difference, and status.
- [ ] Add supplier debt/payable report after purchase workflow is connected.
- [ ] Add owner dashboard: sales today, net revenue, top products, top customers, recent activity.
- [ ] Add reserved/customer ordered quantity to inventory product list.
- [ ] Add min/max stock levels and expected out-of-stock date.
- [ ] Add product storage location field.
- [ ] Add customer list/detail with current debt, total sales, and last transaction date.
- [ ] Add sales document payment status columns: customer needs to pay, customer paid, remaining receivable.
- [ ] Add purchase/import UI connected to supplier payable and inventory increase.
