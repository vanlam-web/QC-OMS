import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardPage } from './DashboardPage'
import type { CurrentUserData } from '../../lib/api/types'

const currentUser: CurrentUserData = {
  user: { id: 'u-1', email: 'admin@qc.local', display_name: 'Admin' },
  organization: { id: 'o-1', code: 'VAN-LAM', name: 'Văn Lâm' },
  workstation: null,
  permissions: ['perm.create_order', 'perm.access_admin_panel'],
}

it('shows account-based modules without requiring a POS machine', async () => {
  const onOpenPos = vi.fn()
  const onOpenAdmin = vi.fn()
  const onOpenPriceBook = vi.fn()
  const onOpenSalesDocuments = vi.fn()
  const onOpenSuppliers = vi.fn()
  const onOpenPurchaseReceipts = vi.fn()
  const onSignOut = vi.fn()

  render(
    <DashboardPage
      currentUser={currentUser}
      onOpenPos={onOpenPos}
      onOpenAdmin={onOpenAdmin}
      onOpenPriceBook={onOpenPriceBook}
      onOpenSalesDocuments={onOpenSalesDocuments}
      onOpenSuppliers={onOpenSuppliers}
      onOpenPurchaseReceipts={onOpenPurchaseReceipts}
      onSignOut={onSignOut}
    />,
  )

  expect(screen.getByRole('heading', { name: 'QC-OMS' })).toBeInTheDocument()
  expect(screen.getByText('Admin')).toBeInTheDocument()
  expect(screen.queryByText('POS-01')).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'POS' }))
  await userEvent.click(screen.getByRole('button', { name: 'Quản trị' }))
  await userEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }))

  expect(onOpenPos).toHaveBeenCalled()
  expect(onOpenAdmin).toHaveBeenCalled()
  expect(onOpenPriceBook).not.toHaveBeenCalled()
  expect(onOpenSalesDocuments).not.toHaveBeenCalled()
  expect(onOpenSuppliers).not.toHaveBeenCalled()
  expect(onOpenPurchaseReceipts).not.toHaveBeenCalled()
  expect(onSignOut).toHaveBeenCalled()
})

it('disables modules when the account lacks the matching permission', () => {
  render(
    <DashboardPage
      currentUser={{ ...currentUser, permissions: [] }}
      onOpenPos={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenPriceBook={vi.fn()}
      onOpenSalesDocuments={vi.fn()}
      onOpenSuppliers={vi.fn()}
      onOpenPurchaseReceipts={vi.fn()}
      onSignOut={vi.fn()}
    />,
  )

  expect(screen.getByRole('button', { name: 'POS' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Quản trị' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Bảng giá' })).toBeDisabled()
})

it('opens the dedicated price book route for accounts with edit price book permission', async () => {
  const onOpenPriceBook = vi.fn()
  render(
    <DashboardPage
      currentUser={{ ...currentUser, permissions: ['perm.edit_price_book'] }}
      onOpenPos={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenPriceBook={onOpenPriceBook}
      onOpenSalesDocuments={vi.fn()}
      onOpenSuppliers={vi.fn()}
      onOpenPurchaseReceipts={vi.fn()}
      onSignOut={vi.fn()}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: 'Bảng giá' }))
  expect(onOpenPriceBook).toHaveBeenCalled()
})

it('opens sales documents for sales or finance accounts', async () => {
  const onOpenSalesDocuments = vi.fn()
  render(
    <DashboardPage
      currentUser={{ ...currentUser, permissions: ['perm.create_order'] }}
      onOpenPos={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenPriceBook={vi.fn()}
      onOpenSalesDocuments={onOpenSalesDocuments}
      onOpenSuppliers={vi.fn()}
      onOpenPurchaseReceipts={vi.fn()}
      onSignOut={vi.fn()}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: 'Chứng từ bán hàng' }))
  expect(onOpenSalesDocuments).toHaveBeenCalled()
})

it('opens suppliers for inventory accounts', async () => {
  const onOpenSuppliers = vi.fn()
  render(
    <DashboardPage
      currentUser={{ ...currentUser, permissions: ['perm.manage_inventory'] }}
      onOpenPos={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenPriceBook={vi.fn()}
      onOpenSalesDocuments={vi.fn()}
      onOpenSuppliers={onOpenSuppliers}
      onOpenPurchaseReceipts={vi.fn()}
      onSignOut={vi.fn()}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: 'Nhà cung cấp' }))
  expect(onOpenSuppliers).toHaveBeenCalled()
})

it('opens purchase receipts for inventory accounts', async () => {
  const onOpenPurchaseReceipts = vi.fn()
  render(
    <DashboardPage
      currentUser={{ ...currentUser, permissions: ['perm.manage_inventory'] }}
      onOpenPos={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenPriceBook={vi.fn()}
      onOpenSalesDocuments={vi.fn()}
      onOpenSuppliers={vi.fn()}
      onOpenPurchaseReceipts={onOpenPurchaseReceipts}
      onSignOut={vi.fn()}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: 'Phiếu nhập' }))
  expect(onOpenPurchaseReceipts).toHaveBeenCalled()
})
