import { useEffect, useMemo, useState } from 'react'
import type { Permission, UserListItem } from '../users/types'
import type { FoundationService } from '../users/foundation-service'
import { formatApiError } from '../../lib/api/error-message'

interface AdminState {
  users: UserListItem[]
  permissions: Permission[]
}

export function FoundationAdminPage({
  service,
  onOpenDashboard,
}: {
  service: FoundationService
  onOpenDashboard: () => void
}) {
  const [state, setState] = useState<AdminState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const [userStatus, setUserStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [userForm, setUserForm] = useState({ email: '', password: '', displayName: '' })
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [savingUser, setSavingUser] = useState(false)

  async function load(userFilters = { search: userSearch, status: userStatus }) {
    setError(null)
    try {
      const status = userFilters.status === 'all' ? undefined : userFilters.status
      const [users, permissions] = await Promise.all([
        service.listUsers({ search: userFilters.search.trim() || undefined, status }),
        service.listPermissions(),
      ])
      setState({ users: users.items, permissions })
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

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingUser(true)
    setError(null)
    try {
      await service.createUser({
        email: userForm.email,
        password: userForm.password,
        display_name: userForm.displayName,
        permissions: ['perm.create_order'],
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

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <h1>Quản trị nền tảng</h1>
          <p>Người dùng và danh mục quyền</p>
        </div>
        <button type="button" onClick={onOpenDashboard}>
          Trang chủ
        </button>
      </header>

      {error ? <p role="alert">{error}</p> : null}
      {state === null && error === null ? <p>Đang tải dữ liệu quản trị...</p> : null}

      {state ? (
        <div className="admin-grid">
          <section aria-label="Người dùng">
            <h2>Người dùng</h2>
            <form aria-label="Lọc người dùng" className="admin-form" onSubmit={filterUsers}>
              <label>
                Tìm
                <input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} />
              </label>
              <label>
                Trạng thái
                <select
                  value={userStatus}
                  onChange={(event) => setUserStatus(event.target.value as typeof userStatus)}
                >
                  <option value="all">Tất cả</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </label>
              <button type="submit">Lọc</button>
            </form>
            <form aria-label="Tạo người dùng" className="admin-form" onSubmit={createUser}>
              <label>
                Email
                <input
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
                  <tr key={user.id}>
                    <td>{user.display_name}</td>
                    <td>{user.email || 'Chưa đồng bộ email'}</td>
                    <td>{user.status}</td>
                    <td>{user.permissions.length}</td>
                    <td>
                      <button type="button" onClick={() => setSelectedUser(user)}>
                        Quyền
                      </button>
                      <button
                        disabled={savingUser}
                        type="button"
                        onClick={() =>
                          void updateUserStatus(user, user.status === 'active' ? 'inactive' : 'active')
                        }
                      >
                        {user.status === 'active' ? 'Khóa' : 'Mở'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedUser ? (
              <section aria-label="Quyền người dùng" className="permission-editor">
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
              </section>
            ) : null}
          </section>

          <section aria-label="Danh mục quyền">
            <h2>Danh mục quyền</h2>
            <ul className="permission-list">
              {permissionModules.map(([module, count]) => (
                <li key={module}>
                  <strong>{module}</strong>
                  <span>{count}</span>
                </li>
              ))}
            </ul>
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
          </section>
        </div>
      ) : null}
    </main>
  )
}
