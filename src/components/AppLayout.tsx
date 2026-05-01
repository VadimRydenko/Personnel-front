import { NavLink, Outlet } from 'react-router-dom'

export function AppLayout() {
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
          </nav>
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
