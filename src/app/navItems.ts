export type NavItem = {
  to: string
  label: string
  icon: string
  badge?: number
}

export const mainNavItems: NavItem[] = [
  { to: '/', label: 'Головна', icon: 'home' },
  { to: '/staffing', label: 'Штатний розпис', icon: 'staffing' },
  { to: '/personnel', label: 'Особовий склад', icon: 'personnel' },
  { to: '/vacancies', label: 'Вакантні посади', icon: 'vacancies' },
  { to: '/documents', label: 'Документи', icon: 'documents', badge: 3 },
  { to: '/analytics', label: 'Аналітика', icon: 'analytics' },
  { to: '/notifications', label: 'Сповіщення', icon: 'notifications', badge: 5 },
  { to: '/directories', label: 'Довідники', icon: 'directories' },
]

export const placeholderTitles: Record<string, string> = {
  '/staffing': 'Штатний розпис',
  '/personnel': 'Особовий склад',
  '/vacancies': 'Вакантні посади',
  '/documents': 'Документи',
  '/analytics': 'Аналітика',
  '/notifications': 'Сповіщення',
  '/directories': 'Довідники',
}
