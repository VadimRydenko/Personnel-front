import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'

export function LoginPage() {
  const navigate = useNavigate()
  const session = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  const canSubmit = useMemo(() => email.trim() && password, [email, password])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorText(null)
    setIsSubmitting(true)

    try {
      const trimmedEmail = email.trim()
      const result =
        mode === 'sign-up'
          ? await authClient.signUp.email({
              email: trimmedEmail,
              password,
              name: trimmedEmail.split('@')[0] ?? 'User',
            })
          : await authClient.signIn.email({
              email: trimmedEmail,
              password,
            })

      if (result.error) {
        setErrorText(result.error.message ?? (mode === 'sign-up' ? 'Sign-up failed' : 'Sign-in failed'))

        return
      }

      await session.refetch()
      navigate('/')
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : mode === 'sign-up' ? 'Sign-up failed' : 'Sign-in failed',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card">
      <h1>{mode === 'sign-up' ? 'Create account' : 'Login'}</h1>

      <div className="divider" />

      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setMode('sign-in')}
            disabled={isSubmitting}
            aria-pressed={mode === 'sign-in'}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('sign-up')}
            disabled={isSubmitting}
            aria-pressed={mode === 'sign-up'}
          >
            Sign up
          </button>
        </div>

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
          {isSubmitting ? (mode === 'sign-up' ? 'Creating…' : 'Signing in…') : mode === 'sign-up' ? 'Create' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}
