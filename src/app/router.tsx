import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { LoginPage } from '../features/auth/LoginPage'
import { ForbiddenPage } from './ForbiddenPage'
import { PosShell } from '../features/pos/PosShell'
import { useAuth } from '../features/auth/auth-context'
import { useMemo } from 'react'
import { FoundationAdminPage } from '../features/admin/FoundationAdminPage'
import { createBrowserFoundationService } from '../features/users/foundation-service'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { CatalogPage } from '../features/catalog/CatalogPage'
import { createBrowserCatalogService } from '../features/catalog/catalog-service'
import { createBrowserOrderService } from '../features/orders/order-service'
import { createBrowserProductionQueueService } from '../features/production-queue/production-queue-service'
import { SuppliersPage } from '../features/purchase/SuppliersPage'
import { createBrowserSupplierService } from '../features/purchase/supplier-service'
import { PurchaseReceiptsPage } from '../features/purchase/PurchaseReceiptsPage'
import { createBrowserPurchaseReceiptService } from '../features/purchase/purchase-receipt-service'
import { SalesDocumentsPage } from '../features/sales-documents/SalesDocumentsPage'
import { QuotePrintPage } from '../features/sales-documents/QuotePrintPage'
import { createBrowserSalesDocumentService } from '../features/sales-documents/sales-document-service'
import { saveQuoteReopenPayload } from '../features/pos/quote-draft-handoff'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/pos" element={<PosRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/products" element={<CatalogRoute />} />
        <Route path="/suppliers" element={<SuppliersRoute />} />
        <Route path="/purchase/receipts" element={<PurchaseReceiptsRoute />} />
        <Route path="/sales-documents" element={<SalesDocumentsRoute />} />
        <Route path="/sales-documents/:id/quote-print" element={<QuotePrintRoute />} />
        <Route path="/forbidden" element={<ForbiddenRoute />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
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
    <DashboardPage
      currentUser={currentUser}
      onOpenPos={() => navigate('/pos')}
      onOpenAdmin={() => navigate('/admin')}
      onOpenCatalog={() => navigate('/products')}
      onOpenSalesDocuments={() => navigate('/sales-documents')}
      onOpenSuppliers={() => navigate('/suppliers')}
      onOpenPurchaseReceipts={() => navigate('/purchase/receipts')}
      onSignOut={() => void signOut()}
    />
  )
}

function PosRoute() {
  const { currentUser, initialized, accessConnection, signOut, getAccessToken } = useAuth()
  const navigate = useNavigate()
  const catalogService = useMemo(() => createBrowserCatalogService(getAccessToken), [getAccessToken])
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
  const { currentUser, initialized, getAccessToken } = useAuth()
  const navigate = useNavigate()
  const service = useMemo(() => createBrowserFoundationService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.access_admin_panel')) {
    return <Navigate to="/forbidden" replace />
  }

  return <FoundationAdminPage service={service} onOpenDashboard={() => navigate('/dashboard')} />
}

function CatalogRoute() {
  const { currentUser, initialized, getAccessToken } = useAuth()
  const navigate = useNavigate()
  const service = useMemo(() => createBrowserCatalogService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.edit_price_book')) {
    return <Navigate to="/forbidden" replace />
  }

  return <CatalogPage service={service} onOpenDashboard={() => navigate('/dashboard')} />
}

function SuppliersRoute() {
  const { currentUser, initialized, getAccessToken } = useAuth()
  const navigate = useNavigate()
  const service = useMemo(() => createBrowserSupplierService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.manage_inventory')) {
    return <Navigate to="/forbidden" replace />
  }

  return <SuppliersPage service={service} onOpenDashboard={() => navigate('/dashboard')} />
}

function PurchaseReceiptsRoute() {
  const { currentUser, initialized, getAccessToken } = useAuth()
  const navigate = useNavigate()
  const service = useMemo(() => createBrowserPurchaseReceiptService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.manage_inventory')) {
    return <Navigate to="/forbidden" replace />
  }

  return <PurchaseReceiptsPage service={service} onOpenDashboard={() => navigate('/dashboard')} />
}

function SalesDocumentsRoute() {
  const { currentUser, initialized, getAccessToken } = useAuth()
  const navigate = useNavigate()
  const service = useMemo(() => createBrowserSalesDocumentService(getAccessToken), [getAccessToken])
  const orderService = useMemo(() => createBrowserOrderService(getAccessToken), [getAccessToken])

  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (
    !currentUser.permissions.includes('perm.create_order') &&
    !currentUser.permissions.includes('perm.manage_finance')
  ) {
    return <Navigate to="/forbidden" replace />
  }

  return (
    <SalesDocumentsPage
      service={service}
      orderService={orderService}
      onOpenDashboard={() => navigate('/dashboard')}
      onOpenQuoteInPos={(payload) => {
        saveQuoteReopenPayload(payload)
        navigate('/pos')
      }}
      onOpenQuotePrint={(documentId) => navigate(`/sales-documents/${documentId}/quote-print`)}
    />
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
