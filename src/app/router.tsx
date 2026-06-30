import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { LoginPage } from '../features/auth/LoginPage'
import { ForbiddenPage } from './ForbiddenPage'
import { PosShell } from '../features/pos/PosShell'
import { useAuth } from '../features/auth/auth-context'
import { useMemo } from 'react'
import { FoundationAdminPage } from '../features/admin/FoundationAdminPage'
import { createBrowserFoundationService } from '../features/users/foundation-service'
import { DashboardPage } from '../features/dashboard/DashboardPage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/pos" element={<PosRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
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
      onSignOut={() => void signOut()}
    />
  )
}

function PosRoute() {
  const { currentUser, initialized, accessConnection, signOut } = useAuth()
  const navigate = useNavigate()
  if (!initialized) return <BootstrapScreen />
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.permissions.includes('perm.create_order')) return <Navigate to="/forbidden" replace />
  return (
    <PosShell
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
