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
  { label: 'Tổng quan', shortLabel: 'Tổng', path: '/dashboard', marker: 'TQ', permissions: [] },
  { label: 'POS', shortLabel: 'POS', path: '/pos', marker: 'POS', permissions: ['perm.create_order'] },
  {
    label: 'Chứng từ',
    shortLabel: 'CT',
    path: '/sales-documents',
    marker: 'CT',
    permissions: ['perm.create_order', 'perm.manage_finance'],
  },
  { label: 'Khách hàng', shortLabel: 'KH', path: '/customers', marker: 'KH', permissions: ['perm.create_order'] },
  { label: 'Bảng giá', shortLabel: 'Giá', path: '/products', marker: 'BG', permissions: ['perm.edit_price_book'] },
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
      <aside className="app-sidebar" aria-label="Thanh điều hướng">
        <div className="app-brand">
          <span aria-hidden="true">QC</span>
          <strong>QC-OMS</strong>
        </div>
        <nav aria-label="Điều hướng chính" className="sidebar-nav">
          {visibleItems.map((item) => (
            <NavLink className="sidebar-link" key={item.path} to={item.path} title={item.label}>
              <span aria-hidden="true" className="sidebar-link-icon">
                {item.marker}
              </span>
              <span className="sidebar-link-label">{item.label}</span>
              <span className="sidebar-link-short">{item.shortLabel}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-main-frame">
        <header className="app-topbar">
          <div>
            <p>{currentUser.organization.name}</p>
            <strong>{currentUser.user.display_name}</strong>
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <button className="button button-secondary" type="button" onClick={onSignOut}>
              Đăng xuất
            </button>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  )
}
