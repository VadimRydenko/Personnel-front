import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  fetchAdminCatalog,
  getAdminUser,
  patchAdminUser,
  resetAdminUserPassword,
  searchAdminUsers,
  type AdminCatalogResponse,
  type AdminUserDetail,
} from '../app/meApi'
import {
  AdminSubNav,
  Button,
  Card,
  CardTitle,
  Divider,
  ErrorAlert,
  FieldInput,
  Muted,
  PageContent,
} from '../components/ui'
import { cn } from '../lib/cn'
import { useMe } from '../hooks/useMe'

const userDirectoryRowClass = (selected: boolean, blocked: boolean) =>
  cn(
    'w-full cursor-pointer rounded-sm border border-border bg-slate-50 px-3.5 py-3 text-left text-ink transition-[border-color,background,box-shadow] hover:border-accent/45 hover:bg-accent/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    selected && 'border-accent/75 bg-accent/10 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]',
    blocked && 'border-error/35 bg-error/[0.05] hover:border-error/50 hover:bg-error/[0.08]',
    blocked && selected && 'border-error/60 bg-error/10 shadow-[0_0_0_1px_rgba(220,38,38,0.12)]',
  )

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
        blockReason: blocked ? blockReason.trim() || null : null,
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
      <h2 className="mt-0 text-lg font-semibold text-ink">{user.email}</h2>
      <Muted>
        ID: <code>{user.id}</code>
      </Muted>

      <fieldset style={{ marginTop: 16 }}>
        <legend>Ролі</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rolesCatalog.map((r) => (
            <label key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={roleIds.includes(r.id)}
                onChange={() => roleToggle(r.id)}
              />
              <span>
                {r.roleName} <small className="text-muted">{r.notes ?? ''}</small>
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

      {patchMutation.isError ? (
        <ErrorAlert>{(patchMutation.error as Error).message}</ErrorAlert>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={detailUnchanged || roleIds.length === 0 || patchMutation.isPending}
          onClick={() => patchMutation.mutate()}
        >
          {patchMutation.isPending ? 'Збереження…' : 'Зберегти зміни'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={resetMutation.isPending || user.blocked}
          onClick={() => {
            setResetResult(null)
            void resetMutation.mutate()
          }}
        >
          {resetMutation.isPending ? 'Скидання…' : 'Скинути пароль'}
        </Button>
      </div>

      {resetMutation.isError ? (
        <ErrorAlert>{(resetMutation.error as Error).message}</ErrorAlert>
      ) : null}

      {resetResult ? (
        <div className="mt-4 rounded-sm border border-border p-3">
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

  const isSelf = useMemo(
    () => Boolean(me.data?.id && selectedId && me.data.id === selectedId),
    [me.data?.id, selectedId],
  )

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
    <PageContent>
      <Card>
        <AdminSubNav />

        <CardTitle>Користувачі</CardTitle>
        <Muted>Пошук за email або ім’ям, зміна ролей, блокування та скидання пароля.</Muted>

        <Divider />

        <form className="mb-4 flex flex-wrap gap-2" onSubmit={onSearch}>
          <FieldInput
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Пошук…"
            className="min-w-[200px] flex-[1_1_200px]"
          />
          <Button type="submit">Шукати</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setQInput('')
              setQ('')
              setPage(1)
            }}
          >
            Скинути
          </Button>
        </form>

        {list.isError ? <ErrorAlert>{(list.error as Error).message}</ErrorAlert> : null}

        <div className="flex items-start max-[900px]:flex-col">
          <div className="min-w-0 flex-[1_1_0] max-[900px]:mb-6 max-[900px]:mr-0 mr-6">
            {list.isPending ? (
              <Muted>Завантаження…</Muted>
            ) : (
              <>
                <Muted className="mt-0">Знайдено: {list.data?.total ?? 0}</Muted>
                <div className="-mx-0.5 max-h-[min(520px,58vh)] overflow-y-auto px-0.5 py-1">
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {(list.data?.items ?? []).map((u) => {
                      const selected = selectedId === u.id

                      return (
                        <li key={u.id}>
                          <button
                            type="button"
                            onClick={() => selectUser(u.id)}
                            className={userDirectoryRowClass(selected, u.blocked)}
                          >
                            <strong>{u.email}</strong>
                            {u.name ? <span className="text-muted"> · {u.name}</span> : null}
                            {u.blocked ? (
                              <span className="mt-1.5 inline-block rounded-md border border-red-200 bg-error-surface px-2 py-0.5 text-[0.75em] font-semibold uppercase tracking-wide text-error">
                                Заблоковано
                              </span>
                            ) : null}
                            <span className="mt-1 block text-[0.8em] text-muted">
                              {u.roles.map((r) => r.roleName).join(', ') || '—'}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                {list.data && list.data.total > list.data.pageSize ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Назад
                    </Button>
                    <Muted>
                      Стор. {page} / {Math.ceil(list.data.total / list.data.pageSize)}
                    </Muted>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={page * list.data.pageSize >= list.data.total}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Далі
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="min-w-0 flex-[1.2_1_0]">
            {!selectedId ? (
              <Muted>Оберіть користувача зі списку.</Muted>
            ) : detail.isPending ? (
              <Muted>Завантаження профілю…</Muted>
            ) : detail.isError ? (
              <ErrorAlert>{(detail.error as Error).message}</ErrorAlert>
            ) : isSelf ? (
              <ErrorAlert>
                Неможливо редагувати власний обліковий запис у цьому інтерфейсі.
              </ErrorAlert>
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
      </Card>
    </PageContent>
  )
}
