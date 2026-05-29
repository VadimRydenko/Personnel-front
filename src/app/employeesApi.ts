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

export type Employee = {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  title?: string
  unitCode?: number
  positionCode?: number
  hireDate?: string
  createdAt: string
  updatedAt: string
}

export type CreateEmployeePayload = {
  firstName: string
  lastName: string
  middleName?: string
  title?: string
  unitCode?: number
  positionCode?: number
  hireDate?: string
}

export type EmployeesListResponse = {
  items: Employee[]
  page: number
  pageSize: number
  total: number
}

export async function fetchEmployees(params?: {
  q?: string
  page?: number
  pageSize?: number
}): Promise<EmployeesListResponse> {
  const sp = new URLSearchParams()

  if (params?.q) sp.set('q', params.q)

  if (params?.page) sp.set('page', String(params.page))

  if (params?.pageSize) sp.set('pageSize', String(params.pageSize))

  const qs = sp.toString()
  const res = await fetch(`${getApiBaseUrl()}/api/employees${qs ? `?${qs}` : ''}`, {
    credentials: 'include',
  })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as EmployeesListResponse
}

export async function createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
  const res = await fetch(`${getApiBaseUrl()}/api/employees`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as Employee
}
