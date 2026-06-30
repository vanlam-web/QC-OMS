export type ProductStatus = 'active' | 'inactive'
export type SellMethod = 'quantity' | 'area_m2' | 'linear_m' | 'sheet' | 'combo'

export interface Product {
  id: string
  code: string
  name: string
  status: ProductStatus
  unit_name: string
  sell_method: SellMethod
}

export interface ProductListResponse {
  items: Product[]
  page: number
  page_size: number
  total: number
}

export interface ResolvedPrice {
  product_id: string
  unit_price: number
  price_source: 'default_price_list' | 'fallback_default_price_list'
  price_list_id: string
}

export interface ResolvePricesResponse {
  items: ResolvedPrice[]
}
