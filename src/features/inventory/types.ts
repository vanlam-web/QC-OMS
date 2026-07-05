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

export interface MaterialOpeningConversionOption {
  unit_id: string
  code: string
  name: string
  stock_qty_per_unit: number
}

export interface MaterialOpeningOptions {
  product: {
    id: string
    code: string
    name: string
    inventory_shape: InventoryShape
    stock_unit: { id: string; code: string; name: string }
  }
  conversions: MaterialOpeningConversionOption[]
  warnings: string[]
}

export interface MaterialOpeningInput {
  product_id: string
  inventory_shape: 'normal'
  opened_unit_id: string
  opened_qty: number
  old_remaining_qty?: number
  note?: string
}

export interface MaterialOpeningResult {
  id: string
  product_id: string
  inventory_shape: 'normal'
  source_type: 'manual_normal'
  opened_unit_id: string
  opened_qty: number
  opened_stock_qty: number
  stock_movement_id: string | null
  warnings: string[]
  created_at: string
}

export interface PosShortagePreviewInput {
  product_id: string
  quantity: number
}

export interface PosShortageMaterial {
  product_id: string
  code: string
  name: string
  required_qty: number
  available_qty: number
  shortage_qty: number
  stock_unit: { id: string; code: string; name: string }
  inventory_shape: 'normal'
  quick_material_opening_supported: boolean
  conversion_options: MaterialOpeningConversionOption[]
}

export interface PosShortagePreview {
  product_id: string
  quantity: number
  source: 'product' | 'standard_bom'
  bom_id?: string
  shortages: PosShortageMaterial[]
  warnings: string[]
}
