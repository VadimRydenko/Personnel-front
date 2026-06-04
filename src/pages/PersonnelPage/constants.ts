import type { PersonStatus } from './types'

export const STATUS_LABEL: Record<PersonStatus, string> = {
  active: 'Активний',
  vacation: 'У відпустці',
  mission: 'У відрядженні',
  sick: 'На лікарняному',
  dismissed: 'Звільнений',
}

export const STATUS_BADGE: Record<PersonStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  vacation: 'bg-amber-100 text-amber-700',
  mission: 'bg-blue-100 text-blue-800',
  sick: 'bg-sky-100 text-sky-700',
  dismissed: 'bg-rose-100 text-rose-700',
}

export const STATUS_DOT: Record<PersonStatus, string> = {
  active: 'bg-emerald-500',
  vacation: 'bg-amber-500',
  mission: 'bg-blue-500',
  sick: 'bg-sky-500',
  dismissed: 'bg-rose-500',
}

export const DATE_COLOR: Record<PersonStatus, string> = {
  active: 'text-muted',
  vacation: 'text-amber-600',
  mission: 'text-blue-600',
  sick: 'text-sky-600',
  dismissed: 'text-muted',
}

export const STAT_LABELS: Partial<Record<PersonStatus, string>> = {
  active: 'Активних',
  vacation: 'Відпустка',
  mission: 'Відряджень',
  sick: 'Лікарняний',
}

export const STAT_ORDER: PersonStatus[] = ['active', 'vacation', 'mission', 'sick']

export const FILTER_TABS: Array<{ id: PersonStatus; label: string }> = [
  { id: 'active', label: 'Активний' },
  { id: 'vacation', label: 'У відпустці' },
  { id: 'mission', label: 'У відрядженні' },
  { id: 'sick', label: 'На лікарняному' },
  { id: 'dismissed', label: 'Звільнений' },
]

const AVATAR_COLORS = [
  'bg-slate-700',
  'bg-blue-800',
  'bg-teal-700',
  'bg-indigo-700',
  'bg-amber-700',
  'bg-emerald-700',
  'bg-cyan-800',
  'bg-violet-700',
  'bg-sky-700',
  'bg-rose-800',
]

export const getAvatarColor = (name: string) => {
  let hash = 0

  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) >>> 0

  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export const getInitials = (lastName: string, firstName: string) => {
  return (lastName[0] ?? '') + (firstName[0] ?? '')
}
