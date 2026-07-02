import type { CurrentUserData } from '../../lib/api/types'

export const phaseOneModules = [
  { id: 'pos', label: 'POS', path: '/pos', permissions: ['perm.create_order'] },
  {
    id: 'sales-documents',
    label: 'Chứng từ bán hàng',
    path: '/sales-documents',
    permissions: ['perm.create_order'],
  },
  { id: 'customers', label: 'Khách hàng', path: '/customers', permissions: ['perm.create_order'] },
  { id: 'suppliers', label: 'Nhà cung cấp', path: '/suppliers', permissions: ['perm.manage_inventory'] },
  { id: 'purchase-receipts', label: 'Phiếu nhập', path: '/purchase/receipts', permissions: ['perm.manage_inventory'] },
  { id: 'price-book', label: 'Bảng giá', path: '/price-book', permissions: ['perm.edit_price_book'] },
  { id: 'inventory', label: 'Kho', path: '/inventory', permissions: ['perm.manage_inventory'] },
  { id: 'finance', label: 'Tài chính', path: '/finance', permissions: ['perm.manage_finance'] },
] as const

export function canOpenModule(
  currentUser: CurrentUserData,
  module: (typeof phaseOneModules)[number],
) {
  return module.permissions.some((permission) => currentUser.permissions.includes(permission))
}
