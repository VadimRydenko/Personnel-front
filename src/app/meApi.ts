import { getApiBaseUrl } from './api'

export type MeRole = {
  id: number
  roleName: string
  notes: string | null
}

export type MeGroup = {
  id: string
  name: string
  slug: string
}

export type MePermission = {
  id: string
  code: string
  label: string
}

export type MeResponse = {
  id: string
  email: string
  name: string | null
  mustChangePassword: boolean
  /** ISO-8601: остання зміна пароля (для політики 180 днів), якщо бекенд повертає */
  passwordChangedAt?: string | null
  roles: MeRole[]
  groups: MeGroup[]
  directPermissions: MePermission[]
  effectivePermissionCodes: string[]
}

export type AdminCatalogResponse = {
  roles: { id: number; roleName: string; notes: string | null }[]
  groups: { id: string; name: string; slug: string; description: string | null }[]
  permissions: { id: string; code: string; label: string; description: string | null }[]
}

export type CreateManagedUserPayload = {
  email: string
  name?: string | undefined
  roleIds: number[]
  groupIds: string[]
  permissionIds: string[]
}

export type CreateManagedUserResponse = {
  id: string
  email: string
  name: string
  temporaryPassword: string
  mustChangePassword: true
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text()

  if (!text) return undefined

  try {
    return JSON.parse(text) as unknown
  } catch {
    return { text }
  }
}

export async function fetchMe(): Promise<MeResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/me`, { credentials: 'include' })
  const body = await readJson(res)

  if (!res.ok) {
    const message =
      typeof body === 'object' && body !== null && 'message' in body && typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `Request failed (${res.status})`

    throw new Error(message)
  }

  return body as MeResponse
}

export async function fetchAdminCatalog(): Promise<AdminCatalogResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/admin/catalog`, { credentials: 'include' })
  const body = await readJson(res)

  if (!res.ok) {
    const message =
      typeof body === 'object' && body !== null && 'message' in body && typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `Request failed (${res.status})`

    throw new Error(message)
  }

  return body as AdminCatalogResponse
}

export async function createManagedUser(payload: CreateManagedUserPayload): Promise<CreateManagedUserResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/admin/users`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await readJson(res)

  if (!res.ok) {
    const message =
      typeof body === 'object' && body !== null && 'message' in body && typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `Request failed (${res.status})`

    throw new Error(message)
  }

  return body as CreateManagedUserResponse
}
