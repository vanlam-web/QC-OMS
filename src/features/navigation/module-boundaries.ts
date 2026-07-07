import type { CurrentUserData } from '../../lib/api/types'
import { appRoutes } from '../../app/routes'

export const phaseOneModules = [
  { id: 'pos', label: 'POS', path: appRoutes.pos, permissions: ['perm.create_order'] },
  {
    id: 'sales-documents',
    label: 'Chứng từ bán hàng',
    path: appRoutes.salesDocuments,
    permissions: ['perm.create_order'],
  },
  { id: 'customers', label: 'Khách hàng', path: appRoutes.customers, permissions: ['perm.create_order'] },
  { id: 'suppliers', label: 'Nhà cung cấp', path: appRoutes.suppliers, permissions: ['perm.manage_inventory'] },
  {
    id: 'purchase-receipts',
    label: 'Nhập hàng',
    path: appRoutes.purchaseReceipts,
    permissions: ['perm.manage_inventory'],
  },
  { id: 'price-book', label: 'Bảng giá', path: appRoutes.priceBook, permissions: ['perm.edit_price_book'] },
  { id: 'inventory', label: 'Kho', path: appRoutes.inventory, permissions: ['perm.manage_inventory'] },
  { id: 'finance', label: 'Sổ quỹ', path: appRoutes.finance, permissions: ['perm.manage_finance'] },
  {
    id: 'reports',
    label: 'Báo cáo',
    path: appRoutes.reports,
    permissions: ['perm.manage_finance', 'perm.manage_inventory'],
    requireAllPermissions: true,
  },
] as const

export function canOpenModule(
  currentUser: CurrentUserData,
  module: (typeof phaseOneModules)[number],
) {
  if ('requireAllPermissions' in module && module.requireAllPermissions) {
    return module.permissions.every((permission) => currentUser.permissions.includes(permission))
  }
  return module.permissions.some((permission) => currentUser.permissions.includes(permission))
}
