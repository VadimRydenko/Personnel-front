import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'
import { fetchMe } from '../app/meApi'
import { queryClient } from '../app/queryClient'
import { hasSecurityAdminRole } from '../app/securityAdmin'

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
      navigate(hasSecurityAdminRole(meData) ? '/admin/users' : '/', { replace: true })
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Не вдалося увійти')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="loginPage">
      <div className="loginBrand">
        <span className="loginBrandName">Штат</span>
        <span className="loginBrandMeta">Система управління персоналом</span>
      </div>

      <section className="loginCard card">
        <h1 className="loginTitle">Вхід</h1>
        <p className="muted loginSubtitle">Нові облікові записи створює адміністратор безпеки.</p>

        <form className="loginForm" onSubmit={onSubmit}>
          <label className="field">
            <span className="fieldLabel">Email</span>
            <input
              className="fieldInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="name@example.com"
            />
          </label>

          <label className="field">
            <span className="fieldLabel">Пароль</span>
            <input
              className="fieldInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          {errorText ? <p className="error">{errorText}</p> : null}

          <button type="submit" className="btn btnPrimary" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Вхід…' : 'Увійти'}
          </button>
        </form>
      </section>
    </div>
  )
}
