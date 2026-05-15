import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import {
  fetchAdminCatalog,
  getAdminUser,
  patchAdminUser,
  resetAdminUserPassword,
  searchAdminUsers,
  type AdminCatalogResponse,
  type AdminUserDetail,
} from '../app/meApi'
import { useMe } from '../hooks/useMe'

type UserEditPanelProps = {
  user: AdminUserDetail
  rolesCatalog: AdminCatalogResponse['roles']
  onInvalidateList: () => Promise<void>
}

function UserEditPanel(props: UserEditPanelProps) {
  const { user, rolesCatalog, onInvalidateList } = props
  const queryClient = useQueryClient()

  const [roleIds, setRoleIds] = useState(() => user.roles.map((r) => r.id))
  const [blocked, setBlocked] = useState(user.blocked)
  const [blockReason, setBlockReason] = useState(user.blockReason ?? '')
  const [resetResult, setResetResult] = useState<string | null>(null)

  function roleToggle(id: number) {
    setRoleIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function rolesEqual(a: number[], b: AdminUserDetail['roles']) {
    const sortedA = [...a].sort((x, y) => x - y)
    const sortedB = b.map((r) => r.id).sort((x, y) => x - y)

    if (sortedA.length !== sortedB.length) return false

    return sortedA.every((v, i) => v === sortedB[i])
  }

  const detailUnchanged = useMemo(() => {
    const sameRoles = rolesEqual(roleIds, user.roles)
    const sameBlocked = blocked === user.blocked
    const sameReason = (user.blockReason ?? '') === blockReason

    return sameRoles && sameBlocked && sameReason
  }, [user, roleIds, blocked, blockReason])

  const patchMutation = useMutation({
    mutationFn: () =>
      patchAdminUser(user.id, {
        roleIds,
        blocked,
        blockReason: blocked ? (blockReason.trim() || null) : null,
      }),
    onSuccess: async () => {
      setResetResult(null)
      await onInvalidateList()
      await queryClient.invalidateQueries({ queryKey: ['admin-user', user.id] })
    },
  })

  const resetMutation = useMutation({
    mutationFn: () => resetAdminUserPassword(user.id),
    onSuccess: async (data) => {
      setResetResult(data.temporaryPassword)
      await onInvalidateList()
      await queryClient.invalidateQueries({ queryKey: ['admin-user', user.id] })
    },
  })

  return (
    <>
      <h2 style={{ marginTop: 0 }}>{user.email}</h2>
      <p className="muted">
        ID: <code>{user.id}</code>
      </p>

      <fieldset style={{ marginTop: 16 }}>
        <legend>Ролі</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rolesCatalog.map((r) => (
            <label key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={roleIds.includes(r.id)} onChange={() => roleToggle(r.id)} />
              <span>
                {r.roleName} <small className="muted">{r.notes ?? ''}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset style={{ marginTop: 16 }}>
        <legend>Блокування</legend>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={blocked} onChange={(e) => setBlocked(e.target.checked)} />
          <span>Заблоковано</span>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          <span>Причина (якщо блокуєте)</span>
          <textarea
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            rows={3}
            disabled={!blocked}
          />
        </label>
      </fieldset>

      {patchMutation.isError ? <p className="error">{(patchMutation.error as Error).message}</p> : null}

      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={detailUnchanged || roleIds.length === 0 || patchMutation.isPending}
          onClick={() => patchMutation.mutate()}
        >
          {patchMutation.isPending ? 'Збереження…' : 'Зберегти зміни'}
        </button>
        <button
          type="button"
          disabled={resetMutation.isPending || user.blocked}
          onClick={() => {
            setResetResult(null)
            void resetMutation.mutate()
          }}
        >
          {resetMutation.isPending ? 'Скидання…' : 'Скинути пароль'}
        </button>
      </div>

      {resetMutation.isError ? <p className="error">{(resetMutation.error as Error).message}</p> : null}

      {resetResult ? (
        <div style={{ marginTop: 16, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
          <p>
            <strong>Новий тимчасовий пароль</strong> (покажіть лише один раз):
          </p>
          <code>{resetResult}</code>
        </div>
      ) : null}
    </>
  )
}

export function AdminUserDirectoryPage() {
  const queryClient = useQueryClient()
  const me = useMe()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('user') ?? ''

  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const catalog = useQuery({ queryKey: ['admin-catalog'], queryFn: fetchAdminCatalog })
  const list = useQuery({
    queryKey: ['admin-users', q, page],
    queryFn: () => searchAdminUsers({ q: q || undefined, page, pageSize: 15 }),
    enabled: catalog.isSuccess,
  })

  const detail = useQuery({
    queryKey: ['admin-user', selectedId],
    queryFn: () => getAdminUser(selectedId),
    enabled: Boolean(selectedId),
  })

  const isSelf = useMemo(() => Boolean(me.data?.id && selectedId && me.data.id === selectedId), [me.data?.id, selectedId])

  const invalidateList = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  }, [queryClient])

  const selectUser = useCallback(
    (id: string) => {
      setSearchParams(id ? { user: id } : {})
    },
    [setSearchParams],
  )

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    setQ(qInput.trim())
    setPage(1)
  }

  return (
    <section className="card">
      <nav style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <NavLink to="/admin/users/directory" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Користувачі
        </NavLink>
        <NavLink to="/admin/users" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Створити
        </NavLink>
      </nav>

      <h1>Користувачі</h1>
      <p className="muted">Пошук за email або ім’ям, зміна ролей, блокування та скидання пароля.</p>

      <div className="divider" />

      <form onSubmit={onSearch} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Пошук…"
          style={{ flex: '1 1 200px' }}
        />
        <button type="submit">Шукати</button>
        <button
          type="button"
          onClick={() => {
            setQInput('')
            setQ('')
            setPage(1)
          }}
        >
          Скинути
        </button>
      </form>

      {list.isError ? <p className="error">{(list.error as Error).message}</p> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr)', gap: 24 }}>
        <div>
          {list.isPending ? (
            <p className="muted">Завантаження…</p>
          ) : (
            <>
              <p className="muted" style={{ marginTop: 0 }}>
                Знайдено: {list.data?.total ?? 0}
              </p>
              <div className="userDirectoryResults">
                <ul className="userDirectoryList">
                  {(list.data?.items ?? []).map((u) => {
                    const selected = selectedId === u.id

                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => selectUser(u.id)}
                          className={[
                            'userDirectoryRow',
                            selected ? 'userDirectoryRow--selected' : '',
                            u.blocked ? 'userDirectoryRow--blocked' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <strong>{u.email}</strong>
                          {u.name ? (
                            <span className="muted">
                              {' '}
                              · {u.name}
                            </span>
                          ) : null}
                          {u.blocked ? <span className="userDirectoryRowBadge">Заблоковано</span> : null}
                          <span className="userDirectoryRowMeta">{u.roles.map((r) => r.roleName).join(', ') || '—'}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
              {list.data && list.data.total > list.data.pageSize ? (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Назад
                  </button>
                  <span className="muted">
                    Стор. {page} / {Math.ceil(list.data.total / list.data.pageSize)}
                  </span>
                  <button
                    type="button"
                    disabled={page * list.data.pageSize >= list.data.total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Далі
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div>
          {!selectedId ? (
            <p className="muted">Оберіть користувача зі списку.</p>
          ) : detail.isPending ? (
            <p className="muted">Завантаження профілю…</p>
          ) : detail.isError ? (
            <p className="error">{(detail.error as Error).message}</p>
          ) : isSelf ? (
            <p className="error">Неможливо редагувати власний обліковий запис у цьому інтерфейсі.</p>
          ) : catalog.isSuccess && detail.data ? (
            <UserEditPanel
              key={`${detail.data.id}-${detail.data.updatedAt}`}
              user={detail.data}
              rolesCatalog={catalog.data.roles}
              onInvalidateList={invalidateList}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
