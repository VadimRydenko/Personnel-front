import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../app/authClient'
import { useMe } from '../hooks/useMe'

const SECURITY_ADMIN = 'SECURITY_ADMIN'

type SessionUser = {
  mustChangePassword?: boolean | undefined
}

export function MustChangePasswordRedirect() {
  const session = useSession()
  const me = useMe()
  const location = useLocation()

  const user = session.data?.user as SessionUser | undefined
  const must = Boolean(user?.mustChangePassword)

  if (!must) {
    return null
  }

  if (location.pathname === '/change-password') {
    return null
  }

  if (me.isPending) {
    return null
  }

  const isSecurityAdmin = (me.data?.roles ?? []).some((r) => r.roleName === SECURITY_ADMIN)

  if (isSecurityAdmin) {
    return null
  }

  return <Navigate to="/change-password" replace />
}
