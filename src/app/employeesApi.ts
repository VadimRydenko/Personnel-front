import { getApiBaseUrl } from './api'
import { getErrorMessage, readJson } from './apiUtils'

export type Employee = {
  code: number
  firstName: string
  lastName: string
  middleName?: string
  signature?: string
  birthday?: string | null
  personalNo?: string | null
  sex?: string
  idNo?: string | null
  validFrom?: string | null
  validTo?: string
  lastPlaceCode?: number | null
  remarks?: string | null
}

export type CreateEmployeePayload = {
  firstName: string
  lastName: string
  middleName?: string
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

export async function fetchEmployee(code: number): Promise<Employee> {
  const res = await fetch(`${getApiBaseUrl()}/api/employees/${code}`, {
    credentials: 'include',
  })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as Employee
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
