import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from './AuthProvider'
import { LoginPage } from './LoginPage'
import type { AuthService } from './auth-service'

it('submits email and password to the auth service', async () => {
  const signIn = vi.fn(async () => undefined)
  const service: AuthService = {
    signIn,
    signOut: async () => undefined,
    getAccessToken: async () => null,
  }
  render(
    <AuthProvider service={service}>
      <LoginPage />
    </AuthProvider>,
  )

  await userEvent.type(screen.getByLabelText('Email'), 'cashier@example.test')
  await userEvent.type(screen.getByLabelText('Mật khẩu'), 'password123')
  await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }))

  expect(signIn).toHaveBeenCalledWith('cashier@example.test', 'password123')
})
