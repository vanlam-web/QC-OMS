import type { CurrentUserData } from '../../lib/api/types'
import { canOpenModule, phaseOneModules } from '../navigation/module-boundaries'

export function DashboardPage({
  currentUser,
  onOpenPos,
  onOpenAdmin,
  onOpenPriceBook,
  onOpenSalesDocuments,
  onOpenSuppliers,
  onOpenPurchaseReceipts,
  onSignOut,
  showSignOut = true,
}: {
  currentUser: CurrentUserData
  onOpenPos: () => void
  onOpenAdmin: () => void
  onOpenPriceBook: () => void
  onOpenSalesDocuments: () => void
  onOpenSuppliers: () => void
  onOpenPurchaseReceipts: () => void
  onSignOut: () => void
  showSignOut?: boolean
}) {
  const canAdmin = currentUser.permissions.includes('perm.access_admin_panel')

  function openModule(moduleId: string) {
    if (moduleId === 'pos') onOpenPos()
    if (moduleId === 'price-book') onOpenPriceBook()
    if (moduleId === 'sales-documents') onOpenSalesDocuments()
    if (moduleId === 'suppliers') onOpenSuppliers()
    if (moduleId === 'purchase-receipts') onOpenPurchaseReceipts()
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <h1>QC-OMS</h1>
          <p>{currentUser.user.display_name}</p>
        </div>
        {showSignOut ? (
          <button type="button" onClick={onSignOut}>
            Đăng xuất
          </button>
        ) : null}
      </header>

      <section aria-label="Module hệ thống" className="module-grid">
        {phaseOneModules.map((module) => {
          const enabled = canOpenModule(currentUser, module)
          const implemented =
            module.id === 'pos' ||
            module.id === 'price-book' ||
            module.id === 'sales-documents' ||
            module.id === 'suppliers' ||
            module.id === 'purchase-receipts'
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
