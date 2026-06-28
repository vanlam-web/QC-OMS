import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkstationPage } from './WorkstationPage'
import { getWorkstationId, setWorkstationId } from '../users/foundation-service'

it('renders active workstations sorted by code and stores the selection', async () => {
  const onSelect = vi.fn((id: string) => setWorkstationId(id))
  render(
    <WorkstationPage
      workstations={[
        { id: '2', code: 'POS-02', name: 'Quầy 2', status: 'active' },
        { id: '0', code: 'POS-00', name: 'Cũ', status: 'inactive' },
        { id: '1', code: 'POS-01', name: 'Quầy 1', status: 'active' },
      ]}
      onSelect={onSelect}
    />,
  )

  const buttons = screen.getAllByRole('button')
  expect(buttons.map((button) => button.textContent)).toEqual(['POS-01 — Quầy 1', 'POS-02 — Quầy 2'])
  await userEvent.click(buttons[0])
  expect(onSelect).toHaveBeenCalledWith('1')
  expect(getWorkstationId()).toBe('1')
})

it('shows a support message when no active workstation exists', () => {
  render(<WorkstationPage workstations={[]} onSelect={vi.fn()} />)
  expect(screen.getByText('Chưa có máy bán hàng khả dụng. Vui lòng liên hệ quản trị viên.')).toBeInTheDocument()
})
