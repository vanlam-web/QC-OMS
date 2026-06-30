import type { CurrentUserData } from '../../lib/api/types'

export function DashboardPage({
  currentUser,
  onOpenPos,
  onOpenAdmin,
  onOpenCatalog,
  onSignOut,
}: {
  currentUser: CurrentUserData
  onOpenPos: () => void
  onOpenAdmin: () => void
  onOpenCatalog: () => void
  onSignOut: () => void
}) {
  const canSell = currentUser.permissions.includes('perm.create_order')
  const canAdmin = currentUser.permissions.includes('perm.access_admin_panel')
  const canCatalog = currentUser.permissions.includes('perm.edit_price_book')

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <h1>QC-OMS</h1>
          <p>{currentUser.user.display_name}</p>
        </div>
        <button type="button" onClick={onSignOut}>
          Đăng xuất
        </button>
      </header>

      <section aria-label="Module hệ thống" className="module-grid">
        <button disabled={!canSell} type="button" onClick={onOpenPos}>
          Bán hàng
        </button>
        <button disabled={!canAdmin} type="button" onClick={onOpenAdmin}>
          Quản trị
        </button>
        <button disabled={!canCatalog} type="button" onClick={onOpenCatalog}>
          Hàng hóa
        </button>
        <button disabled type="button">
          Khách hàng
        </button>
        <button disabled type="button">
          Nhà cung cấp
        </button>
        <button disabled type="button">
          Kế toán
        </button>
      </section>
    </main>
  )
}
