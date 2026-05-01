import { createAuthClient } from 'better-auth/react'
import { getApiBaseUrl } from './api'

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
})

export const { useSession } = authClient
