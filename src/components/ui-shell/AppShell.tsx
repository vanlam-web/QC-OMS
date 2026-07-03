import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { CurrentUserData } from '../../lib/api/types'
import { ThemeToggle } from './ThemeProvider'

interface ShellNavItem {
  label: string
  shortLabel: string
  path: string
  marker: string
  permissions: `perm.${string}`[]
}

const shellNavItems: ShellNavItem[] = [
  { label: 'POS', shortLabel: 'POS', path: '/pos', marker: 'POS', permissions: ['perm.create_order'] },
  {
    label: 'Chứng từ',
    shortLabel: 'CT',
    path: '/sales-documents',
    marker: 'CT',
    permissions: ['perm.create_order', 'perm.manage_finance'],
  },
  { label: 'Khách hàng', shortLabel: 'KH', path: '/customers', marker: 'KH', permissions: ['perm.create_order'] },
  { label: 'Hàng hóa', shortLabel: 'HH', path: '/products', marker: 'HH', permissions: ['perm.edit_price_book'] },
  { label: 'Bảng giá', shortLabel: 'Giá', path: '/price-book', marker: 'BG', permissions: ['perm.edit_price_book'] },
  { label: 'Nhà cung cấp', shortLabel: 'NCC', path: '/suppliers', marker: 'NC', permissions: ['perm.manage_inventory'] },
  { label: 'Phiếu nhập', shortLabel: 'PN', path: '/purchase/receipts', marker: 'PN', permissions: ['perm.manage_inventory'] },
  { label: 'Quản trị', shortLabel: 'QT', path: '/admin', marker: 'QT', permissions: ['perm.access_admin_panel'] },
]

function canSeeNavItem(currentUser: CurrentUserData, item: ShellNavItem) {
  return item.permissions.length === 0 || item.permissions.some((permission) => currentUser.permissions.includes(permission))
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

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <NavLink className="app-brand" to="/dashboard" aria-label="Tổng quan QC-OMS">
          <span aria-hidden="true">QC</span>
          <strong aria-hidden="true">QC-OMS</strong>
        </NavLink>

        <nav aria-label="Điều hướng chính" className="shell-nav">
          {visibleItems.map((item) => (
            <NavLink className="shell-nav-link" key={item.path} to={item.path} title={item.label}>
              <span aria-hidden="true" className="shell-nav-link-icon">
                {item.marker}
              </span>
              <span className="shell-nav-link-label">{item.label}</span>
              <span className="shell-nav-link-short">{item.shortLabel}</span>
            </NavLink>
          ))}
        </nav>

        <div className="topbar-actions">
          <ThemeToggle />
          <button
            aria-label={`Đăng xuất ${currentUser.user.display_name}`}
            className="button button-secondary account-action"
            title={`Đăng xuất ${currentUser.user.display_name}`}
            type="button"
            onClick={onSignOut}
          >
            <span aria-hidden="true">TK</span>
          </button>
        </div>
      </header>

      <div className="app-main-frame">
        <div className="app-content">{children}</div>
      </div>
    </div>
  )
}
