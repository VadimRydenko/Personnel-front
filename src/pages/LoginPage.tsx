import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'
import { fetchMe } from '../app/meApi'
import { queryClient } from '../app/queryClient'
import { hasSecurityAdminRole } from '../app/securityAdmin'
import {
  Button,
  Card,
  CardTitle,
  ErrorAlert,
  Field,
  FieldInput,
  FieldLabel,
  Muted,
} from '../components/ui'

export const LoginPage = () => {
  const navigate = useNavigate()
  const session = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  const canSubmit = useMemo(() => email.trim() && password, [email, password])

  const onSubmit = async (e: React.FormEvent) => {
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
    <div className="flex w-full max-w-[420px] flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <span className="text-[1.75rem] font-bold tracking-[-0.02em] text-sidebar">Штат</span>
        <span className="text-sm text-muted">Система управління персоналом</span>
      </div>

      <Card className="px-7 pb-8 pt-7">
        <CardTitle>Вхід</CardTitle>
        <Muted className="mb-5 text-sm">Нові облікові записи створює адміністратор безпеки.</Muted>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <FieldInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="name@example.com"
            />
          </Field>

          <Field>
            <FieldLabel>Пароль</FieldLabel>
            <FieldInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </Field>

          {errorText ? <ErrorAlert>{errorText}</ErrorAlert> : null}

          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Вхід…' : 'Увійти'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
