import { Outlet } from 'react-router-dom'

export const GuestLayout = () => {
  return (
    <div className="flex min-h-svh items-center justify-center bg-main p-6">
      <Outlet />
    </div>
  )
}
