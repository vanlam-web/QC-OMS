import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FoundationAdminPage } from './FoundationAdminPage'
import type { FoundationService } from '../users/foundation-service'
import { ApiError } from '../../lib/api/client'

function makeService(overrides: Partial<FoundationService> = {}): FoundationService {
  return {
    getMe: vi.fn(),
    listUsers: vi.fn(async () => ({
      total: 1,
      items: [
        {
          id: 'u-1',
          email: 'admin@example.test',
          display_name: 'Admin',
          status: 'active' as const,
          permissions: ['perm.manage_users' as const, 'perm.create_order' as const],
        },
      ],
    })),
    listPermissions: vi.fn(async () => [
      { code: 'perm.manage_users' as const, module: 'administration', description: 'Manage users' },
      { code: 'perm.create_order' as const, module: 'sales', description: 'Create sales orders' },
    ]),
    createUser: vi.fn(async () => ({
      id: 'u-2',
      email: 'cashier@example.test',
      display_name: 'Cashier',
      status: 'active' as const,
      permissions: ['perm.create_order' as const],
    })),
    updateUser: vi.fn(async () => ({
      id: 'u-1',
      email: 'admin@example.test',
      display_name: 'Admin',
      status: 'inactive' as const,
      permissions: ['perm.manage_users' as const, 'perm.create_order' as const],
    })),
    replaceUserPermissions: vi.fn(async () => ({
      id: 'u-1',
      email: 'admin@example.test',
      display_name: 'Admin',
      status: 'active' as const,
      permissions: ['perm.manage_users' as const],
    })),
    ...overrides,
  }
}

it('loads user and permission administration data from the API service', async () => {
  const onOpenDashboard = vi.fn()
  render(<FoundationAdminPage service={makeService()} onOpenDashboard={onOpenDashboard} />)

  expect(screen.getByText('Đang tải dữ liệu quản trị...')).toBeInTheDocument()
  expect(await screen.findByRole('heading', { name: 'Người dùng' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Máy trạm' })).not.toBeInTheDocument()
  expect(screen.queryByText('POS-01')).not.toBeInTheDocument()
  expect(screen.getByText('admin@example.test')).toBeInTheDocument()
  expect(screen.getAllByText('administration').length).toBeGreaterThan(0)
  expect(screen.getAllByText('sales').length).toBeGreaterThan(0)
  expect(screen.getByText('perm.manage_users')).toBeInTheDocument()
  expect(screen.getByText('Manage users')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Trang chủ' }))
  expect(onOpenDashboard).toHaveBeenCalled()
})

it('shows an error when admin data cannot be loaded', async () => {
  render(
    <FoundationAdminPage
      service={makeService({
        listUsers: vi.fn(async () => {
          throw new Error('boom')
        }),
      })}
      onOpenDashboard={vi.fn()}
    />,
  )

  expect(await screen.findByRole('alert')).toHaveTextContent('Không tải được dữ liệu quản trị.')
})

it('maps API errors to operator-facing messages', async () => {
  render(
    <FoundationAdminPage
      service={makeService({
        createUser: vi.fn(async () => {
          throw new ApiError(409, 'RESOURCE_CONFLICT', 'Conflict', 'trace-1')
        }),
      })}
      onOpenDashboard={vi.fn()}
    />,
  )

  await screen.findByText('admin@example.test')
  const createUserForm = screen.getByRole('form', { name: 'Tạo người dùng' })
  await userEvent.type(createUserForm.querySelector('input[type="email"]') as HTMLInputElement, 'admin@example.test')
  await userEvent.type(createUserForm.querySelectorAll('input')[1], 'Admin')
  await userEvent.type(createUserForm.querySelector('input[type="password"]') as HTMLInputElement, 'Password123!')
  await userEvent.click(screen.getByRole('button', { name: 'Thêm người dùng' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Dữ liệu đã tồn tại hoặc xung đột với bản ghi hiện có.',
  )
})

it('filters, creates, disables, and updates permissions for users', async () => {
  const service = makeService()
  render(<FoundationAdminPage service={service} onOpenDashboard={vi.fn()} />)

  await screen.findByText('admin@example.test')
  const filterForm = screen.getByRole('form', { name: 'Lọc người dùng' })
  await userEvent.type(filterForm.querySelector('input') as HTMLInputElement, 'Admin')
  await userEvent.selectOptions(filterForm.querySelector('select') as HTMLSelectElement, 'active')
  await userEvent.click(screen.getByRole('button', { name: 'Lọc' }))
  expect(service.listUsers).toHaveBeenLastCalledWith({ search: 'Admin', status: 'active' })

  const createUserForm = screen.getByRole('form', { name: 'Tạo người dùng' })
  await userEvent.type(createUserForm.querySelector('input[type="email"]') as HTMLInputElement, 'cashier@example.test')
  await userEvent.type(createUserForm.querySelectorAll('input')[1], 'Cashier')
  await userEvent.type(createUserForm.querySelector('input[type="password"]') as HTMLInputElement, 'Password123!')
  await userEvent.click(screen.getByRole('button', { name: 'Thêm người dùng' }))
  expect(service.createUser).toHaveBeenCalledWith({
    email: 'cashier@example.test',
    password: 'Password123!',
    display_name: 'Cashier',
    permissions: ['perm.create_order'],
  })

  await userEvent.click(screen.getByRole('button', { name: 'Khóa' }))
  expect(service.updateUser).toHaveBeenCalledWith('u-1', { status: 'inactive' })

  await userEvent.click(screen.getByRole('button', { name: 'Quyền' }))
  await userEvent.click(screen.getByRole('checkbox', { name: 'perm.create_order' }))
  expect(service.replaceUserPermissions).toHaveBeenCalledWith('u-1', ['perm.manage_users'])
})
