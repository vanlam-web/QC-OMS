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
  const onOpenCatalog = vi.fn()
  const onOpenSalesDocuments = vi.fn()
  const onSignOut = vi.fn()

  render(
    <DashboardPage
      currentUser={currentUser}
      onOpenPos={onOpenPos}
      onOpenAdmin={onOpenAdmin}
      onOpenCatalog={onOpenCatalog}
      onOpenSalesDocuments={onOpenSalesDocuments}
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
  expect(onOpenCatalog).not.toHaveBeenCalled()
  expect(onOpenSalesDocuments).not.toHaveBeenCalled()
  expect(onSignOut).toHaveBeenCalled()
})

it('disables modules when the account lacks the matching permission', () => {
  render(
    <DashboardPage
      currentUser={{ ...currentUser, permissions: [] }}
      onOpenPos={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenCatalog={vi.fn()}
      onOpenSalesDocuments={vi.fn()}
      onSignOut={vi.fn()}
    />,
  )

  expect(screen.getByRole('button', { name: 'POS' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Quản trị' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Bảng giá' })).toBeDisabled()
})

it('enables product catalog for accounts with edit price book permission', async () => {
  const onOpenCatalog = vi.fn()
  render(
    <DashboardPage
      currentUser={{ ...currentUser, permissions: ['perm.edit_price_book'] }}
      onOpenPos={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenCatalog={onOpenCatalog}
      onOpenSalesDocuments={vi.fn()}
      onSignOut={vi.fn()}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: 'Bảng giá' }))
  expect(onOpenCatalog).toHaveBeenCalled()
})

it('opens sales documents for sales or finance accounts', async () => {
  const onOpenSalesDocuments = vi.fn()
  render(
    <DashboardPage
      currentUser={{ ...currentUser, permissions: ['perm.create_order'] }}
      onOpenPos={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenCatalog={vi.fn()}
      onOpenSalesDocuments={onOpenSalesDocuments}
      onSignOut={vi.fn()}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: 'Chứng từ bán hàng' }))
  expect(onOpenSalesDocuments).toHaveBeenCalled()
})
