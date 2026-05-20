import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../app/authClient'
import { AppLayout } from './AppLayout'
import { GuestLayout } from './GuestLayout'
import { MustChangePasswordRedirect } from './MustChangePasswordRedirect'
import { Muted } from './ui'

export function AuthRoot() {
  const session = useSession()
  const location = useLocation()
  const isLoginPath = location.pathname === '/login'

  if (session.isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-main p-6">
        <Muted>Завантаження…</Muted>
      </div>
    )
  }

  if (!session.data?.user) {
    if (!isLoginPath) {
      return <Navigate to="/login" replace />
    }

    return (
      <>
        <MustChangePasswordRedirect />
        <GuestLayout />
      </>
    )
  }

  if (isLoginPath) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <MustChangePasswordRedirect />
      <AppLayout />
    </>
  )
}
