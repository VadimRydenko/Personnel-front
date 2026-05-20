import { Outlet } from 'react-router-dom'

export function GuestLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-main p-6">
      <Outlet />
    </div>
  )
}
