import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { LogOut, ShoppingCart, UserCircle } from 'lucide-react'
import type { CurrentUserData } from '../../lib/api/types'
import { ThemeToggle } from './ThemeProvider'
import { appRoutes } from '../../app/routes'

interface ShellNavItem {
  label: string
  shortLabel: string
  path: string
  marker: string
  permissions: `perm.${string}`[]
  requireAllPermissions?: boolean
}

const shellNavItems: ShellNavItem[] = [
  { label: 'POS', shortLabel: 'POS', path: appRoutes.pos, marker: 'POS', permissions: ['perm.create_order'] },
  {
    label: 'Hóa đơn',
    shortLabel: 'HĐ',
    path: appRoutes.salesDocuments,
    marker: 'HĐ',
    permissions: ['perm.create_order', 'perm.manage_finance'],
  },
  { label: 'Sổ quỹ', shortLabel: 'SQ', path: appRoutes.finance, marker: 'SQ', permissions: ['perm.manage_finance'] },
  {
    label: 'Báo cáo',
    shortLabel: 'BC',
    path: appRoutes.reports,
    marker: 'BC',
    permissions: ['perm.manage_finance', 'perm.manage_inventory'],
    requireAllPermissions: true,
  },
  { label: 'Khách hàng', shortLabel: 'KH', path: appRoutes.customers, marker: 'KH', permissions: ['perm.create_order'] },
  { label: 'Hàng hóa', shortLabel: 'HH', path: appRoutes.products, marker: 'HH', permissions: ['perm.manage_inventory'] },
  { label: 'Kho', shortLabel: 'Kho', path: appRoutes.inventory, marker: 'K', permissions: ['perm.manage_inventory'] },
  { label: 'Bảng giá', shortLabel: 'Giá', path: appRoutes.priceBook, marker: 'BG', permissions: ['perm.edit_price_book'] },
  { label: 'Nhà cung cấp', shortLabel: 'NCC', path: appRoutes.suppliers, marker: 'NC', permissions: ['perm.manage_inventory'] },
  {
    label: 'Nhập hàng',
    shortLabel: 'NH',
    path: appRoutes.purchaseReceipts,
    marker: 'NH',
    permissions: ['perm.manage_inventory'],
  },
  { label: 'Quản trị', shortLabel: 'QT', path: appRoutes.admin, marker: 'QT', permissions: ['perm.access_admin_panel'] },
]

function canSeeNavItem(currentUser: CurrentUserData, item: ShellNavItem) {
  if (item.permissions.length === 0) return true
  if (item.requireAllPermissions) {
    return item.permissions.every((permission) => currentUser.permissions.includes(permission))
  }
  return item.permissions.some((permission) => currentUser.permissions.includes(permission))
}

export function AppShell({
  currentUser,
  children,
  onSignOut,
}: {
  currentUser: CurrentUserData
  children: ReactNode
  onSignOut: () => void
}) {
  const visibleItems = shellNavItems.filter((item) => canSeeNavItem(currentUser, item))
  const visibleNavItems = visibleItems.filter((item) => item.path !== appRoutes.pos)
  const canOpenPos = visibleItems.some((item) => item.path === appRoutes.pos)
  const [accountOpen, setAccountOpen] = useState(false)

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <NavLink aria-label="Mở tổng quan" className="app-brand" title="Logo" to={appRoutes.dashboard}>
          <span aria-hidden="true">QC</span>
        </NavLink>

        <nav aria-label="Điều hướng chính" className="shell-nav">
          {visibleNavItems.map((item) => (
            <NavLink className="shell-nav-link" key={item.path} to={item.path} title={item.label}>
              <span aria-hidden="true" className="shell-nav-marker">
                {item.marker}
              </span>
              <span className="shell-nav-label">{item.label}</span>
              <span className="shell-nav-short">{item.shortLabel}</span>
            </NavLink>
          ))}
        </nav>

        <div aria-label="Thao tác nhanh" className="shell-quick-actions">
          {canOpenPos ? (
            <NavLink aria-label="Mở POS" className="shell-pos-action" to={appRoutes.pos} title="Mở POS">
              <ShoppingCart aria-hidden="true" size={18} />
              <span>POS</span>
            </NavLink>
          ) : null}
        </div>
      </header>

      <div className="shell-action-rail">
        <div aria-label="Tài khoản và giao diện" className="shell-user-actions">
          <ThemeToggle />
          <div className="account-menu">
            <button
              aria-expanded={accountOpen}
              aria-label="Tài khoản"
              className="account-menu-trigger button button-secondary"
              title="Tài khoản"
              type="button"
              onClick={() => setAccountOpen((current) => !current)}
            >
              <UserCircle aria-hidden="true" size={20} />
            </button>
            {accountOpen ? (
              <div className="account-menu-popover" role="menu">
                <button role="menuitem" type="button" onClick={onSignOut}>
                  <LogOut aria-hidden="true" size={16} />
                  Đăng xuất
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="app-content">{children}</div>
    </div>
  )
}
