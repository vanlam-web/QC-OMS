import { render, screen, within } from '@testing-library/react'
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
          username: 'admin',
          phone: '0900000000',
          display_name: 'Admin',
          status: 'active' as const,
          permissions: ['perm.manage_users' as const, 'perm.create_order' as const],
        },
      ],
    })),
    listPermissions: vi.fn(async () => [
      { code: 'perm.manage_users' as const, module: 'administration', description: 'Manage users' },
      { code: 'perm.create_order' as const, module: 'sales', description: 'Create sales orders' },
      { code: 'perm.apply_discount' as const, module: 'sales', description: 'Apply discounts' },
      { code: 'perm.edit_price_book' as const, module: 'catalog', description: 'Edit price book' },
      { code: 'perm.manage_inventory' as const, module: 'inventory', description: 'Manage inventory' },
      { code: 'perm.manage_finance' as const, module: 'finance', description: 'Manage finance' },
      { code: 'perm.view_shift_report' as const, module: 'reports', description: 'View reports' },
    ]),
    createUser: vi.fn(async () => ({
      id: 'u-2',
      email: 'cashier@example.test',
      username: 'cashier-login',
      phone: '0912345678',
      display_name: 'Cashier',
      status: 'active' as const,
      permissions: ['perm.create_order' as const],
    })),
    updateUser: vi.fn(async () => ({
      id: 'u-1',
      email: 'admin@example.test',
      username: 'admin',
      phone: '0900000000',
      display_name: 'Admin',
      status: 'inactive' as const,
      permissions: ['perm.manage_users' as const, 'perm.create_order' as const],
    })),
    replaceUserPermissions: vi.fn(async () => ({
      id: 'u-1',
      email: 'admin@example.test',
      username: 'admin',
      phone: '0900000000',
      display_name: 'Admin',
      status: 'active' as const,
      permissions: ['perm.manage_users' as const],
    })),
    ...overrides,
  }
}

it('loads user and permission administration data from the API service', async () => {
  render(<FoundationAdminPage service={makeService()} onOpenDashboard={vi.fn()} />)

  expect(screen.getByText('Đang tải dữ liệu quản trị...').closest('.management-main')).not.toBeNull()
  expect(screen.queryByRole('heading', { name: 'Quản trị nền tảng' })).not.toBeInTheDocument()
  expect(screen.queryByText('Người dùng và danh mục quyền')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Trang chủ' })).not.toBeInTheDocument()
  expect(await screen.findByRole('heading', { name: 'Người dùng' })).toBeInTheDocument()
  expect(screen.getByRole('main')).toHaveClass('management-page')
  expect(screen.getByRole('heading', { name: 'Quản trị' }).closest('.management-page-header')).not.toBeNull()
  const sidebar = screen.getByRole('complementary', { name: 'Bộ lọc người dùng' })
  expect(sidebar).toHaveClass('management-filter-sidebar')
  expect(within(sidebar).queryByRole('heading', { name: 'Bộ lọc' })).not.toBeInTheDocument()
  expect(sidebar.querySelector('.management-filter-summary')).toBeNull()
  expect(within(sidebar).queryByRole('button', { name: 'Đặt lại bộ lọc' })).not.toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Người dùng' })).toHaveClass('management-list-surface')
  expect(screen.getByRole('region', { name: 'Danh mục quyền' })).toHaveClass('management-list-surface')
  expect(document.querySelector('.admin-grid')).toBeNull()
  expect(document.querySelector('.admin-form')).toBeNull()
  const filterForm = screen.getByRole('search', { name: 'Lọc người dùng' })
  expect(filterForm.closest('.management-page-header')).not.toBeNull()
  expect(within(filterForm).getByLabelText('Tìm người dùng').closest('.management-compact-search')).not.toBeNull()
  expect(screen.queryByRole('button', { name: 'Lọc' })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Máy trạm' })).not.toBeInTheDocument()
  expect(screen.queryByText('POS-01')).not.toBeInTheDocument()
  expect(screen.getByText('admin@example.test')).toBeInTheDocument()
  expect(screen.getByText('admin@example.test').closest('.management-table-viewport')).not.toBeNull()
  expect(screen.getByRole('button', { name: 'Mở quyền Admin' })).toHaveClass('management-row-action')
  expect(screen.getByRole('button', { name: 'Khóa Admin' })).toHaveClass('management-row-action')
  expect(screen.getByRole('navigation', { name: 'Phân trang người dùng' })).toHaveClass('management-table-footer')
  expect(screen.getByRole('navigation', { name: 'Phân trang danh mục quyền' })).toHaveClass('management-table-footer')
  expect(screen.getAllByText('administration').length).toBeGreaterThan(0)
  expect(screen.getAllByText('sales').length).toBeGreaterThan(0)
  expect(screen.getByText('perm.manage_users')).toBeInTheDocument()
  expect(screen.getByText('Manage users')).toBeInTheDocument()
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
  const filterForm = screen.getByRole('search', { name: 'Lọc người dùng' })
  const searchInput = within(filterForm).getByLabelText('Tìm người dùng')
  await userEvent.type(searchInput, 'Admin')
  await userEvent.click(screen.getByRole('radio', { name: 'active' }))
  await userEvent.type(searchInput, '{Enter}')
  expect(service.listUsers).toHaveBeenLastCalledWith({ search: 'Admin', status: 'active' })
  expect(screen.queryByText('Tìm: Admin')).not.toBeInTheDocument()

  const createUserForm = screen.getByRole('form', { name: 'Tạo người dùng' })
  await userEvent.type(createUserForm.querySelector('input[type="email"]') as HTMLInputElement, 'cashier@example.test')
  await userEvent.type(createUserForm.querySelectorAll('input')[1], 'Cashier')
  await userEvent.type(within(createUserForm).getByRole('textbox', { name: 'Tên đăng nhập' }), 'cashier-login')
  await userEvent.type(within(createUserForm).getByRole('textbox', { name: 'Điện thoại' }), '0912345678')
  await userEvent.type(createUserForm.querySelector('input[type="password"]') as HTMLInputElement, 'Password123!')
  await userEvent.click(screen.getByRole('button', { name: 'Thêm người dùng' }))
  expect(service.createUser).toHaveBeenCalledWith({
    email: 'cashier@example.test',
    username: 'cashier-login',
    phone: '0912345678',
    password: 'Password123!',
    display_name: 'Cashier',
    permissions: [
      'perm.create_order',
      'perm.apply_discount',
      'perm.edit_price_book',
      'perm.manage_inventory',
      'perm.manage_finance',
      'perm.view_shift_report',
    ],
  })

  await userEvent.click(screen.getByRole('button', { name: 'Khóa Admin' }))
  expect(service.updateUser).toHaveBeenCalledWith('u-1', { status: 'inactive' })

  await userEvent.click(screen.getByRole('button', { name: 'Mở quyền Admin' }))
  expect(screen.getByRole('region', { name: 'Quyền người dùng Admin' })).toHaveClass('management-inline-detail')
  expect(screen.queryByRole('region', { name: 'Quyền người dùng' })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('checkbox', { name: 'perm.create_order' }))
  expect(service.replaceUserPermissions).toHaveBeenCalledWith('u-1', ['perm.manage_users'])
})
