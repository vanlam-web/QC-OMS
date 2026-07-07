import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { ForbiddenPage } from './ForbiddenPage'
import { useAuth } from '../features/auth/auth-context'
import { lazy, Suspense, useEffect, useMemo } from 'react'
import { createBrowserFoundationService } from '../features/users/foundation-service'
import { createBrowserCatalogService } from '../features/catalog/catalog-service'
import { createBrowserOrderService } from '../features/orders/order-service'
import { createBrowserProductionQueueService } from '../features/production-queue/production-queue-service'
import { createBrowserSupplierService } from '../features/purchase/supplier-service'
import { createBrowserPurchaseReceiptService } from '../features/purchase/purchase-receipt-service'
import { createBrowserSalesDocumentService } from '../features/sales-documents/sales-document-service'
import { createBrowserInventoryService } from '../features/inventory/inventory-service'
import { createBrowserFinanceService } from '../features/finance/finance-service'
import { createBrowserReportService } from '../features/reports/report-service'
import { saveQuoteReopenPayload } from '../features/pos/quote-draft-handoff'
import { AppShell } from '../components/ui-shell/AppShell'

const LoginPage = lazy(() => import('../features/auth/LoginPage').then((module) => ({ default: module.LoginPage })))
const PosShell = lazy(() => import('../features/pos/PosShell').then((module) => ({ default: module.PosShell })))
const FoundationAdminPage = lazy(() =>
  import('../features/admin/FoundationAdminPage').then((module) => ({ default: module.FoundationAdminPage })),
)
const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const CatalogPage = lazy(() =>
  import('../features/catalog/CatalogPage').then((module) => ({ default: module.CatalogPage })),
)
const PriceBookPage = lazy(() =>
  import('../features/catalog/PriceBookPage').then((module) => ({ default: module.PriceBookPage })),
)
const CustomersPage = lazy(() =>
  import('../features/catalog/CustomersPage').then((module) => ({ default: module.CustomersPage })),
)
const SuppliersPage = lazy(() =>
  import('../features/purchase/SuppliersPage').then((module) => ({ default: module.SuppliersPage })),
)
const PurchaseReceiptsPage = lazy(() =>
  import('../features/purchase/PurchaseReceiptsPage').then((module) => ({ default: module.PurchaseReceiptsPage })),
)
const InventoryPage = lazy(() =>
  import('../features/inventory/InventoryPage').then((module) => ({ default: module.InventoryPage })),
)
const FinancePage = lazy(() =>
  import('../features/finance/FinancePage').then((module) => ({ default: module.FinancePage })),
)
const ReportsPage = lazy(() =>
  import('../features/reports/ReportsPage').then((module) => ({ default: module.ReportsPage })),
)
const SalesDocumentsPage = lazy(() =>
  import('../features/sales-documents/SalesDocumentsPage').then((module) => ({
    default: module.SalesDocumentsPage,
  })),
)
const QuotePrintPage = lazy(() =>
  import('../features/sales-documents/QuotePrintPage').then((module) => ({ default: module.QuotePrintPage })),
)
const AccountPage = lazy(() =>
  import('../features/account/AccountPage').then((module) => ({ default: module.AccountPage })),
)

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<BootstrapScreen />}>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/account" element={<AccountRoute />} />
          <Route path="/pos" element={<PosRoute />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/products" element={<CatalogRoute />} />
          <Route path="/price-book" element={<PriceBookRoute />} />
          <Route path="/customers" element={<CustomersRoute />} />
          <Route path="/suppliers" element={<SuppliersRoute />} />
          <Route path="/purchase/receipts" element={<PurchaseReceiptsRoute />} />
          <Route path="/inventory" element={<InventoryRoute />} />
          <Route path="/finance" element={<FinanceRoute />} />
          <Route path="/reports" element={<ReportsRoute />} />
          <Route path="/sales-documents" element={<SalesDocumentsRoute />} />
          <Route path="/sales-documents/:id/quote-print" element={<QuotePrintRoute />} />
          <Route path="/forbidden" element={<ForbiddenRoute />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function LoginRoute() {
  const { currentUser, initialized } = useAuth()
  if (!initialized) return <BootstrapScreen />
  if (currentUser) return <Navigate to="/dashboard" replace />
  return <LoginPage />
}

function DashboardRoute() {
  const { currentUser, initialized, signOut } = useAuth()
  const navigate = useNavigate()

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />

  return (
    <AppShell currentUser={currentUser} onSignOut={() => void signOut()}>
      <DashboardPage
        currentUser={currentUser}
        onOpenPos={() => navigate('/pos')}
        onOpenAdmin={() => navigate('/admin')}
        onOpenPriceBook={() => navigate('/price-book')}
        onOpenSalesDocuments={() => navigate('/sales-documents')}
        onOpenSuppliers={() => navigate('/suppliers')}
        onOpenPurchaseReceipts={() => navigate('/purchase/receipts')}
        onSignOut={() => void signOut()}
        showSignOut={false}
      />
    </AppShell>
  )
}

function AccountRoute() {
  const { currentUser, initialized, getAccessToken, refreshMe, signOut } = useAuth()
  const currentUserId = currentUser?.user.id
  const service = useMemo(() => createBrowserFoundationService(getAccessToken), [getAccessToken])

  useEffect(() => {
    if (!initialized || !currentUserId) return
    void refreshMe().catch(() => undefined)
  }, [currentUserId, initialized, refreshMe])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />

  return (
    <AppShell currentUser={currentUser} onSignOut={() => void signOut()}>
      <AccountPage
        currentUser={currentUser}
        onSaveProfile={async (input) => {
          await service.updateCurrentUserProfile(input)
          await refreshMe()
        }}
        onSignOutDevice={async (deviceId) => {
          await service.signOutCurrentUserDevice(deviceId)
          await refreshMe()
        }}
      />
    </AppShell>
  )
}

function PosRoute() {
  const { currentUser, initialized, accessConnection, signOut, getAccessToken } = useAuth()
  const navigate = useNavigate()
  const catalogService = useMemo(() => createBrowserCatalogService(getAccessToken), [getAccessToken])
  const inventoryService = useMemo(() => createBrowserInventoryService(getAccessToken), [getAccessToken])
  const orderService = useMemo(() => createBrowserOrderService(getAccessToken), [getAccessToken])
  const productionQueueService = useMemo(
    () => createBrowserProductionQueueService(getAccessToken),
    [getAccessToken],
  )
  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.create_order')) return <Navigate to="/forbidden" replace />
  return (
    <PosShell
      catalogService={catalogService}
      inventoryService={inventoryService}
      orderService={orderService}
      productionQueueService={productionQueueService}
      currentUser={currentUser}
      connected={accessConnection === 'connected'}
      onSignOut={() => void signOut()}
      onOpenAdmin={() => navigate('/admin')}
      onOpenDashboard={() => navigate('/dashboard')}
    />
  )
}

function AdminRoute() {
  const { currentUser, initialized, getAccessToken, signOut } = useAuth()
  const navigate = useNavigate()
  const service = useMemo(() => createBrowserFoundationService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.access_admin_panel')) {
    return <Navigate to="/forbidden" replace />
  }

  return (
    <AppShell currentUser={currentUser} onSignOut={() => void signOut()}>
      <FoundationAdminPage service={service} onOpenDashboard={() => navigate('/dashboard')} />
    </AppShell>
  )
}

function CatalogRoute() {
  const { currentUser, initialized, getAccessToken, signOut } = useAuth()
  const navigate = useNavigate()
  const service = useMemo(() => createBrowserCatalogService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.manage_inventory')) {
    return <Navigate to="/forbidden" replace />
  }

  return (
    <AppShell currentUser={currentUser} onSignOut={() => void signOut()}>
      <CatalogPage service={service} onOpenDashboard={() => navigate('/dashboard')} />
    </AppShell>
  )
}

function PriceBookRoute() {
  const { currentUser, initialized, getAccessToken, signOut } = useAuth()
  const navigate = useNavigate()
  const service = useMemo(() => createBrowserCatalogService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.edit_price_book')) {
    return <Navigate to="/forbidden" replace />
  }

  return (
    <AppShell currentUser={currentUser} onSignOut={() => void signOut()}>
      <PriceBookPage service={service} onOpenDashboard={() => navigate('/dashboard')} />
    </AppShell>
  )
}

function CustomersRoute() {
  const { currentUser, initialized, getAccessToken, signOut } = useAuth()
  const catalogService = useMemo(() => createBrowserCatalogService(getAccessToken), [getAccessToken])
  const orderService = useMemo(() => createBrowserOrderService(getAccessToken), [getAccessToken])
  const salesDocumentService = useMemo(() => createBrowserSalesDocumentService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.create_order')) {
    return <Navigate to="/forbidden" replace />
  }

  return (
    <AppShell currentUser={currentUser} onSignOut={() => void signOut()}>
      <CustomersPage
        service={catalogService}
        orderService={orderService}
        salesDocumentService={salesDocumentService}
      />
    </AppShell>
  )
}

function SuppliersRoute() {
  const { currentUser, initialized, getAccessToken, signOut } = useAuth()
  const navigate = useNavigate()
  const service = useMemo(() => createBrowserSupplierService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.manage_inventory')) {
    return <Navigate to="/forbidden" replace />
  }

  return (
    <AppShell currentUser={currentUser} onSignOut={() => void signOut()}>
      <SuppliersPage service={service} onOpenDashboard={() => navigate('/dashboard')} />
    </AppShell>
  )
}

function PurchaseReceiptsRoute() {
  const { currentUser, initialized, getAccessToken, signOut } = useAuth()
  const navigate = useNavigate()
  const service = useMemo(() => createBrowserPurchaseReceiptService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.manage_inventory')) {
    return <Navigate to="/forbidden" replace />
  }

  return (
    <AppShell currentUser={currentUser} onSignOut={() => void signOut()}>
      <PurchaseReceiptsPage service={service} onOpenDashboard={() => navigate('/dashboard')} />
    </AppShell>
  )
}

function InventoryRoute() {
  const { currentUser, initialized, getAccessToken, signOut } = useAuth()
  const service = useMemo(() => createBrowserInventoryService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.manage_inventory')) {
    return <Navigate to="/forbidden" replace />
  }

  return (
    <AppShell currentUser={currentUser} onSignOut={() => void signOut()}>
      <InventoryPage service={service} />
    </AppShell>
  )
}

function FinanceRoute() {
  const { currentUser, initialized, getAccessToken, signOut } = useAuth()
  const service = useMemo(() => createBrowserFinanceService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.manage_finance')) {
    return <Navigate to="/forbidden" replace />
  }

  return (
    <AppShell currentUser={currentUser} onSignOut={() => void signOut()}>
      <FinancePage service={service} />
    </AppShell>
  )
}

function ReportsRoute() {
  const { currentUser, initialized, getAccessToken, signOut } = useAuth()
  const service = useMemo(() => createBrowserReportService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (
    !currentUser.permissions.includes('perm.manage_finance') ||
    !currentUser.permissions.includes('perm.manage_inventory')
  ) {
    return <Navigate to="/forbidden" replace />
  }

  return (
    <AppShell currentUser={currentUser} onSignOut={() => void signOut()}>
      <ReportsPage service={service} />
    </AppShell>
  )
}

function SalesDocumentsRoute() {
  const { currentUser, initialized, getAccessToken, signOut } = useAuth()
  const navigate = useNavigate()
  const service = useMemo(() => createBrowserSalesDocumentService(getAccessToken), [getAccessToken])
  const orderService = useMemo(() => createBrowserOrderService(getAccessToken), [getAccessToken])
  const userService = useMemo(() => createBrowserFoundationService(getAccessToken), [getAccessToken])
  const catalogService = useMemo(() => createBrowserCatalogService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (
    !currentUser.permissions.includes('perm.create_order') &&
    !currentUser.permissions.includes('perm.manage_finance')
  ) {
    return <Navigate to="/forbidden" replace />
  }

  return (
    <AppShell currentUser={currentUser} onSignOut={() => void signOut()}>
      <SalesDocumentsPage
        service={service}
        orderService={orderService}
        userService={userService}
        catalogService={catalogService}
        onCreateSalesDocument={() => navigate('/pos')}
        onOpenDashboard={() => navigate('/dashboard')}
        onOpenQuoteInPos={(payload) => {
          saveQuoteReopenPayload(payload)
          navigate('/pos')
        }}
        onOpenQuotePrint={(documentId) => navigate(`/sales-documents/${documentId}/quote-print`)}
      />
    </AppShell>
  )
}

function QuotePrintRoute() {
  const { currentUser, initialized, getAccessToken } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const service = useMemo(() => createBrowserSalesDocumentService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (
    !currentUser.permissions.includes('perm.create_order') &&
    !currentUser.permissions.includes('perm.manage_finance')
  ) {
    return <Navigate to="/forbidden" replace />
  }
  if (!id) return <Navigate to="/sales-documents" replace />

  return <QuotePrintPage documentId={id} service={service} onClose={() => navigate('/sales-documents')} />
}

function ForbiddenRoute() {
  const { currentUser, initialized } = useAuth()
  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  return <ForbiddenPage />
}

function RootRedirect() {
  const { currentUser, initialized } = useAuth()
  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  return <Navigate to="/dashboard" replace />
}

function BootstrapScreen() {
  return (
    <main>
      <h1>QC-OMS</h1>
      <p>Đang khởi tạo phiên làm việc...</p>
    </main>
  )
}
