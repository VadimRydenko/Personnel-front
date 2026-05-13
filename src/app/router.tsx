import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { MustChangePasswordRedirect } from '../components/MustChangePasswordRedirect'
import { RequireAuth } from '../components/RequireAuth'
import { AboutPage } from '../pages/AboutPage'
import { AdminUsersPage } from '../pages/AdminUsersPage'
import { ChangePasswordPage } from '../pages/ChangePasswordPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const appRouter = createBrowserRouter([
  {
    element: (
      <>
        <MustChangePasswordRedirect />
        <AppLayout />
      </>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/about', element: <AboutPage /> },
      {
        path: '/change-password',
        element: (
          <RequireAuth>
            <ChangePasswordPage />
          </RequireAuth>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <RequireAuth adminOnly>
            <AdminUsersPage />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
