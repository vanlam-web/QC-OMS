import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../features/auth/AuthProvider'
import type { ReactNode } from 'react'

const queryClient = new QueryClient()

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
