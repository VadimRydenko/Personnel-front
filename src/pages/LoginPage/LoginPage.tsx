import {
  Button,
  Card,
  CardTitle,
  ErrorAlert,
  Field,
  FieldInput,
  FieldLabel,
  Muted,
} from '../../components/ui'
import { useLoginPage } from './useLoginPage'

export const LoginPage = () => {
  const { email, setEmail, password, setPassword, isSubmitting, errorText, canSubmit, onSubmit } =
    useLoginPage()

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
