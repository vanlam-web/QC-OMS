import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '../features/auth/LoginPage'
import { ForbiddenPage } from './ForbiddenPage'
import { PosShell } from '../features/pos/PosShell'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forbidden', element: <ForbiddenPage /> },
  {
    path: '/pos',
    element: (
      <PosShell
        currentUser={{
          user: { id: 'demo', email: 'demo@example.test', display_name: 'Demo' },
          organization: { id: 'org', code: 'VAN-LAM', name: 'Xưởng Văn Lâm' },
          workstation: { id: 'ws', code: 'POS-01', name: 'Quầy thu ngân 1' },
          permissions: ['perm.create_order'],
        }}
        onSignOut={() => undefined}
      />
    ),
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])
