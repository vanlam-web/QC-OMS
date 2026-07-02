export type SupplierStatus = 'active' | 'inactive'

export interface SupplierLinkedCustomer {
  id: string
  code: string
  name: string
}

export interface Supplier {
  id: string
  code: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  tax_code: string | null
  linked_customer_id: string | null
  linked_customer: SupplierLinkedCustomer | null
  notes: string | null
  status: SupplierStatus
  current_payable_amount: number
  total_purchase_amount: number
}

export interface SupplierListResponse {
  items: Supplier[]
  page: number
  page_size: number
  total: number
}

export interface SupplierCustomerOption {
  id: string
  code: string
  name: string
  phone: string | null
}

export interface SupplierCustomerListResponse {
  items: SupplierCustomerOption[]
  page: number
  page_size: number
  total: number
}
