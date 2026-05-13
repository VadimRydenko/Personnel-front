import { NavLink, Outlet } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'
import { queryClient } from '../app/queryClient'
import { useMe } from '../hooks/useMe'

const SECURITY_ADMIN = 'SECURITY_ADMIN'

export function AppLayout() {
  const session = useSession()
  const me = useMe()
  const isSecurityAdmin = Boolean(me.data?.roles.some((r) => r.roleName === SECURITY_ADMIN))

  return (
    <div className="app">
      <header className="appHeader">
        <div className="container appHeaderInner">
          <div className="brand">Personnel</div>
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Home
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Login
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              About
            </NavLink>
            {session.data?.user && isSecurityAdmin ? (
              <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Admin
              </NavLink>
            ) : null}
          </nav>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {session.isPending ? (
              <small className="muted">auth…</small>
            ) : session.data?.user ? (
              <>
                <small className="muted">{session.data.user.email ?? session.data.user.name}</small>
                <button
                  onClick={async () => {
                    await authClient.signOut()
                    void queryClient.invalidateQueries({ queryKey: ['me'] })
                    await session.refetch()
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <small className="muted">guest</small>
            )}
          </div>
        </div>
      </header>

      <main className="container appMain">
        <Outlet />
      </main>

      <footer className="container appFooter">
        <small>Vite + React + TS • router + react-query • eslint + prettier</small>
      </footer>
    </div>
  )
}
