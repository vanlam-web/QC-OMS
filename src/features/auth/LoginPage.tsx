import { FormEvent, useState } from 'react'
import { useAuthService } from './AuthProvider'

export function LoginPage() {
  const auth = useAuthService()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await auth.signIn(email, password)
    } catch {
      setError('Đăng nhập không thành công.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <form aria-label="Đăng nhập" onSubmit={submit}>
        <h1>QC-OMS</h1>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>
        <label>
          Mật khẩu
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <button disabled={submitting} type="submit">
          Đăng nhập
        </button>
      </form>
    </main>
  )
}
