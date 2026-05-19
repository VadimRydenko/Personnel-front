import { Outlet } from 'react-router-dom'

export function GuestLayout() {
  return (
    <div className="guestShell">
      <Outlet />
    </div>
  )
}
