import { NavLink, Outlet } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'

export function AppLayout() {
  const session = useSession()

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
