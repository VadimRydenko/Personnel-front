import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'

export function LoginPage() {
  const navigate = useNavigate()
  const session = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  const canSubmit = useMemo(() => email.trim() && password, [email, password])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorText(null)
    setIsSubmitting(true)
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorText(error.message ?? 'Sign-in failed')
        return
      }

      await session.refetch()
      navigate('/')
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card">
      <h1>Login</h1>

      <div className="divider" />

      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </label>

        {errorText ? <p className="error">{errorText}</p> : null}

        <button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}

