import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'
import { getInitials } from '../app/displayName'
import { mainNavItems } from '../app/navItems'
import { queryClient } from '../app/queryClient'
import { hasSecurityAdminRole } from '../app/securityAdmin'
import { useMe } from '../hooks/useMe'
import { NavIcon } from './NavIcon'

export function AppLayout() {
  const session = useSession()
  const me = useMe()
  const location = useLocation()
  const user = session.data?.user
  const showAdminNav =
    Boolean(user) && me.isSuccess && hasSecurityAdminRole(me.data)
  const adminNavActive = location.pathname.startsWith('/admin/users')

  const displayName = user
    ? me.data?.name?.trim() || user.name?.trim() || user.email
    : ''
  const initials = user ? getInitials(me.data?.name ?? user.name, user.email) : '?'
  const roleLabel = me.data?.roles[0]?.roleName ?? 'Користувач'

  return (
    <div className="appShell">
      <aside className="sidebar" aria-label="Головна навігація">
        <div className="sidebarTop">
          <div className="sidebarBrand">
            <span className="sidebarBrandName">Штат</span>
            <span className="sidebarBrandMeta">v2.4.1 · 2025</span>
          </div>
          <label className="sidebarSearch">
            <span className="visuallyHidden">Пошук</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input type="search" placeholder="Пошук…" disabled />
          </label>
        </div>

        <nav className="sidebarNav">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebarNavLink${isActive ? ' sidebarNavLink--active' : ''}`}
            >
              <span className="sidebarNavIcon">
                <NavIcon name={item.icon} />
              </span>
              <span className="sidebarNavLabel">{item.label}</span>
              {item.badge != null ? <span className="sidebarNavBadge">{item.badge}</span> : null}
            </NavLink>
          ))}
          {showAdminNav ? (
            <NavLink
              to="/admin/users/directory"
              className={() =>
                `sidebarNavLink${adminNavActive ? ' sidebarNavLink--active' : ''}`
              }
            >
              <span className="sidebarNavIcon">
                <NavIcon name="directories" />
              </span>
              <span className="sidebarNavLabel">Адміністрування</span>
            </NavLink>
          ) : null}
        </nav>

        <div className="sidebarFooter">
          <div className="sidebarUser">
            <span className="sidebarAvatar" aria-hidden>
              {initials}
            </span>
            <div className="sidebarUserText">
              <span className="sidebarUserName">{displayName}</span>
              <span className="sidebarUserRole">{roleLabel}</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebarLogout"
            title="Вийти"
            onClick={async () => {
              await authClient.signOut()
              void queryClient.invalidateQueries({ queryKey: ['me'] })
              await session.refetch()
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
              <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="visuallyHidden">Вийти</span>
          </button>
        </div>
      </aside>

      <main className="mainShell">
        <Outlet />
      </main>
    </div>
  )
}
