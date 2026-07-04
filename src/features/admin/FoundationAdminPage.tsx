import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, KeyRound, Lock, RotateCcw, Search, Unlock } from 'lucide-react'
import type { Permission, UserListItem } from '../users/types'
import type { FoundationService } from '../users/foundation-service'
import { formatApiError } from '../../lib/api/error-message'
import {
  ManagementCompactCreateAction,
  ManagementCompactSearch,
  ManagementCompactToolbar,
  ManagementFilterGroup,
  ManagementFilterSidebar,
  ManagementDetailRow,
  ManagementListSurface,
  ManagementPage,
  ManagementRowActionButton,
  ManagementTableFooter,
  ManagementTableViewport,
} from '../../components/ui-shell/management-layout'

interface AdminState {
  users: UserListItem[]
  permissions: Permission[]
}

const internalStaffDefaultPermissions = [
  'perm.create_order',
  'perm.apply_discount',
  'perm.edit_price_book',
  'perm.manage_inventory',
  'perm.manage_finance',
  'perm.view_shift_report',
] as const

export function FoundationAdminPage({
  service,
}: {
  service: FoundationService
  onOpenDashboard: () => void
}) {
  const [state, setState] = useState<AdminState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const [lastUserSearch, setLastUserSearch] = useState('')
  const [userStatus, setUserStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [lastUserStatus, setLastUserStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showFilters, setShowFilters] = useState(true)
  const [userForm, setUserForm] = useState({ email: '', password: '', displayName: '' })
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [savingUser, setSavingUser] = useState(false)
  const createUserEmailRef = useRef<HTMLInputElement | null>(null)

  async function load(userFilters = { search: lastUserSearch, status: lastUserStatus }) {
    setError(null)
    try {
      const status = userFilters.status === 'all' ? undefined : userFilters.status
      const search = userFilters.search.trim()
      const [users, permissions] = await Promise.all([
        service.listUsers({ search: search || undefined, status }),
        service.listPermissions(),
      ])
      setState({ users: users.items, permissions })
      setLastUserSearch(search)
      setLastUserStatus(userFilters.status)
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được dữ liệu quản trị.'))
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialData() {
      setError(null)
      try {
        const [users, permissions] = await Promise.all([service.listUsers(), service.listPermissions()])
        if (!active) return
        setState({ users: users.items, permissions })
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được dữ liệu quản trị.'))
      }
    }

    void loadInitialData()

    return () => {
      active = false
    }
  }, [service])

  async function filterUsers(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await load({ search: userSearch, status: userStatus })
  }

  async function resetUserFilters() {
    setUserSearch('')
    setUserStatus('all')
    await load({ search: '', status: 'all' })
  }

  function focusCreateUserForm() {
    createUserEmailRef.current?.focus()
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingUser(true)
    setError(null)
    try {
      await service.createUser({
        email: userForm.email,
        password: userForm.password,
        display_name: userForm.displayName,
        permissions: [...internalStaffDefaultPermissions],
      })
      setUserForm({ email: '', password: '', displayName: '' })
      await load()
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được người dùng.'))
    } finally {
      setSavingUser(false)
    }
  }

  async function updateUserStatus(user: UserListItem, status: UserListItem['status']) {
    setSavingUser(true)
    setError(null)
    try {
      await service.updateUser(user.id, { status })
      await load()
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được người dùng.'))
    } finally {
      setSavingUser(false)
    }
  }

  async function togglePermission(code: Permission['code']) {
    if (!selectedUser) return
    setSavingUser(true)
    setError(null)
    try {
      const permissions = selectedUser.permissions.includes(code)
        ? selectedUser.permissions.filter((permission) => permission !== code)
        : [...selectedUser.permissions, code]
      await service.replaceUserPermissions(selectedUser.id, permissions)
      setSelectedUser({ ...selectedUser, permissions })
      await load()
    } catch (cause) {
      setError(formatApiError(cause, 'Không lưu được quyền người dùng.'))
    } finally {
      setSavingUser(false)
    }
  }

  const permissionModules = useMemo(() => {
    return Object.entries(
      (state?.permissions ?? []).reduce<Record<string, number>>((modules, permission) => {
        modules[permission.module] = (modules[permission.module] ?? 0) + 1
        return modules
      }, {}),
    ).sort(([a], [b]) => a.localeCompare(b))
  }, [state])

  const activeFilterSummary = lastUserSearch
    ? `Tìm: ${lastUserSearch}`
    : lastUserStatus === 'all'
      ? 'Tất cả'
      : `Trạng thái: ${lastUserStatus}`

  return (
    <ManagementPage
      title="Quản trị"
      actions={
        <ManagementCompactToolbar ariaLabel="Lọc người dùng" onSubmit={filterUsers}>
          <ManagementCompactSearch
            label="Tìm người dùng"
            leadingIcon={<Search aria-hidden="true" size={16} />}
            placeholder="Tìm tên, email"
            trailingAction={
              <ManagementCompactCreateAction ariaLabel="Tạo người dùng" onClick={focusCreateUserForm} />
            }
            value={userSearch}
            onChange={setUserSearch}
          />
        </ManagementCompactToolbar>
      }
      filter={
        <ManagementFilterSidebar
          activeSummary={activeFilterSummary}
          ariaLabel="Bộ lọc người dùng"
          title="Bộ lọc"
          actions={
            <button className="button button-secondary" type="button" onClick={() => void resetUserFilters()}>
              <RotateCcw aria-hidden="true" size={15} />
              Đặt lại bộ lọc
            </button>
          }
        >
          <button
            aria-label="Ẩn bộ lọc người dùng"
            className="management-filter-collapse-button"
            title="Ẩn bộ lọc"
            type="button"
            onClick={() => setShowFilters(false)}
          >
            <ChevronLeft aria-hidden="true" size={16} />
          </button>
          <ManagementFilterGroup title="Trạng thái">
            <label>
              <input checked={userStatus === 'all'} name="admin-user-status" type="radio" onChange={() => setUserStatus('all')} />
              Tất cả
            </label>
            <label>
              <input checked={userStatus === 'active'} name="admin-user-status" type="radio" onChange={() => setUserStatus('active')} />
              active
            </label>
            <label>
              <input checked={userStatus === 'inactive'} name="admin-user-status" type="radio" onChange={() => setUserStatus('inactive')} />
              inactive
            </label>
          </ManagementFilterGroup>
        </ManagementFilterSidebar>
      }
      filterVisible={showFilters}
      filterCollapsedControl={
        <button
          aria-label="Mở bộ lọc người dùng"
          className="management-filter-expand-button"
          title="Mở bộ lọc"
          type="button"
          onClick={() => setShowFilters(true)}
        >
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      }
    >
      {error ? <p role="alert">{error}</p> : null}
      {state === null && error === null ? <p>Đang tải dữ liệu quản trị...</p> : null}

      {state ? (
        <>
          <ManagementListSurface ariaLabel="Người dùng">
            <h2>Người dùng</h2>
            <form aria-label="Tạo người dùng" className="management-create-form" onSubmit={createUser}>
              <label>
                Email
                <input
                  ref={createUserEmailRef}
                  type="email"
                  value={userForm.email}
                  onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label>
                Tên
                <input
                  value={userForm.displayName}
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, displayName: event.target.value }))
                  }
                />
              </label>
              <label>
                Mật khẩu
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </label>
              <button disabled={savingUser} type="submit">
                Thêm người dùng
              </button>
            </form>
            <ManagementTableViewport>
              <table>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                    <th>Quyền</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {state.users.map((user) => (
                    <Fragment key={user.id}>
                      <tr className={selectedUser?.id === user.id ? 'management-data-row-selected' : undefined}>
                        <td>{user.display_name}</td>
                        <td>{user.email || 'Chưa đồng bộ email'}</td>
                        <td>{user.status}</td>
                        <td>{user.permissions.length}</td>
                        <td>
                          <ManagementRowActionButton
                            ariaLabel={`${selectedUser?.id === user.id ? 'Đóng' : 'Mở'} quyền ${user.display_name}`}
                            onClick={() => setSelectedUser((current) => (current?.id === user.id ? null : user))}
                          >
                            <KeyRound aria-hidden="true" size={15} />
                          </ManagementRowActionButton>
                          <ManagementRowActionButton
                            ariaLabel={`${user.status === 'active' ? 'Khóa' : 'Mở'} ${user.display_name}`}
                            disabled={savingUser}
                            onClick={() =>
                              void updateUserStatus(user, user.status === 'active' ? 'inactive' : 'active')
                            }
                          >
                            {user.status === 'active' ? (
                              <Lock aria-hidden="true" size={15} />
                            ) : (
                              <Unlock aria-hidden="true" size={15} />
                            )}
                          </ManagementRowActionButton>
                        </td>
                      </tr>
                      {selectedUser?.id === user.id ? (
                        <ManagementDetailRow colSpan={5} label={`Quyền người dùng ${selectedUser.display_name}`}>
                          <div className="permission-editor">
                            <h3>{selectedUser.display_name}</h3>
                            {state.permissions.map((permission) => (
                              <label key={permission.code}>
                                <input
                                  checked={selectedUser.permissions.includes(permission.code)}
                                  disabled={savingUser}
                                  type="checkbox"
                                  onChange={() => void togglePermission(permission.code)}
                                />
                                {permission.code}
                              </label>
                            ))}
                          </div>
                        </ManagementDetailRow>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </ManagementTableViewport>
            <ManagementTableFooter
              ariaLabel="Phân trang người dùng"
              canGoNext={false}
              canGoPrevious={false}
              entityLabel="người dùng"
              page={1}
              pageSize={Math.max(1, state.users.length)}
              total={state.users.length}
              onNext={() => undefined}
              onPrevious={() => undefined}
            />
          </ManagementListSurface>

          <ManagementListSurface ariaLabel="Danh mục quyền">
            <h2>Danh mục quyền</h2>
            <ul className="permission-list">
              {permissionModules.map(([module, count]) => (
                <li key={module}>
                  <strong>{module}</strong>
                  <span>{count}</span>
                </li>
              ))}
            </ul>
            <ManagementTableViewport>
              <table>
                <thead>
                  <tr>
                    <th>Mã quyền</th>
                    <th>Nhóm</th>
                    <th>Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {state.permissions.map((permission) => (
                    <tr key={permission.code}>
                      <td>{permission.code}</td>
                      <td>{permission.module}</td>
                      <td>{permission.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ManagementTableViewport>
            <ManagementTableFooter
              ariaLabel="Phân trang danh mục quyền"
              canGoNext={false}
              canGoPrevious={false}
              entityLabel="quyền"
              page={1}
              pageSize={Math.max(1, state.permissions.length)}
              total={state.permissions.length}
              onNext={() => undefined}
              onPrevious={() => undefined}
            />
          </ManagementListSurface>
        </>
      ) : null}
    </ManagementPage>
  )
}
