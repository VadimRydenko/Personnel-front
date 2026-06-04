import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  patchAdminUser,
  resetAdminUserPassword,
  type AdminCatalogResponse,
  type AdminUserDetail,
} from '../../app/meApi'
import { Button, ErrorAlert, Muted } from '../../components/ui'

type UserEditPanelProps = {
  user: AdminUserDetail
  rolesCatalog: AdminCatalogResponse['roles']
  onInvalidateList: () => Promise<void>
}

const rolesEqual = (a: number[], b: AdminUserDetail['roles']) => {
  const sortedA = [...a].sort((x, y) => x - y)
  const sortedB = b.map((r) => r.id).sort((x, y) => x - y)

  if (sortedA.length !== sortedB.length) return false

  return sortedA.every((v, i) => v === sortedB[i])
}

export const UserEditPanel = ({ user, rolesCatalog, onInvalidateList }: UserEditPanelProps) => {
  const queryClient = useQueryClient()

  const [roleIds, setRoleIds] = useState(() => user.roles.map((r) => r.id))
  const [blocked, setBlocked] = useState(user.blocked)
  const [blockReason, setBlockReason] = useState(user.blockReason ?? '')
  const [resetResult, setResetResult] = useState<string | null>(null)

  const roleToggle = (id: number) =>
    setRoleIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

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
