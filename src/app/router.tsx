import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { LoginPage } from '../features/auth/LoginPage'
import { ForbiddenPage } from './ForbiddenPage'
import { PosShell } from '../features/pos/PosShell'
import { WorkstationPage } from '../features/workstations/WorkstationPage'
import { useAuth } from '../features/auth/AuthProvider'
import { useEffect } from 'react'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/workstation" element={<WorkstationRoute />} />
        <Route path="/pos" element={<PosRoute />} />
        <Route path="/forbidden" element={<ForbiddenRoute />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}

function LoginRoute() {
  const { currentUser } = useAuth()
  if (currentUser?.workstation) return <Navigate to="/pos" replace />
  if (currentUser) return <Navigate to="/workstation" replace />
  return <LoginPage />
}

function WorkstationRoute() {
  const { currentUser, workstations, loadWorkstations, selectWorkstation } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) void loadWorkstations()
  }, [currentUser, loadWorkstations])

  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.workstation) return <Navigate to="/pos" replace />

  return (
    <WorkstationPage
      workstations={workstations}
      onSelect={async (id) => {
        await selectWorkstation(id)
        navigate('/pos', { replace: true })
      }}
    />
  )
}

function PosRoute() {
  const { currentUser, signOut } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.workstation) return <Navigate to="/workstation" replace />
  if (!currentUser.permissions.includes('perm.create_order')) return <Navigate to="/forbidden" replace />
  return <PosShell currentUser={currentUser} onSignOut={() => void signOut()} />
}

function ForbiddenRoute() {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return <ForbiddenPage />
}

function RootRedirect() {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.workstation) return <Navigate to="/workstation" replace />
  return <Navigate to="/pos" replace />
}
