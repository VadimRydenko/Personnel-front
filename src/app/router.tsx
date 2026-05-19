import { createBrowserRouter } from 'react-router-dom'
import { AuthRoot } from '../components/AuthRoot'
import { RequireAuth } from '../components/RequireAuth'
import { placeholderTitles } from './navItems'
import { AdminUserDirectoryPage } from '../pages/AdminUserDirectoryPage'
import { AdminUsersPage } from '../pages/AdminUsersPage'
import { ChangePasswordPage } from '../pages/ChangePasswordPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'

const placeholderRoutes = Object.entries(placeholderTitles).map(([path, title]) => ({
  path: path.slice(1),
  element: <PlaceholderPage title={title} />,
}))

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AuthRoot />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { index: true, element: <HomePage /> },
      ...placeholderRoutes,
      {
        path: 'change-password',
        element: (
          <RequireAuth>
            <ChangePasswordPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/users/directory',
        element: (
          <RequireAuth adminOnly>
            <AdminUserDirectoryPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/users',
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
