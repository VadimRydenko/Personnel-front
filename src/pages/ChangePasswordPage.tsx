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
import {
  Button,
  Card,
  CardTitle,
  Divider,
  ErrorAlert,
  Field,
  FieldInput,
  FieldLabel,
  Muted,
  PageContent,
} from '../components/ui'
import { cn } from '../lib/cn'
import { useMe } from '../hooks/useMe'

export const ChangePasswordPage = () => {
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

  const onSubmit = async (e: React.FormEvent) => {
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
    <PageContent>
      <Card className="max-w-[640px]">
        <CardTitle>Зміна пароля</CardTitle>
        <Muted>
          {isSecurityAdmin
            ? 'Зміна пароля облікового запису.'
            : 'Потрібно встановити новий пароль перед продовженням роботи.'}
        </Muted>

        {passwordExpiryInfo?.expired ? (
          <ErrorAlert className="mt-3">
            Термін дії поточного пароля перевищено ({PASSWORD_MAX_VALIDITY_DAYS} днів). Встановіть
            новий пароль.
          </ErrorAlert>
        ) : null}

        {passwordExpiryInfo && !passwordExpiryInfo.expired ? (
          <Muted className="mt-3">
            Поточний пароль дійсний до {passwordExpiryInfo.untilLabel} (не більше{' '}
            {PASSWORD_MAX_VALIDITY_DAYS} днів від останньої зміни).
          </Muted>
        ) : null}

        {!me.data?.passwordChangedAt ? (
          <Muted className="mt-3">
            Політика: пароль діє не довше {PASSWORD_MAX_VALIDITY_DAYS} днів від моменту встановлення
            (контроль на сервері).
          </Muted>
        ) : null}

        <Divider />

        <Muted className="mb-0">Вимоги до нового пароля:</Muted>
        <ul className="mb-4 mt-2 list-disc pl-5 text-muted">
          <li>щонайменше {MIN_PASSWORD_LENGTH} символів;</li>
          <li>велика й мала літера, цифра та спецсимвол (мінімум по одному);</li>
          <li>
            відмінність від поточного пароля щонайменше на{' '}
            {Math.round(MIN_PASSWORD_NOVELTY_RATIO * 100)}% позицій (порівняння по довжині
            max(старий, новий));
          </li>
          <li>термін дії — до {PASSWORD_MAX_VALIDITY_DAYS} днів від зміни.</li>
        </ul>

        <form className="flex max-w-[420px] flex-col gap-3" onSubmit={onSubmit}>
          <Field>
            <FieldLabel>Поточний пароль</FieldLabel>
            <FieldInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </Field>

          <Field>
            <FieldLabel>Новий пароль</FieldLabel>
            <FieldInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
            />
          </Field>

          {newPassword ? (
            <ul
              className={cn(
                'm-0 list-disc pl-5 text-sm',
                complexityIssues.length ? 'text-error' : 'text-muted',
              )}
            >
              {complexityIssues.length ? (
                complexityIssues.map((issue) => <li key={issue}>{complexityIssueLabel(issue)}</li>)
              ) : (
                <li>Складність: вимоги виконано</li>
              )}
            </ul>
          ) : null}

          {currentPassword && newPassword ? (
            <p className={cn('m-0 text-sm', noveltyOk ? 'text-muted' : 'text-error')}>
              Відмінність від поточного: {Math.round(noveltyRatio * 100)}% (потрібно ≥{' '}
              {Math.round(MIN_PASSWORD_NOVELTY_RATIO * 100)}%)
            </p>
          ) : null}

          <Field>
            <FieldLabel>Підтвердження нового пароля</FieldLabel>
            <FieldInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
            />
          </Field>

          {errorText ? <ErrorAlert>{errorText}</ErrorAlert> : null}

          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Збереження…' : 'Зберегти новий пароль'}
          </Button>
        </form>
      </Card>
    </PageContent>
  )
}
