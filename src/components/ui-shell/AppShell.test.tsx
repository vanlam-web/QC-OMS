import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
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

function renderShell(initialPath = '/purchase/receipts') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <AppShell currentUser={inventoryUser} onSignOut={vi.fn()}>
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

it('keeps theme toggle visible inside shell', async () => {
  renderShell()

  await userEvent.click(screen.getByRole('button', { name: 'Đổi sang giao diện tối' }))

  expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
})
