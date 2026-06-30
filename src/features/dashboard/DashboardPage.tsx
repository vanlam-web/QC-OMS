import type { CurrentUserData } from '../../lib/api/types'
import { canOpenModule, phaseOneModules } from '../navigation/module-boundaries'

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
  const canAdmin = currentUser.permissions.includes('perm.access_admin_panel')

  function openModule(moduleId: string) {
    if (moduleId === 'pos') onOpenPos()
    if (moduleId === 'price-book') onOpenCatalog()
  }

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
        {phaseOneModules.map((module) => {
          const enabled = canOpenModule(currentUser, module)
          const implemented = module.id === 'pos' || module.id === 'price-book'
          return (
            <button
              disabled={!enabled || !implemented}
              key={module.id}
              type="button"
              onClick={() => openModule(module.id)}
            >
              {module.label}
            </button>
          )
        })}
        <button disabled={!canAdmin} type="button" onClick={onOpenAdmin}>
          Quản trị
        </button>
      </section>
    </main>
  )
}
