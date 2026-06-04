export const DOC_TYPES = [
  { id: 'appointment', label: 'Призначення на посаду', category: 'Призначення' },
  { id: 'vacation', label: 'Наказ про відпустку', category: 'Відпустки' },
  { id: 'business_trip', label: 'Відрядження', category: 'Відрядження' },
  { id: 'award', label: 'Відзнака', category: 'Відзнаки' },
  { id: 'dismissal', label: 'Звільнення з посади', category: 'Накази' },
  { id: 'order', label: 'Наказ', category: 'Накази' },
  { id: 'other', label: 'Інше', category: 'Інше' },
] as const

export type DocTypeId = (typeof DOC_TYPES)[number]['id']

export const WIZARD_STEPS = [
  { id: 1, label: 'Категорія' },
  { id: 2, label: 'Тип' },
  { id: 3, label: 'Параметри' },
  { id: 4, label: "Прев'ю" },
] as const
