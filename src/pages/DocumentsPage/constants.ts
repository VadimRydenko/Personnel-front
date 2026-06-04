import type { DocStatus } from '../../app/documentsApi'

export const STATUS_LABEL: Record<DocStatus, string> = {
  draft: 'Чернетки',
  review: 'На розгляді',
  sign: 'На підписі',
  done: 'Виконані',
  cancelled: 'Скасовані',
}

export const STATUS_BADGE_CLASS: Record<DocStatus, string> = {
  done: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-slate-100 text-slate-700',
  review: 'bg-blue-100 text-blue-800',
  sign: 'bg-violet-100 text-violet-800',
  cancelled: 'bg-rose-100 text-rose-800',
}

export const CATEGORIES = [
  'Усі категорії',
  'Накази',
  'Відпустки',
  'Відрядження',
  'Відзнаки',
  'Призначення',
  'Інше',
] as const

export type Category = (typeof CATEGORIES)[number]

export type PanelTab = 'details' | 'objects' | 'text' | 'journal'

export const PANEL_TABS: { id: PanelTab; label: string }[] = [
  { id: 'details', label: 'Реквізити' },
  { id: 'objects', label: "Об'єкти впливу" },
  { id: 'text', label: 'Текст наказу' },
  { id: 'journal', label: 'Журнал' },
]
