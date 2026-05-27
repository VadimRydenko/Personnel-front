import type { OrgPlaceDetails } from '../../../../app/orgStructureApi'
import type { PlaceDetailCardTab } from '../../state/useOrgStructurePage'

export const DETAIL_TABS: { id: PlaceDetailCardTab; label: string }[] = [
  { id: 'attributes', label: 'Атрибути' },
  { id: 'currentState', label: 'Поточний стан' },
  { id: 'documents', label: 'Документи' },
  { id: 'history', label: 'Історія' },
]

export const statusBadgeClass: Record<OrgPlaceDetails['status'], string> = {
  vacant: 'border-amber-200 bg-amber-50 text-amber-800',
  occupied: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  processing: 'border-sky-200 bg-sky-50 text-sky-800',
  reduced: 'border-border bg-slate-100 text-muted',
}
