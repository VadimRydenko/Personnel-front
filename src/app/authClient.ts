import { createAuthClient } from 'better-auth/react'
import { getApiBaseUrl } from './api'

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  fetchOptions: {
    credentials: 'include',
  },
})

export const { useSession } = authClient
