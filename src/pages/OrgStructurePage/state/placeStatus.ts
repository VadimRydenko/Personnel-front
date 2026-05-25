import type { OrgPlace } from '../../../app/orgStructureApi'

export type PlaceStatusFilter = 'all' | 'vacant' | 'occupied' | 'processing' | 'reduced'

export type PlaceDisplayStatus = 'vacant' | 'occupied' | 'processing' | 'reduced'

export const PLACE_STATUS_FILTERS: { id: PlaceStatusFilter; label: string }[] = [
  { id: 'all', label: 'Усі' },
  { id: 'vacant', label: 'Вакантні' },
  { id: 'occupied', label: 'Зайняті' },
  { id: 'processing', label: 'На оформленні' },
  { id: 'reduced', label: 'Скорочені' },
]

export const getPlaceDisplayStatus = (place: OrgPlace): PlaceDisplayStatus => {
  if (place.validTo != null) return 'reduced'

  if (place.manCount <= 0) return 'vacant'

  if (place.manCount < place.posCount) return 'processing'

  return 'occupied'
}

export const PLACE_STATUS_LABELS: Record<PlaceDisplayStatus, string> = {
  vacant: 'Вакантна',
  occupied: 'Зайнята',
  processing: 'На оформленні',
  reduced: 'Скорочена',
}

export const matchesPlaceStatusFilter = (place: OrgPlace, filter: PlaceStatusFilter): boolean => {
  if (filter === 'all') return true

  return getPlaceDisplayStatus(place) === filter
}

export const matchesPlaceSearch = (place: OrgPlace, query: string): boolean => {
  const q = query.trim().toLowerCase()

  if (!q) return true

  const title = place.placeType?.val?.toLowerCase() ?? ''

  return title.includes(q)
}
