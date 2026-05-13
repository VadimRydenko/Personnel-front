import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'
import { fetchMe } from '../app/meApi'
import { queryClient } from '../app/queryClient'

const SECURITY_ADMIN = 'SECURITY_ADMIN'

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
      const trimmedEmail = email.trim()
      const result = await authClient.signIn.email({
        email: trimmedEmail,
        password,
      })

      if (result.error) {
        setErrorText(result.error.message ?? 'Не вдалося увійти')

        return
      }

      await session.refetch()

      let meData: Awaited<ReturnType<typeof fetchMe>>

      try {
        meData = await fetchMe()
      } catch {
        void queryClient.invalidateQueries({ queryKey: ['me'] })
        navigate('/', { replace: true })

        return
      }

      void queryClient.setQueryData(['me', meData.id], meData)
      const isSecurityAdmin = meData.roles.some((r) => r.roleName === SECURITY_ADMIN)

      navigate(isSecurityAdmin ? '/admin/users' : '/', { replace: true })
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Не вдалося увійти')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card">
      <h1>Вхід</h1>
      <p className="muted">Нові облікові записи створює адміністратор безпеки.</p>

      <div className="divider" />

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Пароль</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </label>

        {errorText ? <p className="error">{errorText}</p> : null}

        <button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? 'Вхід…' : 'Увійти'}
        </button>
      </form>
    </section>
  )
}
