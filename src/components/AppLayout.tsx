import { LogOut, Search, Shield } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { authClient, useSession } from '../app/authClient'
import { getInitials } from '../app/displayName'
import { mainNavItems } from '../app/navItems'
import { queryClient } from '../app/queryClient'
import { hasSecurityAdminRole } from '../app/securityAdmin'
import { useMe } from '../hooks/useMe'
import { cn } from '../lib/cn'
import { navIconProps } from './iconDefaults'

const sidebarNavLinkClass = (isActive: boolean) =>
  cn(
    'flex items-center rounded-sm px-3 py-2.5 text-sm font-medium transition-[background,color]',
    isActive
      ? 'bg-sidebar-active text-sidebar-foreground'
      : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground',
  )

export const AppLayout = () => {
  const session = useSession()
  const me = useMe()
  const location = useLocation()
  const user = session.data?.user
  const showAdminNav = Boolean(user) && me.isSuccess && hasSecurityAdminRole(me.data)
  const adminNavActive = location.pathname.startsWith('/admin/users')

  const displayName = user ? me.data?.name?.trim() || user.name?.trim() || user.email : ''
  const initials = user ? getInitials(me.data?.name ?? user.name, user.email) : '?'
  const roleLabel = me.data?.roles[0]?.roleName ?? 'Користувач'

  return (
    <div className="flex min-h-svh max-[900px]:flex-col">
      <aside
        className="flex w-sidebar shrink-0 flex-col bg-sidebar px-3.5 pb-4 pt-5 text-sidebar-foreground max-[900px]:w-full max-[900px]:max-h-none"
        aria-label="Головна навігація"
      >
        <div className="mb-2 flex flex-col gap-3.5">
          <div className="flex flex-col gap-0.5 px-2">
            <span className="text-[1.35rem] font-bold tracking-[-0.02em]">Штат</span>
            <span className="text-xs text-sidebar-muted">v2.4.1 · 2025</span>
          </div>
          <label className="flex h-[38px] items-center gap-2 rounded-sm border border-sidebar-border bg-sidebar-search px-3 text-sidebar-muted">
            <span className="sr-only">Пошук</span>
            <Search size={16} strokeWidth={2} aria-hidden />
            <input
              type="search"
              placeholder="Пошук…"
              disabled
              className="min-w-0 flex-1 border-0 bg-transparent text-sidebar-foreground outline-none placeholder:text-sidebar-muted"
            />
          </label>
        </div>

        <nav className="-mx-1 flex flex-1 flex-col gap-0.5 overflow-y-auto py-2 max-[900px]:flex-row max-[900px]:flex-wrap max-[900px]:overflow-x-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => sidebarNavLinkClass(isActive)}
              >
                <span className="mr-2.5 flex shrink-0 items-center justify-center opacity-90">
                  <Icon {...navIconProps} />
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge != null ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[0.7rem] font-semibold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            )
          })}
          {showAdminNav ? (
            <NavLink
              to="/admin/users/directory"
              className={() => sidebarNavLinkClass(adminNavActive)}
            >
              <span className="mr-2.5 flex shrink-0 items-center justify-center opacity-90">
                <Shield {...navIconProps} />
              </span>
              <span className="flex-1">Адміністрування</span>
            </NavLink>
          ) : null}
        </nav>

        <div className="mt-1 flex items-center gap-2 border-t border-sidebar-border pt-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/35 text-xs font-semibold text-white"
              aria-hidden
            >
              {initials}
            </span>
            <div className="flex min-w-0 flex-col gap-px">
              <span className="truncate text-[0.85rem] font-semibold">{displayName}</span>
              <span className="truncate text-[0.72rem] text-sidebar-muted">{roleLabel}</span>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-sidebar-muted transition-[background,color] hover:bg-sidebar-hover hover:text-sidebar-foreground"
            title="Вийти"
            onClick={async () => {
              await authClient.signOut()
              void queryClient.invalidateQueries({ queryKey: ['me'] })
              await session.refetch()
            }}
          >
            <LogOut size={18} strokeWidth={1.75} aria-hidden />
            <span className="sr-only">Вийти</span>
          </button>
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-main">
        <Outlet />
      </main>
    </div>
  )
}
