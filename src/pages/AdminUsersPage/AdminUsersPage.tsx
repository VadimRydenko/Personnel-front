import {
  AdminSubNav,
  Button,
  Card,
  CardTitle,
  Divider,
  ErrorAlert,
  Field,
  FieldInput,
  Muted,
  PageContent,
} from '../../components/ui'
import { useAdminUsersPage } from './useAdminUsersPage'

export const AdminUsersPage = () => {
  const {
    catalog,
    email,
    setEmail,
    name,
    setName,
    roleIds,
    setRoleIds,
    groupIds,
    setGroupIds,
    permissionIds,
    setPermissionIds,
    created,
    createMutation,
    canSubmit,
    onSubmit,
  } = useAdminUsersPage()

  if (catalog.isPending) {
    return (
      <PageContent>
        <Muted>Завантаження довідників…</Muted>
      </PageContent>
    )
  }

  if (catalog.isError) {
    return (
      <PageContent>
        <ErrorAlert>Не вдалося завантажити довідники (потрібні права SECURITY_ADMIN).</ErrorAlert>
      </PageContent>
    )
  }

  return (
    <PageContent>
      <Card>
        <AdminSubNav />

        <CardTitle>Створення облікового запису</CardTitle>
        <Muted>
          Призначте ролі, групи та прямі повноваження. Система згенерує тимчасовий пароль і
          встановить обов'язкову зміну пароля при першому вході.
        </Muted>

        <Divider />

        {created ? (
          <div className="mb-4 rounded-sm border border-border p-3">
            <p>
              <strong>Користувача створено.</strong> Передайте тимчасовий пароль отримувачу
              безпечним каналом.
            </p>
            <p>
              Email: <code>{created.email}</code>
            </p>
            <p>
              Тимчасовий пароль: <code>{created.temporaryPassword}</code>
            </p>
          </div>
        ) : null}

        <form className="flex max-w-[640px] flex-col gap-4" onSubmit={onSubmit}>
          <Field>
            <span className="text-[0.85rem] font-medium text-ink">Email</span>
            <FieldInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </Field>

          <Field>
            <span className="text-[0.85rem] font-medium text-ink">Ім'я (необов'язково)</span>
            <FieldInput value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <fieldset>
            <legend className="text-sm font-semibold text-ink">Ролі</legend>
            <div className="mt-2 flex flex-col gap-2">
              {catalog.data.roles.map((r) => (
                <label key={r.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={roleIds.includes(r.id)}
                    onChange={() => setRoleIds(r.id)}
                  />
                  <span>
                    {r.roleName} <small className="text-muted">{r.notes ?? ''}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-ink">Групи</legend>
            <div className="mt-2 flex flex-col gap-2">
              {catalog.data.groups.map((g) => (
                <label key={g.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={groupIds.includes(g.id)}
                    onChange={() => setGroupIds(g.id)}
                  />
                  <span>
                    {g.name} <small className="text-muted">({g.slug})</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-ink">Прямі повноваження</legend>
            <div className="mt-2 flex flex-col gap-2">
              {catalog.data.permissions.map((p) => (
                <label key={p.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={permissionIds.includes(p.id)}
                    onChange={() => setPermissionIds(p.id)}
                  />
                  <span>
                    {p.code} — {p.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {createMutation.isError ? (
            <ErrorAlert>
              {createMutation.error instanceof Error ? createMutation.error.message : 'Помилка'}
            </ErrorAlert>
          ) : null}

          <Button type="submit" disabled={!canSubmit || createMutation.isPending}>
            {createMutation.isPending ? 'Створення…' : 'Створити обліковий запис'}
          </Button>
        </form>
      </Card>
    </PageContent>
  )
}
