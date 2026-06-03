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
  return typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    typeof (body as { message: unknown }).message === 'string'
    ? (body as { message: string }).message
    : `Request failed (${status})`
}

export type UnitType = { code: number; val: string; valGenitive: string }

export type PlaceType = { code: number; val: string }

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
  city: string | null
  unitType: UnitType | null
  createOrder: PersonnelOrder | null
  destroyOrder: PersonnelOrder | null
}

/** Вузол дерева з GET /api/org-units?activeOnly=true */
export type OrgUnitTreeNode = OrgUnit & { children: OrgUnitTreeNode[] }

export type OrgPlace = {
  code: number
  orgUnitCode: number
  placeTypeCode: number
  sortOrder: number
  posCount: number
  isChief: boolean
  manCount: number
  validFrom: string
  validTo: string | null
  createOrderCode: number
  destroyOrderCode: number | null
  placeType: { code: number; val: string } | null
  createOrder: PersonnelOrder | null
  destroyOrder: PersonnelOrder | null
  orgUnit: {
    code: number
    name: string
    shortName: string | null
    city: string
  } | null
}

export type OrgUnitDetails = OrgUnit & {
  children: OrgUnit[]
  places: OrgPlace[]
}

export type PlaceDisplayStatus = 'vacant' | 'occupied' | 'processing' | 'reduced'

export type OrgPlaceDetails = OrgPlace & {
  status: PlaceDisplayStatus
  statusLabel: string
  title: string
  assignee: { manCode: number; fullName: string } | null
}

const normalizeOrgUnitTreeNode = (raw: unknown): OrgUnitTreeNode => {
  const u = raw as OrgUnit & { children?: unknown }
  const children = Array.isArray(u.children) ? u.children.map(normalizeOrgUnitTreeNode) : []

  return { ...u, children }
}

const parseOrgUnitsListBody = (body: unknown): OrgUnitTreeNode[] => {
  const raw = Array.isArray(body)
    ? body
    : typeof body === 'object' &&
        body !== null &&
        'items' in body &&
        Array.isArray((body as { items: unknown }).items)
      ? (body as { items: unknown[] }).items
      : []

  return raw.map(normalizeOrgUnitTreeNode)
}

export async function fetchOrgCatalog(): Promise<{
  unitTypes: UnitType[]
  placeTypes: PlaceType[]
}> {
  const res = await fetch(`${getApiBaseUrl()}/api/org-units/catalog`, { credentials: 'include' })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  const data = body as { unitTypes?: UnitType[]; placeTypes?: PlaceType[] }

  return {
    unitTypes: data.unitTypes ?? [],
    placeTypes: data.placeTypes ?? [],
  }
}

export async function fetchOrgUnits(params?: {
  parentCode?: number | null
  activeOnly?: boolean
}): Promise<{ items: OrgUnitTreeNode[] }> {
  const sp = new URLSearchParams()

  if (params?.parentCode !== undefined)
    sp.set('parentCode', params.parentCode === null ? 'null' : String(params.parentCode))

  if (params?.activeOnly !== undefined) sp.set('activeOnly', params.activeOnly ? 'true' : 'false')

  const qs = sp.toString()
  const url = `${getApiBaseUrl()}/api/org-units${qs ? `?${qs}` : ''}`
  const res = await fetch(url, { credentials: 'include' })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return { items: parseOrgUnitsListBody(body) }
}

export async function fetchOrgPlace(
  orgUnitCode: number,
  placeCode: number,
): Promise<OrgPlaceDetails> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/org-units/${encodeURIComponent(String(orgUnitCode))}/places/${encodeURIComponent(String(placeCode))}`,
    { credentials: 'include' },
  )
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as OrgPlaceDetails
}

export async function fetchOrgUnitPlaces(orgUnitCode: number): Promise<{ items: OrgPlace[] }> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/org-units/${encodeURIComponent(String(orgUnitCode))}/places`,
    { credentials: 'include' },
  )
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  const data = body as { items?: OrgPlace[] }

  return { items: data.items ?? [] }
}

export async function fetchOrgUnit(code: number): Promise<OrgUnitDetails> {
  const res = await fetch(`${getApiBaseUrl()}/api/org-units/${encodeURIComponent(String(code))}`, {
    credentials: 'include',
  })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as OrgUnitDetails
}

export type CreateOrgUnitPayload = {
  parentCode?: number | null
  unitTypeCode: number
  name: string
  validFrom: string
  city?: string
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

export type CreatePlacePayload = {
  placeTypeCode: number
  validFrom: string
  createOrder?: { orderNo: string; orderDate: string }
  createOrderCode?: number
  posCount?: number
  isChief?: boolean
}

export async function createPlace(
  orgUnitCode: number,
  payload: CreatePlacePayload,
): Promise<unknown> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/org-units/${encodeURIComponent(String(orgUnitCode))}/places`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  )
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body
}

export async function fetchVacantPlaces(): Promise<{ items: OrgPlace[] }> {
  const res = await fetch(`${getApiBaseUrl()}/api/places/vacant`, {
    credentials: 'include',
  })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  const data = body as { items?: OrgPlace[] }

  return { items: data.items ?? [] }
}

export type AssignEmployeeToPlacePayload = {
  employeeCode: number
  validFrom: string
  createOrder?: { orderNo: string; orderDate: string }
  orderCode?: number
  sPlace?: string
  koef?: number
  percentRate?: number
}

export async function assignEmployeeToPlace(
  orgUnitCode: number,
  placeCode: number,
  payload: AssignEmployeeToPlacePayload,
): Promise<unknown> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/org-units/${encodeURIComponent(String(orgUnitCode))}/places/${encodeURIComponent(String(placeCode))}/employee-places`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  )
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body
}
