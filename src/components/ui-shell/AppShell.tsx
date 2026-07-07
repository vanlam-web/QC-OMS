import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Bell, LogOut, Settings, ShoppingCart, UserCircle } from 'lucide-react'
import type { CurrentUserData } from '../../lib/api/types'
import { ThemeToggle } from './ThemeProvider'

interface ShellNavItem {
  label: string
  shortLabel: string
  path: string
  marker: string
  permissions: `perm.${string}`[]
  requireAllPermissions?: boolean
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
  { label: 'Sổ quỹ', shortLabel: 'SQ', path: '/finance', marker: 'SQ', permissions: ['perm.manage_finance'] },
  {
    label: 'Báo cáo',
    shortLabel: 'BC',
    path: '/reports',
    marker: 'BC',
    permissions: ['perm.manage_finance', 'perm.manage_inventory'],
    requireAllPermissions: true,
  },
  { label: 'Khách hàng', shortLabel: 'KH', path: '/customers', marker: 'KH', permissions: ['perm.create_order'] },
  { label: 'Hàng hóa', shortLabel: 'HH', path: '/products', marker: 'HH', permissions: ['perm.manage_inventory'] },
  { label: 'Bảng giá', shortLabel: 'Giá', path: '/price-book', marker: 'BG', permissions: ['perm.edit_price_book'] },
  { label: 'Nhà cung cấp', shortLabel: 'NCC', path: '/suppliers', marker: 'NC', permissions: ['perm.manage_inventory'] },
  { label: 'Nhập hàng', shortLabel: 'NH', path: '/purchase/receipts', marker: 'NH', permissions: ['perm.manage_inventory'] },
  { label: 'Quản trị', shortLabel: 'QT', path: '/admin', marker: 'QT', permissions: ['perm.access_admin_panel'] },
]

function canSeeNavItem(currentUser: CurrentUserData, item: ShellNavItem) {
  if (item.permissions.length === 0) return true
  if (item.requireAllPermissions) {
    return item.permissions.every((permission) => currentUser.permissions.includes(permission))
  }
  return item.permissions.some((permission) => currentUser.permissions.includes(permission))
}

function accountLabel(currentUser: CurrentUserData) {
  return currentUser.user.display_name.trim() || currentUser.user.email
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
  const visibleNavItems = visibleItems.filter((item) => item.path !== '/pos' && item.path !== '/admin')
  const canOpenPos = visibleItems.some((item) => item.path === '/pos')
  const canOpenAdmin = visibleItems.some((item) => item.path === '/admin')
  const currentAccountLabel = accountLabel(currentUser)
  const [accountOpen, setAccountOpen] = useState(false)

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <NavLink aria-label="Mở tổng quan" className="app-brand" title="Logo" to="/dashboard">
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
          <div aria-label="Tài khoản và giao diện" className="shell-user-actions">
            <button aria-label="Thông báo" className="management-icon-button" title="Thông báo" type="button">
              <Bell aria-hidden="true" size={18} />
            </button>
            <button aria-label="Cài đặt" className="management-icon-button" title="Cài đặt" type="button">
              <Settings aria-hidden="true" size={18} />
            </button>
            <ThemeToggle />
            <div className="account-menu">
              <button
                aria-expanded={accountOpen}
                aria-label="Tài khoản"
                className="account-menu-trigger management-icon-button"
                title="Tài khoản"
                type="button"
                onClick={() => setAccountOpen((current) => !current)}
              >
                <UserCircle aria-hidden="true" size={20} />
              </button>
              {accountOpen ? (
                <div className="account-menu-popover" role="menu">
                  <NavLink className="account-menu-profile" role="menuitem" to="/account">
                    <span aria-hidden="true" className="account-menu-profile-avatar">
                      <UserCircle size={20} />
                    </span>
                    <span className="account-menu-profile-label" title={currentAccountLabel}>
                      {currentAccountLabel}
                    </span>
                  </NavLink>
                  {canOpenAdmin ? (
                    <NavLink className="button button-secondary" role="menuitem" to="/admin">
                      <Settings aria-hidden="true" size={16} />
                      Quản trị
                    </NavLink>
                  ) : null}
                  <button className="button button-secondary" role="menuitem" type="button" onClick={onSignOut}>
                    <LogOut aria-hidden="true" size={16} />
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          {canOpenPos ? (
            <NavLink aria-label="Mở POS" className="shell-pos-action" to="/pos" title="Mở POS">
              <ShoppingCart aria-hidden="true" size={18} />
              <span>POS</span>
            </NavLink>
          ) : null}
        </div>
      </header>

      <div className="app-content">{children}</div>
    </div>
  )
}
