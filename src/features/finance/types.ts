export type FinanceAccountType = 'cash' | 'bank'
export type CashbookDirection = 'in' | 'out'
export type CashbookStatus = 'posted' | 'cancelled'
export type CashbookSourceType = 'payment_receipt_method' | 'cashbook_voucher'
export type VoucherSourceType = 'payment_receipt' | 'manual_voucher'
export type CashbookBusinessAccountedFilter = 'all' | 'true' | 'false'
export type CashbookSearchScope = 'all' | 'code' | 'note' | 'transfer_content'
export type CashbookColumnKey =
  | 'code'
  | 'created_at'
  | 'source_type'
  | 'counterparty'
  | 'finance_account'
  | 'amount_delta'
  | 'status'
  | 'note'
  | 'is_business_accounted'

export interface FinanceAccount {
  id: string
  code: string
  name: string
  account_type: FinanceAccountType
  is_default_cash: boolean
  is_active: boolean
}

export interface FinanceAccountListResponse {
  items: FinanceAccount[]
}

export interface CustomerDebtSummary {
  customer_id: string | null
  customer_code: string | null
  customer_name: string
  total_debt: number
  oldest_order_code: string | null
  open_invoice_count: number
}

export interface CustomerDebtListResponse {
  items: CustomerDebtSummary[]
  page: number
  page_size: number
  total: number
}

export interface CustomerDebtDetail {
  customer_id: string
  total_debt: number
  invoices: Array<{
    order_id: string
    order_code: string
    created_at: string
    total_amount: number
    paid_amount: number
    debt_amount: number
    remaining_debt: number
  }>
}

export interface DebtCollectionInput {
  customer_id: string
  amount: number
  payment_method: {
    cash_amount: number
    bank_amount: number
    bank_account_id?: string
    bank_transaction_ref?: string
  }
  note?: string
}

export interface DebtCollectionResult {
  payment_receipt_id: string
  allocated_amount: number
}

export interface CashbookBalance {
  finance_account_id: string
  code: string
  name: string
  account_type: FinanceAccountType
  balance: number
}

export interface CashbookBalanceListResponse {
  items: CashbookBalance[]
}

export interface CashbookEntry {
  id: string
  code: string
  status: CashbookStatus
  direction: CashbookDirection
  amount_delta: number
  finance_account: { id: string; code: string; name: string; account_type: FinanceAccountType }
  is_business_accounted: boolean
  source_type: CashbookSourceType
  created_at: string
  note: string | null
}

export interface CashbookListResponse {
  summary: {
    opening_balance: number
    total_in: number
    total_out: number
    ending_balance: number
  }
  items: CashbookEntry[]
  page: number
  page_size: number
  total: number
}

export interface PaymentReceiptAllocation {
  order_id: string
  order_code: string
  order_total_amount: number
  collected_before: number
  allocated_amount: number
  remaining_after: number
}

export interface CashbookEntryDetail extends CashbookEntry {
  created_by: { id: string; name: string }
  counterparty: { type: 'customer' | 'supplier' | 'employee' | 'other' | 'none'; name: string | null; phone: string | null }
  payment_method: 'cash' | 'bank_transfer' | 'manual'
  source: { type: 'payment_receipt' | 'manual_voucher'; id: string; code: string; order_code: string | null }
  allocations: PaymentReceiptAllocation[]
}

export interface CashbookVoucher {
  id: string
  code: string
  source_type: VoucherSourceType
  status: CashbookStatus
  amount: number
}

export interface CashbookVoucherListResponse {
  items: CashbookVoucher[]
  total: number
}
