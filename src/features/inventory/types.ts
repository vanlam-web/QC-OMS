export type InventoryShape = 'normal' | 'roll' | 'sheet'
export type InventoryProductStatus = 'active' | 'inactive'
export type StocktakeStatus = 'draft' | 'balanced' | 'cancelled'

export interface InventoryProduct {
  product_id: string
  code: string
  name: string
  status: InventoryProductStatus
  inventory_shape: InventoryShape
  stock_unit: string
  available_qty: number
  is_negative: boolean
}

export interface InventoryProductListResponse {
  items: InventoryProduct[]
  page: number
  page_size: number
  total: number
}

export interface StockMovement {
  id: string
  product_id: string
  movement_type: string
  quantity_delta: number
  created_at: string
}

export interface StockMovementListResponse {
  items: StockMovement[]
  page: number
  page_size: number
  total: number
}

export interface Stocktake {
  id: string
  code: string
  status: StocktakeStatus
  source_type: 'manual' | 'product_edit'
  created_at: string
  balanced_at: string | null
  note: string | null
}

export interface StocktakeListResponse {
  items: Stocktake[]
  page: number
  page_size: number
  total: number
}
