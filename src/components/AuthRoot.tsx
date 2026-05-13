import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../app/authClient'
import { AppLayout } from './AppLayout'
import { GuestLayout } from './GuestLayout'
import { MustChangePasswordRedirect } from './MustChangePasswordRedirect'

export function AuthRoot() {
  const session = useSession()
  const location = useLocation()
  const isLoginPath = location.pathname === '/login'

  if (session.isPending) {
    return (
      <div className="app">
        <main className="container appMain">
          <p className="muted">Завантаження…</p>
        </main>
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
