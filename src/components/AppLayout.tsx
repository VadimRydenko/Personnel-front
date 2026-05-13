import { NavLink, Outlet } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'
import { hasSecurityAdminRole } from '../app/securityAdmin'
import { queryClient } from '../app/queryClient'
import { useMe } from '../hooks/useMe'

export function AppLayout() {
  const session = useSession()
  const me = useMe()
  const showAdminNav =
    Boolean(session.data?.user) && me.isSuccess && hasSecurityAdminRole(me.data)

  return (
    <div className="app">
      <header className="appHeader">
        <div className="container appHeaderInner">
          <div className="brand">Personnel</div>
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Home
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              About
            </NavLink>
            {showAdminNav ? (
              <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Admin
              </NavLink>
            ) : null}
          </nav>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {session.isPending ? (
              <small className="muted">auth…</small>
            ) : (
              <>
                <small className="muted">{session.data?.user.email ?? session.data?.user.name}</small>
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
