import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../app/authClient'
import { hasSecurityAdminRole } from '../app/securityAdmin'
import { useMe } from '../hooks/useMe'
import { Muted } from './ui'

export function RequireAuth(props: { children: ReactNode; adminOnly?: boolean | undefined }) {
  const session = useSession()
  const me = useMe()
  const location = useLocation()

  if (session.isPending) {
    return <Muted>Завантаження сесії…</Muted>
  }

  if (!session.data?.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (props.adminOnly) {
    if (me.isPending) {
      return <Muted>Завантаження профілю…</Muted>
    }

    if (me.isError || !hasSecurityAdminRole(me.data)) {
      return <Navigate to="/" replace />
    }
  }

  return props.children
}
