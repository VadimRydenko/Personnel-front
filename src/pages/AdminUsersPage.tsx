import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { createManagedUser, fetchAdminCatalog } from '../app/meApi'
import { queryClient } from '../app/queryClient'

export function AdminUsersPage() {
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

  function toggleNumber(list: number[], value: number) {
    return list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
  }

  function toggleString(list: string[], value: string) {
    return list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
  }

  async function onSubmit(e: React.FormEvent) {
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
    return <p className="muted">Завантаження довідників…</p>
  }

  if (catalog.isError) {
    return <p className="error">Не вдалося завантажити довідники (потрібні права SECURITY_ADMIN).</p>
  }

  return (
    <section className="card">
      <h1>Створення облікового запису</h1>
      <p className="muted">
        Призначте ролі, групи та прямі повноваження. Система згенерує тимчасовий пароль і встановить обов’язкову зміну пароля
        при першому вході.
      </p>

      <div className="divider" />

      {created ? (
        <div style={{ marginBottom: 16, padding: 12, border: '1px solid var(--border, #ccc)', borderRadius: 8 }}>
          <p>
            <strong>Користувача створено.</strong> Передайте тимчасовий пароль отримувачу безпечним каналом.
          </p>
          <p>
            Email: <code>{created.email}</code>
          </p>
          <p>
            Тимчасовий пароль: <code>{created.temporaryPassword}</code>
          </p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Ім’я (необов’язково)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <fieldset>
          <legend>Ролі</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {catalog.data.roles.map((r) => (
              <label key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={roleIds.includes(r.id)}
                  onChange={() => setRoleIds((prev) => toggleNumber(prev, r.id))}
                />
                <span>
                  {r.roleName} <small className="muted">{r.notes ?? ''}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Групи</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {catalog.data.groups.map((g) => (
              <label key={g.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={groupIds.includes(g.id)}
                  onChange={() => setGroupIds((prev) => toggleString(prev, g.id))}
                />
                <span>
                  {g.name} <small className="muted">({g.slug})</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Прямі повноваження</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {catalog.data.permissions.map((p) => (
              <label key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
          <p className="error">{createMutation.error instanceof Error ? createMutation.error.message : 'Помилка'}</p>
        ) : null}

        <button type="submit" disabled={!canSubmit || createMutation.isPending}>
          {createMutation.isPending ? 'Створення…' : 'Створити обліковий запис'}
        </button>
      </form>
    </section>
  )
}
