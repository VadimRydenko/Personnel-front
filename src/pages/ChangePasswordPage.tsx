import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'
import { hasSecurityAdminRole } from '../app/securityAdmin'
import { queryClient } from '../app/queryClient'
import { useMe } from '../hooks/useMe'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const session = useSession()
  const me = useMe()
  const isSecurityAdmin = hasSecurityAdminRole(me.data)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  const canSubmit = useMemo(
    () => currentPassword && newPassword && newPassword === confirmPassword && newPassword.length >= 8,
    [currentPassword, newPassword, confirmPassword],
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorText(null)

    if (newPassword !== confirmPassword) {
      setErrorText('Нові паролі не збігаються')

      return
    }

    if (newPassword.length < 8) {
      setErrorText('Новий пароль має бути не коротшим за 8 символів')

      return
    }

    setIsSubmitting(true)

    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })

      if (result.error) {
        setErrorText(result.error.message ?? 'Не вдалося змінити пароль')

        return
      }

      await session.refetch()
      void queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/', { replace: true })
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Не вдалося змінити пароль')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card">
      <h1>Зміна пароля</h1>
      <p className="muted">
        {isSecurityAdmin ? 'Зміна пароля облікового запису.' : 'Потрібно встановити новий пароль перед продовженням роботи.'}
      </p>

      <div className="divider" />

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Поточний пароль</span>
          <input
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Новий пароль</span>
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Підтвердження нового пароля</span>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
          />
        </label>

        {errorText ? <p className="error">{errorText}</p> : null}

        <button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? 'Збереження…' : 'Зберегти новий пароль'}
        </button>
      </form>
    </section>
  )
}
