import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

const tabClass = (isActive: boolean) =>
  cn('text-sm font-medium text-ink', isActive && 'text-accent underline underline-offset-4')

export const AdminSubNav = () => (
  <nav className="mb-4 flex gap-3">
    <NavLink to="/admin/users/directory" className={({ isActive }) => tabClass(isActive)}>
      Користувачі
    </NavLink>
    <NavLink to="/admin/users" end className={({ isActive }) => tabClass(isActive)}>
      Створити
    </NavLink>
  </nav>
)
