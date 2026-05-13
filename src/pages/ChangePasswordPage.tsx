import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'
import {
  complexityIssueLabel,
  getPasswordComplexityIssues,
  isPasswordComplexityOk,
  isPasswordExpiredByMaxAge,
  isPasswordNovelEnough,
  MIN_PASSWORD_LENGTH,
  MIN_PASSWORD_NOVELTY_RATIO,
  passwordNoveltyRatio,
  passwordValidUntil,
  PASSWORD_MAX_VALIDITY_DAYS,
} from '../app/passwordPolicy'
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

  const complexityIssues = useMemo(() => getPasswordComplexityIssues(newPassword), [newPassword])

  const noveltyRatio = useMemo(
    () => (currentPassword ? passwordNoveltyRatio(currentPassword, newPassword) : 0),
    [currentPassword, newPassword],
  )

  const noveltyOk = useMemo(
    () => currentPassword.length > 0 && isPasswordNovelEnough(currentPassword, newPassword),
    [currentPassword, newPassword],
  )

  const canSubmit = useMemo(
    () =>
      Boolean(currentPassword) &&
      newPassword === confirmPassword &&
      isPasswordComplexityOk(newPassword) &&
      noveltyOk,
    [currentPassword, newPassword, confirmPassword, noveltyOk],
  )

  const passwordExpiryInfo = useMemo(() => {
    const raw = me.data?.passwordChangedAt

    if (!raw) {
      return null
    }

    const until = passwordValidUntil(raw)

    if (Number.isNaN(until.getTime())) {
      return null
    }

    const expired = isPasswordExpiredByMaxAge(raw)

    return {
      untilLabel: until.toLocaleDateString('uk-UA'),
      expired,
    }
  }, [me.data?.passwordChangedAt])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorText(null)

    if (newPassword !== confirmPassword) {
      setErrorText('Нові паролі не збігаються')

      return
    }

    if (!isPasswordComplexityOk(newPassword)) {
      setErrorText('Новий пароль не відповідає вимогам складності')

      return
    }

    if (!isPasswordNovelEnough(currentPassword, newPassword)) {
      setErrorText(
        `Новий пароль занадто схожий на поточний: потрібно щонайменше ${Math.round(MIN_PASSWORD_NOVELTY_RATIO * 100)}% відмінних позицій (зараз ${Math.round(noveltyRatio * 100)}%).`,
      )

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

      {passwordExpiryInfo?.expired ? (
        <p className="error" style={{ marginTop: 12 }}>
          Термін дії поточного пароля перевищено ({PASSWORD_MAX_VALIDITY_DAYS} днів). Встановіть новий пароль.
        </p>
      ) : null}

      {passwordExpiryInfo && !passwordExpiryInfo.expired ? (
        <p className="muted" style={{ marginTop: 12 }}>
          Поточний пароль дійсний до {passwordExpiryInfo.untilLabel} (не більше {PASSWORD_MAX_VALIDITY_DAYS} днів від останньої зміни).
        </p>
      ) : null}

      {!me.data?.passwordChangedAt ? (
        <p className="muted" style={{ marginTop: 12 }}>
          Політика: пароль діє не довше {PASSWORD_MAX_VALIDITY_DAYS} днів від моменту встановлення (контроль на сервері).
        </p>
      ) : null}

      <div className="divider" />

      <p className="muted" style={{ marginBottom: 0 }}>
        Вимоги до нового пароля:
      </p>
      <ul className="muted" style={{ marginTop: 8, marginBottom: 16, paddingLeft: 20 }}>
        <li>щонайменше {MIN_PASSWORD_LENGTH} символів;</li>
        <li>велика й мала літера, цифра та спецсимвол (мінімум по одному);</li>
        <li>
          відмінність від поточного пароля щонайменше на {Math.round(MIN_PASSWORD_NOVELTY_RATIO * 100)}% позицій (порівняння по
          довжині max(старий, новий));
        </li>
        <li>термін дії — до {PASSWORD_MAX_VALIDITY_DAYS} днів від зміни.</li>
      </ul>

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

        {newPassword ? (
          <ul className={complexityIssues.length ? 'error' : 'muted'} style={{ margin: 0, paddingLeft: 20, fontSize: '0.9em' }}>
            {complexityIssues.length
              ? complexityIssues.map((issue) => <li key={issue}>{complexityIssueLabel(issue)}</li>)
              : (
                  <li>Складність: вимоги виконано</li>
                )}
          </ul>
        ) : null}

        {currentPassword && newPassword ? (
          <p className={noveltyOk ? 'muted' : 'error'} style={{ margin: 0, fontSize: '0.9em' }}>
            Відмінність від поточного: {Math.round(noveltyRatio * 100)}% (потрібно ≥ {Math.round(MIN_PASSWORD_NOVELTY_RATIO * 100)}%)
          </p>
        ) : null}

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
