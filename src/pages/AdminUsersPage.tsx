import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { createManagedUser, fetchAdminCatalog } from '../app/meApi'
import { queryClient } from '../app/queryClient'
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
} from '../components/ui'

export const AdminUsersPage = () => {
  const catalog = useQuery({
    queryKey: ['admin-catalog'],
    queryFn: fetchAdminCatalog,
  })

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [roleIds, setRoleIds] = useState<number[]>([])
  const [groupIds, setGroupIds] = useState<string[]>([])
  const [permissionIds, setPermissionIds] = useState<string[]>([])
  const [created, setCreated] = useState<{ email: string; temporaryPassword: string } | null>(null)

  const createMutation = useMutation({
    mutationFn: createManagedUser,
    onSuccess: (data) => {
      setCreated({ email: data.email, temporaryPassword: data.temporaryPassword })
      void queryClient.invalidateQueries({ queryKey: ['admin-catalog'] })
    },
  })

  const canSubmit = useMemo(() => email.trim().length > 3 && roleIds.length > 0, [email, roleIds])

  const toggleNumber = (list: number[], value: number) => {
    return list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
  }

  const toggleString = (list: string[], value: string) => {
    return list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreated(null)
    await createMutation.mutateAsync({
      email: email.trim(),
      name: name.trim() || undefined,
      roleIds,
      groupIds,
      permissionIds,
    })
  }

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
          встановить обов’язкову зміну пароля при першому вході.
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
            <span className="text-[0.85rem] font-medium text-ink">Ім’я (необов’язково)</span>
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
                    onChange={() => setRoleIds((prev) => toggleNumber(prev, r.id))}
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
                    onChange={() => setGroupIds((prev) => toggleString(prev, g.id))}
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
                    onChange={() => setPermissionIds((prev) => toggleString(prev, p.id))}
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
