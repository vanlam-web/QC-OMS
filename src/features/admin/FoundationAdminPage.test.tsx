import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FoundationAdminPage } from './FoundationAdminPage'
import type { FoundationService } from '../users/foundation-service'
import { ApiError } from '../../lib/api/client'

function makeService(overrides: Partial<FoundationService> = {}): FoundationService {
  return {
    getMe: vi.fn(),
    updateCurrentUserProfile: vi.fn(),
    signOutCurrentUserDevice: vi.fn(async () => []),
    listUsers: vi.fn(async () => ({
      total: 1,
      items: [
        {
          id: 'u-1',
          email: 'admin@example.test',
          username: 'admin',
          phone: '0947900909',
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
      username: 'cashier',
      phone: '0900000000',
      display_name: 'Cashier',
      status: 'active' as const,
      permissions: ['perm.create_order' as const],
    })),
    updateUser: vi.fn(async () => ({
      id: 'u-1',
      email: 'admin@example.test',
      username: 'admin',
      phone: '0947900909',
      display_name: 'Admin',
      status: 'inactive' as const,
      permissions: ['perm.manage_users' as const, 'perm.create_order' as const],
    })),
    replaceUserPermissions: vi.fn(async () => ({
      id: 'u-1',
      email: 'admin@example.test',
      username: 'admin',
      phone: '0947900909',
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
  expect(await screen.findByRole('tab', { name: 'Tài khoản người dùng' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Tài khoản người dùng' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: 'Quản lý vai trò' })).toHaveAttribute('aria-selected', 'false')
  expect(screen.getByRole('main')).toHaveClass('management-page')
  expect(screen.getByRole('heading', { name: 'Thiết lập' }).closest('.management-page-header')).not.toBeNull()
  const sidebar = screen.getByRole('navigation', { name: 'Menu thiết lập' })
  expect(sidebar).toHaveClass('admin-settings-menu')
  expect(within(sidebar).getByPlaceholderText('Tìm kiếm thiết lập')).toBeInTheDocument()
  expect(within(sidebar).getByRole('button', { name: 'Quản lý người dùng' })).toHaveAttribute('aria-current', 'page')
  expect(within(sidebar).getByRole('heading', { name: 'Cửa hàng' })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Tài khoản người dùng' })).toHaveClass('management-list-surface')
  expect(document.querySelector('.admin-grid')).toBeNull()
  expect(document.querySelector('.admin-form')).toBeNull()
  const filterForm = screen.getByRole('search', { name: 'Lọc người dùng' })
  expect(filterForm.closest('.admin-list-toolbar')).not.toBeNull()
  expect(within(filterForm).getByLabelText('Tìm người dùng').closest('.management-compact-search')).not.toBeNull()
  expect(within(filterForm).getByRole('button', { name: 'Lọc' })).toHaveClass('button-secondary')
  expect(screen.queryByRole('heading', { name: 'Máy trạm' })).not.toBeInTheDocument()
  expect(screen.queryByText('POS-01')).not.toBeInTheDocument()
  expect(screen.getByText('admin')).toBeInTheDocument()
  expect(screen.getByText('0947900909')).toBeInTheDocument()
  expect(screen.getByText('Quản trị')).toBeInTheDocument()
  expect(screen.getByText('Đã hoạt động')).toBeInTheDocument()
  expect(screen.getByText('admin').closest('.management-table-viewport')).not.toBeNull()
  expect(screen.getByRole('button', { name: 'Mở quyền Admin' })).toHaveClass('management-row-action')
  expect(screen.getByRole('button', { name: 'Ngừng hoạt động Admin' })).toHaveClass('management-row-action')
  expect(screen.getByRole('navigation', { name: 'Phân trang người dùng' })).toHaveClass('management-table-footer')
  await userEvent.click(screen.getByRole('tab', { name: 'Quản lý vai trò' }))
  expect(screen.getByRole('region', { name: 'Quản lý vai trò' })).toHaveClass('management-list-surface')
  expect(screen.getByRole('button', { name: 'Tạo vai trò' })).toHaveClass('button-secondary')
  expect(screen.getByRole('columnheader', { name: 'Tên vai trò' })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Mô tả' })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Số tài khoản' })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Trạng thái' })).toBeInTheDocument()
  expect(screen.getByText('Quản trị')).toBeInTheDocument()
  expect(screen.getByText('Nhân viên thu ngân')).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Phân trang vai trò' })).toHaveClass('management-table-footer')
  await userEvent.click(screen.getByRole('button', { name: 'Mở quyền vai trò Quản trị' }))
  const roleDetail = screen.getByRole('region', { name: 'Quyền vai trò Quản trị' })
  expect(roleDetail).toHaveClass('management-inline-detail')
  expect(within(roleDetail).getByRole('heading', { name: 'Thiết lập' })).toBeInTheDocument()
  expect(within(roleDetail).getByRole('checkbox', { name: 'Quản lý người dùng' })).toBeChecked()
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

  await screen.findByText('admin')
  const createUserForm = screen.getByRole('form', { name: 'Tạo người dùng' })
  await userEvent.type(createUserForm.querySelector('input[type="email"]') as HTMLInputElement, 'admin@example.test')
  await userEvent.type(createUserForm.querySelectorAll('input')[1], 'Admin')
  await userEvent.type(createUserForm.querySelector('input[type="password"]') as HTMLInputElement, 'Password123!')
  await userEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Dữ liệu đã tồn tại hoặc xung đột với bản ghi hiện có.',
  )
})

it('filters, creates, disables, and updates permissions for users', async () => {
  const service = makeService()
  render(<FoundationAdminPage service={service} onOpenDashboard={vi.fn()} />)

  await screen.findByText('admin')
  const filterForm = screen.getByRole('search', { name: 'Lọc người dùng' })
  const searchInput = within(filterForm).getByLabelText('Tìm người dùng')
  await userEvent.type(searchInput, 'Admin')
  await userEvent.selectOptions(within(filterForm).getByRole('combobox', { name: 'Trạng thái người dùng' }), 'active')
  await userEvent.click(within(filterForm).getByRole('button', { name: 'Lọc' }))
  expect(service.listUsers).toHaveBeenLastCalledWith({ search: 'Admin', status: 'active' })
  expect(screen.queryByText('Tìm: Admin')).not.toBeInTheDocument()

  const createUserForm = screen.getByRole('form', { name: 'Tạo người dùng' })
  await userEvent.type(createUserForm.querySelector('input[type="email"]') as HTMLInputElement, 'cashier@example.test')
  await userEvent.type(createUserForm.querySelectorAll('input')[1], 'Cashier')
  await userEvent.type(createUserForm.querySelector('input[type="password"]') as HTMLInputElement, 'Password123!')
  await userEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))
  expect(service.createUser).toHaveBeenCalledWith({
    email: 'cashier@example.test',
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

  await userEvent.click(screen.getByRole('button', { name: 'Ngừng hoạt động Admin' }))
  expect(service.updateUser).toHaveBeenCalledWith('u-1', { status: 'inactive' })

  await userEvent.click(screen.getByRole('button', { name: 'Mở quyền Admin' }))
  expect(screen.getByRole('region', { name: 'Quyền người dùng Admin' })).toHaveClass('management-inline-detail')
  expect(screen.queryByRole('region', { name: 'Quyền người dùng' })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('checkbox', { name: 'Tạo đơn bán hàng' }))
  expect(service.replaceUserPermissions).toHaveBeenCalledWith('u-1', ['perm.manage_users'])
})

it('creates a temporary role from the role modal with grouped permissions', async () => {
  render(<FoundationAdminPage service={makeService()} onOpenDashboard={vi.fn()} />)

  await screen.findByRole('tab', { name: 'Tài khoản người dùng' })
  await userEvent.click(screen.getByRole('tab', { name: 'Quản lý vai trò' }))
  await userEvent.click(screen.getByRole('button', { name: 'Tạo vai trò' }))

  const dialog = screen.getByRole('dialog', { name: 'Tạo vai trò' })
  expect(dialog).toHaveClass('management-modal-dialog')
  expect(within(dialog).getByRole('textbox', { name: 'Tên vai trò' })).toHaveAttribute('placeholder', 'Nhập tên vai trò')
  expect(within(dialog).getByRole('textbox', { name: 'Mô tả' })).toHaveAttribute('placeholder', 'Nhập mô tả')
  expect(within(dialog).getByRole('heading', { name: 'Bán hàng' })).toBeInTheDocument()

  await userEvent.type(within(dialog).getByRole('textbox', { name: 'Tên vai trò' }), 'Thu ngân ca tối')
  await userEvent.type(within(dialog).getByRole('textbox', { name: 'Mô tả' }), 'Bán hàng cuối ngày')
  await userEvent.click(within(dialog).getByRole('checkbox', { name: 'Tạo đơn bán hàng' }))
  await userEvent.click(within(dialog).getByRole('button', { name: 'Lưu' }))

  expect(screen.queryByRole('dialog', { name: 'Tạo vai trò' })).not.toBeInTheDocument()
  expect(screen.getByText('Thu ngân ca tối')).toBeInTheDocument()
  expect(screen.getByText('Bán hàng cuối ngày')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Mở quyền vai trò Thu ngân ca tối' }))
  expect(screen.getByRole('checkbox', { name: 'Tạo đơn bán hàng' })).toBeChecked()
})
