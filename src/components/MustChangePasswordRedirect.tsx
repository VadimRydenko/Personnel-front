import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../app/authClient'
import { hasSecurityAdminRole } from '../app/securityAdmin'
import { useMe } from '../hooks/useMe'

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

  if (hasSecurityAdminRole(me.data)) {
    return null
  }

  return <Navigate to="/change-password" replace />
}
