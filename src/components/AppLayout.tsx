import { LogOut, Search, Shield } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'
import { getInitials } from '../app/displayName'
import { mainNavItems } from '../app/navItems'
import { queryClient } from '../app/queryClient'
import { hasSecurityAdminRole } from '../app/securityAdmin'
import { useMe } from '../hooks/useMe'
import { navIconProps } from './iconDefaults'

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
            <Search size={16} strokeWidth={2} aria-hidden />
            <input type="search" placeholder="Пошук…" disabled />
          </label>
        </div>

        <nav className="sidebarNav">
          {mainNavItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `sidebarNavLink${isActive ? ' sidebarNavLink--active' : ''}`}
              >
                <span className="sidebarNavIcon">
                  <Icon {...navIconProps} />
                </span>
                <span className="sidebarNavLabel">{item.label}</span>
                {item.badge != null ? <span className="sidebarNavBadge">{item.badge}</span> : null}
              </NavLink>
            )
          })}
          {showAdminNav ? (
            <NavLink
              to="/admin/users/directory"
              className={() =>
                `sidebarNavLink${adminNavActive ? ' sidebarNavLink--active' : ''}`
              }
            >
              <span className="sidebarNavIcon">
                <Shield {...navIconProps} />
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
            <LogOut size={18} strokeWidth={1.75} aria-hidden />
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
