import { getApiBaseUrl } from './api'
import { getErrorMessage, readJson } from './apiUtils'

export type DocStatus = 'draft' | 'review' | 'sign' | 'done' | 'cancelled'

export type Document = {
  id: string
  number: string
  date: string
  category: string
  typeLabel: string
  title: string
  status: DocStatus
  employeeCode: number
  placeCode: number | null
  employeePlaceCode: number | null
  createdAt: string
  updatedAt: string
}

export type CreateDocumentPayload = {
  number: string
  date: string
  category?: string
  typeLabel: string
  title: string
  status?: DocStatus
  employeeCode: number
  placeCode?: number
  employeePlaceCode?: number
}

export type DocumentsListResponse = {
  items: Document[]
  page: number
  pageSize: number
  total: number
}

export const fetchDocuments = async (params?: {
  q?: string
  page?: number
  pageSize?: number
  status?: DocStatus
  employeeCode?: number
  employeePlaceCode?: number
}): Promise<DocumentsListResponse> => {
  const sp = new URLSearchParams()

  if (params?.q) sp.set('q', params.q)

  if (params?.page) sp.set('page', String(params.page))

  if (params?.pageSize) sp.set('pageSize', String(params.pageSize))

  if (params?.status) sp.set('status', params.status)

  if (params?.employeeCode) sp.set('employeeCode', String(params.employeeCode))

  if (params?.employeePlaceCode) sp.set('employeePlaceCode', String(params.employeePlaceCode))

  const qs = sp.toString()
  const res = await fetch(`${getApiBaseUrl()}/api/documents${qs ? `?${qs}` : ''}`, {
    credentials: 'include',
  })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as DocumentsListResponse
}

export const fetchDocument = async (id: string): Promise<Document> => {
  const res = await fetch(`${getApiBaseUrl()}/api/documents/${id}`, {
    credentials: 'include',
  })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as Document
}

export const createDocument = async (payload: CreateDocumentPayload): Promise<Document> => {
  const res = await fetch(`${getApiBaseUrl()}/api/documents`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as Document
}

export const updateDocumentStatus = async (id: string, status: DocStatus): Promise<Document> => {
  const res = await fetch(`${getApiBaseUrl()}/api/documents/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  const body = await readJson(res)

  if (!res.ok) throw new Error(getErrorMessage(body, res.status))

  return body as Document
}
