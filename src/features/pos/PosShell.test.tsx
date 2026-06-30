import { render, screen } from '@testing-library/react'
import { PosShell } from './PosShell'

it('renders Phase 0 POS landmarks and profile identity', () => {
  render(
    <PosShell
      currentUser={{
        user: { id: 'u-1', email: 'cashier@example.test', display_name: 'Cashier' },
        organization: { id: 'o-1', code: 'VAN-LAM', name: 'Xưởng Văn Lâm' },
        workstation: null,
        permissions: ['perm.create_order'],
      }}
      onSignOut={vi.fn()}
      onOpenAdmin={vi.fn()}
      onOpenDashboard={vi.fn()}
    />,
  )

  expect(screen.getByLabelText('K01 topbar')).toBeInTheDocument()
  expect(screen.getByLabelText('K02 giỏ hàng')).toBeInTheDocument()
  expect(screen.getByLabelText('K03 thanh toán')).toBeInTheDocument()
  expect(screen.getByText('Đã kết nối')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '👤 Cashier' })).toBeInTheDocument()
  expect(screen.getByText('Chức năng bán hàng sẽ được mở ở giai đoạn sau.')).toBeInTheDocument()
})
