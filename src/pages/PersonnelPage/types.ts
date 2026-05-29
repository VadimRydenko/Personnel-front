export type PersonStatus = 'active' | 'vacation' | 'mission' | 'sick' | 'dismissed'

export type Person = {
  id: string
  fullName: string
  lastName: string
  firstName: string
  status: PersonStatus
  position: string | null
  rank: string | null
  unit: string | null
  dateFrom?: string
  dateTo?: string
}
