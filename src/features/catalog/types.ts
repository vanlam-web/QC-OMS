export type ProductStatus = 'active' | 'inactive'
export type SellMethod = 'quantity' | 'area_m2' | 'linear_m' | 'sheet' | 'combo'

export interface Product {
  id: string
  code: string
  name: string
  status: ProductStatus
  unit_name: string
  sell_method: SellMethod
  latest_purchase_cost?: number | null
  latest_purchase_cost_at?: string | null
  inventory_shape?: 'normal' | 'roll' | 'sheet'
}

export interface ProductBomItem {
  id: string
  component_product_id: string
  component_product: { id: string; code: string; name: string; unit_name: string }
  quantity: number
  sort_order: number
  notes: string | null
}

export interface ProductBom {
  id: string
  product_id: string
  version: number
  status: 'active' | 'archived'
  notes: string | null
  created_at: string
  items: ProductBomItem[]
}

export interface ProductListResponse {
  items: Product[]
  page: number
  page_size: number
  total: number
}

export interface CustomerGroup {
  id: string
  code: string
  name: string
  price_list_id: string
  is_active: boolean
}

export interface Customer {
  id: string
  code: string
  name: string
  phone: string | null
  tax_code: string | null
  address: string | null
  customer_group_id: string | null
  customer_group: { id: string; code: string; name: string } | null
  created_by?: { id: string; name: string } | null
  created_at?: string
  total_sales_amount?: number
  total_debt_amount?: number
}

export interface CustomerListResponse {
  items: Customer[]
  page: number
  page_size: number
  total: number
}

export interface ResolvedPrice {
  product_id: string
  unit_price: number
  price_source:
    | 'default_price_list'
    | 'customer_group_price_list'
    | 'fallback_default_price_list'
    | 'latest_purchase_cost'
    | 'latest_purchase_cost_missing_zero'
    | 'price_formula'
    | 'price_formula_missing_cost_zero'
  price_list_id: string
}

export interface ResolvePricesResponse {
  items: ResolvedPrice[]
}

export interface PriceList {
  id: string
  code: string
  name: string
  is_default: boolean
  is_active: boolean
}

export interface PriceListResponse {
  items: PriceList[]
}

export interface PriceFormulaInput {
  name: string
  product_filter: {
    status: 'active'
    name_contains?: string
    code_contains?: string
    sell_method?: SellMethod
  }
  cost_formula: { type: 'fixed'; amount: number } | { type: 'amount_plus_percent'; amount: number; percent_of_latest_purchase_cost: number }
  profit_formula:
    | { type: 'fixed'; amount: number }
    | {
        type: 'tiers'
        tiers: Array<{ operator: '<' | '<=' | '>' | '>=' | '='; value: number; amount: number; percent?: number }>
      }
  price_list_adjustments: Record<string, { type: 'amount'; amount: number } | { type: 'percent'; percent: number }>
}

export interface PriceFormulaPreviewPrice {
  price_list_id: string
  price_list_name: string
  current_unit_price: number | null
  computed_unit_price: number
  delta: number | null
}

export interface PriceFormulaPreviewItem {
  product_id: string
  product_code: string
  product_name: string
  latest_purchase_cost: number
  current_mode: 'manual' | 'formula' | null
  current_unit_price: number | null
  computed_prices: PriceFormulaPreviewPrice[]
}

export interface PriceFormulaPreview {
  affected_count: number
  items: PriceFormulaPreviewItem[]
}

export interface PriceFormulaApplyResult {
  formula_rule_id: string
  affected_count: number
}
