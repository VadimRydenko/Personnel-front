import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../app/authClient'
import { useMe } from '../hooks/useMe'

const SECURITY_ADMIN = 'SECURITY_ADMIN'

export function RequireAuth(props: { children: ReactNode; adminOnly?: boolean | undefined }) {
  const session = useSession()
  const me = useMe()
  const location = useLocation()

  if (session.isPending) {
    return <p className="muted">Завантаження сесії…</p>
  }

  if (!session.data?.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (props.adminOnly) {
    if (me.isPending) {
      return <p className="muted">Завантаження профілю…</p>
    }

    if (me.isError) {
      return <p className="error">Немає доступу до адміністрування.</p>
    }

    const isAdmin = me.data?.roles.some((r) => r.roleName === SECURITY_ADMIN) ?? false

    if (!isAdmin) {
      return <Navigate to="/" replace />
    }
  }

  return props.children
}
