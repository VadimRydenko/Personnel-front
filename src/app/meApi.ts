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
  blocked?: boolean
  blockReason?: string | null
  /** ISO-8601: остання зміна пароля (для політики 180 днів) */
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

export type AdminUserListItem = {
  id: string
  email: string
  name: string | null
  blocked: boolean
  blockReason: string | null
  mustChangePassword: boolean
  createdAt: string
  roles: { id: number; roleName: string }[]
}

export type AdminUserListResponse = {
  items: AdminUserListItem[]
  page: number
  pageSize: number
  total: number
}

export type AdminUserDetail = {
  id: string
  email: string
  name: string | null
  blocked: boolean
  blockReason: string | null
  mustChangePassword: boolean
  passwordChangedAt: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  roles: { id: number; roleName: string; notes: string | null }[]
  groups: { id: string; name: string; slug: string }[]
  directPermissions: { id: string; code: string; label: string }[]
}

export type PatchAdminUserPayload = {
  roleIds?: number[] | undefined
  blocked?: boolean | undefined
  blockReason?: string | null | undefined
}

export type ResetAdminUserPasswordResponse = {
  temporaryPassword: string
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

export async function searchAdminUsers(params: {
  q?: string | undefined
  page?: number | undefined
  pageSize?: number | undefined
}): Promise<AdminUserListResponse> {
  const sp = new URLSearchParams()

  if (params.q?.trim()) sp.set('q', params.q.trim())

  if (params.page != null) sp.set('page', String(params.page))

  if (params.pageSize != null) sp.set('pageSize', String(params.pageSize))

  const qs = sp.toString()
  const url = `${getApiBaseUrl()}/api/admin/users${qs ? `?${qs}` : ''}`
  const res = await fetch(url, { credentials: 'include' })
  const body = await readJson(res)

  if (!res.ok) {
    const message =
      typeof body === 'object' && body !== null && 'message' in body && typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `Request failed (${res.status})`

    throw new Error(message)
  }

  return body as AdminUserListResponse
}

export async function getAdminUser(id: string): Promise<AdminUserDetail> {
  const res = await fetch(`${getApiBaseUrl()}/api/admin/users/${encodeURIComponent(id)}`, { credentials: 'include' })
  const body = await readJson(res)

  if (!res.ok) {
    const message =
      typeof body === 'object' && body !== null && 'message' in body && typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `Request failed (${res.status})`

    throw new Error(message)
  }

  return body as AdminUserDetail
}

export async function patchAdminUser(id: string, payload: PatchAdminUserPayload): Promise<AdminUserDetail> {
  const res = await fetch(`${getApiBaseUrl()}/api/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
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

  return body as AdminUserDetail
}

export async function resetAdminUserPassword(id: string): Promise<ResetAdminUserPasswordResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/admin/users/${encodeURIComponent(id)}/reset-password`, {
    method: 'POST',
    credentials: 'include',
  })
  const body = await readJson(res)

  if (!res.ok) {
    const message =
      typeof body === 'object' && body !== null && 'message' in body && typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `Request failed (${res.status})`

    throw new Error(message)
  }

  return body as ResetAdminUserPasswordResponse
}
