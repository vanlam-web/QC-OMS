import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileMenu } from './ProfileMenu'

it('shows permission-allowed items and signs out', async () => {
  const onSignOut = vi.fn()
  render(
    <ProfileMenu
      displayName="Cashier"
      workstationCode="POS-01"
      permissions={['perm.view_shift_report']}
      onSignOut={onSignOut}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: '👤 Cashier / POS-01' }))
  expect(screen.getByRole('menuitem', { name: 'Báo cáo ca' })).toBeInTheDocument()
  expect(screen.queryByRole('menuitem', { name: 'Quản trị' })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('menuitem', { name: 'Đăng xuất' }))
  expect(onSignOut).toHaveBeenCalled()
})

it('closes on Escape', async () => {
  render(
    <ProfileMenu
      displayName="Cashier"
      workstationCode="POS-01"
      permissions={[]}
      onSignOut={vi.fn()}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: '👤 Cashier / POS-01' }))
  expect(screen.getByRole('menu')).toBeInTheDocument()
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})
