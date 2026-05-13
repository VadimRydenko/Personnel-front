import { Outlet } from 'react-router-dom'

export function GuestLayout() {
  return (
    <div className="app">
      <main className="container appMain" style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
        <Outlet />
      </main>
    </div>
  )
}
