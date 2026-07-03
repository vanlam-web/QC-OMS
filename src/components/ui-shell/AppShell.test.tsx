import { MemoryRouter } from 'react-router-dom'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppShell } from './AppShell'
import { ThemeProvider } from './ThemeProvider'
import type { CurrentUserData } from '../../lib/api/types'

const inventoryUser: CurrentUserData = {
  user: { id: 'u-1', email: 'owner@qc.local', display_name: 'Owner' },
  organization: { id: 'o-1', code: 'QC', name: 'QC OMS' },
  workstation: null,
  permissions: ['perm.manage_inventory'],
}

const fullNavigationUser: CurrentUserData = {
  ...inventoryUser,
  permissions: [
    'perm.create_order',
    'perm.manage_finance',
    'perm.manage_inventory',
    'perm.edit_price_book',
    'perm.access_admin_panel',
  ],
}

const priceBookUser: CurrentUserData = {
  ...inventoryUser,
  permissions: ['perm.edit_price_book'],
}

function renderShell(initialPath = '/purchase/receipts', currentUser = inventoryUser) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <AppShell currentUser={currentUser} onSignOut={vi.fn()}>
          <main>
            <h1>Phiếu nhập</h1>
          </main>
        </AppShell>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

it('renders adaptive navigation with purchase supplier entries and active route', () => {
  renderShell()

  expect(screen.getByRole('banner')).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Điều hướng chính' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Nhà cung cấp/i })).toHaveAttribute('href', '/suppliers')
  expect(screen.getByRole('link', { name: /Phiếu nhập/i })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('heading', { name: 'Phiếu nhập' })).toBeInTheDocument()
})

it('renders POS as a normal item in the top module navigation', () => {
  renderShell('/pos', fullNavigationUser)

  const banner = screen.getByRole('banner')
  const navigation = screen.getByRole('navigation', { name: 'Điều hướng chính' })

  expect(banner).toContainElement(navigation)
  expect(screen.getByRole('link', { name: 'Tổng quan QC-OMS' })).toHaveAttribute('href', '/dashboard')
  expect(within(navigation).queryByRole('link', { name: /Tổng quan/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('navigation', { name: 'Thao tác nhanh' })).not.toBeInTheDocument()

  expect(within(navigation).getByRole('link', { name: /POS/i })).toHaveAttribute('href', '/pos')
  expect(within(navigation).getByRole('link', { name: /POS/i })).toHaveAttribute('aria-current', 'page')
  expect(within(navigation).getByRole('link', { name: /Chứng từ/i })).toHaveAttribute('href', '/sales-documents')
  expect(within(navigation).getByRole('link', { name: /Khách hàng/i })).toHaveAttribute('href', '/customers')
  expect(within(navigation).getByRole('link', { name: /Hàng hóa/i })).toHaveAttribute('href', '/products')
  expect(within(navigation).getByRole('link', { name: /Bảng giá/i })).toHaveAttribute('href', '/price-book')
  expect(within(navigation).getByRole('link', { name: /Nhà cung cấp/i })).toHaveAttribute('href', '/suppliers')
  expect(within(navigation).getByRole('link', { name: /Phiếu nhập/i })).toHaveAttribute('href', '/purchase/receipts')
  expect(within(navigation).getByRole('link', { name: /Quản trị/i })).toHaveAttribute('href', '/admin')
  expect(within(navigation).queryByRole('button', { name: /Đổi sang giao diện/i })).not.toBeInTheDocument()
})

it('keeps theme toggle visible inside shell', async () => {
  renderShell()

  await userEvent.click(screen.getByRole('button', { name: 'Đổi sang giao diện tối' }))

  expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
})

it('routes the price book nav item to the dedicated price book page', () => {
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/price-book']}>
        <AppShell currentUser={priceBookUser} onSignOut={vi.fn()}>
          <main>
            <h1>Bảng giá</h1>
          </main>
        </AppShell>
      </MemoryRouter>
    </ThemeProvider>,
  )

  expect(screen.getByRole('link', { name: /Bảng giá/i })).toHaveAttribute('href', '/price-book')
  expect(screen.getByRole('link', { name: /Bảng giá/i })).toHaveAttribute('aria-current', 'page')
})
