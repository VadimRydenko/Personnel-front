import { getApiBaseUrl } from './api'

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text()

  if (!text) return undefined

  try {
    return JSON.parse(text) as unknown
  } catch {
    return { text }
  }
}

function getErrorMessage(body: unknown, status: number) {
  return typeof body === 'object' && body !== null && 'message' in body && typeof (body as { message: unknown }).message === 'string'
    ? (body as { message: string }).message
    : `Request failed (${status})`
}

export type UnitType = { code: number; val: string; valGenitive: string }

export type PersonnelOrder = { code: number; orderNo: string; orderDate: string }

export type OrgUnit = {
  code: number
  parentCode: number | null
  unitTypeCode: number
  name: string
  sortOrder: number
  validFrom: string
  validTo: string | null
  createOrderCode: number
  destroyOrderCode: number | null
  stationing: string
  unitType: UnitType | null
  createOrder: PersonnelOrder | null
  destroyOrder: PersonnelOrder | null
}

export type OrgUnitDetails = OrgUnit & {
  children: OrgUnit[]
  places: unknown[]
}

export async function fetchOrgCatalog(): Promise<{ unitTypes: UnitType[] }> {
  const res = await fetch(`${getApiBaseUrl()}/api/org-units/catalog`, { credentials: 'include' })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as { unitTypes: UnitType[] }
}

export async function fetchOrgUnits(params?: { parentCode?: number | null; activeOnly?: boolean }): Promise<{ items: OrgUnit[] }> {
  const sp = new URLSearchParams()

  if (params?.parentCode !== undefined) sp.set('parentCode', params.parentCode === null ? 'null' : String(params.parentCode))

  if (params?.activeOnly !== undefined) sp.set('activeOnly', params.activeOnly ? 'true' : 'false')

  const qs = sp.toString()
  const url = `${getApiBaseUrl()}/api/org-units${qs ? `?${qs}` : ''}`
  const res = await fetch(url, { credentials: 'include' })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as { items: OrgUnit[] }
}

export async function fetchOrgUnit(code: number): Promise<OrgUnitDetails> {
  const res = await fetch(`${getApiBaseUrl()}/api/org-units/${encodeURIComponent(String(code))}`, { credentials: 'include' })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as OrgUnitDetails
}

export type CreateOrgUnitPayload = {
  parentCode?: number | null
  unitTypeCode: number
  name: string
  validFrom: string
  stationing?: string
  createOrder?: { orderNo: string; orderDate: string }
  createOrderCode?: number
}

export async function createOrgUnit(payload: CreateOrgUnitPayload): Promise<OrgUnit> {
  const res = await fetch(`${getApiBaseUrl()}/api/org-units`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as OrgUnit
}
