import type { Product } from '../catalog/types'

export interface CheckoutCartLine {
  id: string
  product: Product
  quantity: number
  width_m?: number
  height_m?: number
  linear_m?: number
  unitPrice: number
  discountAmount?: number
  priceSource: string
  isManualPrice: boolean
  recentPrices?: Array<{ unitPrice: number; soldAt: string; orderCode: string }>
  note?: string
}

export interface FinanceAccount {
  id: string
  code: string
  name: string
  account_type: 'cash' | 'bank'
  is_default_cash: boolean
  is_active: boolean
}

export interface CheckoutInput {
  customer_id?: string
  retail_debt_note?: string
  items: Array<{
    product_id: string
    quantity: number
    unit_price: number
    discount_amount?: number
    price_source: string
    note?: string
  }>
  payment: {
    cash_amount: number
    bank_amount: number
    bank_account_id?: string | null
    old_debt_payment_amount: number
    change_returned_amount: number
  }
}

export interface CheckoutResult {
  order: {
    id: string
    code: string
    order_type: 'invoice'
    status: 'completed'
    total_amount: number
    paid_amount: number
    debt_amount: number
    payment_status: 'unpaid' | 'partial' | 'paid'
  }
  payment_receipt: { id: string; code: string; total_received_amount: number } | null
  inventory_warnings: Array<{ product_id: string; code: string; message: string }>
}

export interface CustomerDebtDetail {
  customer_id: string
  total_debt: number
  invoices: Array<{
    order_id: string
    order_code: string
    total_amount: number
    paid_amount: number
    debt_amount: number
    remaining_debt: number
  }>
}

export interface RecentPriceList {
  items: Array<{ unitPrice: number; soldAt: string; orderCode: string }>
}
