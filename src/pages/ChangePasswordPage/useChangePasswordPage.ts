import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient, useSession } from '../../app/authClient'
import {
  getPasswordComplexityIssues,
  isPasswordComplexityOk,
  isPasswordExpiredByMaxAge,
  isPasswordNovelEnough,
  MIN_PASSWORD_NOVELTY_RATIO,
  passwordNoveltyRatio,
  passwordValidUntil,
} from '../../app/passwordPolicy'
import { hasSecurityAdminRole } from '../../app/securityAdmin'
import { queryClient } from '../../app/queryClient'
import { useMe } from '../../hooks/useMe'

export const useChangePasswordPage = () => {
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

    if (!raw) return null

    const until = passwordValidUntil(raw)

    if (Number.isNaN(until.getTime())) return null

    return {
      untilLabel: until.toLocaleDateString('uk-UA'),
      expired: isPasswordExpiredByMaxAge(raw),
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

  return {
    me,
    isSecurityAdmin,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,
    errorText,
    complexityIssues,
    noveltyRatio,
    noveltyOk,
    canSubmit,
    passwordExpiryInfo,
    onSubmit,
  }
}
