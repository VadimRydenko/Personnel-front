import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  Briefcase,
  FileText,
  Home,
  Users,
  Network,
  BookOpen
} from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  badge?: number
}

export const mainNavItems: NavItem[] = [
  { to: '/', label: 'Головна', icon: Home },
  { to: '/staffing', label: 'Штатний розпис', icon: Network },
  { to: '/personnel', label: 'Особовий склад', icon: Users },
  { to: '/vacancies', label: 'Вакантні посади', icon: Briefcase },
  { to: '/documents', label: 'Документи', icon: FileText, badge: 3 },
  { to: '/analytics', label: 'Аналітика', icon: BarChart3 },
  { to: '/notifications', label: 'Сповіщення', icon: Bell, badge: 5 },
  { to: '/directories', label: 'Довідники', icon: BookOpen },
]

export const placeholderTitles: Record<string, string> = {
  '/personnel': 'Особовий склад',
  '/vacancies': 'Вакантні посади',
  '/documents': 'Документи',
  '/analytics': 'Аналітика',
  '/notifications': 'Сповіщення',
  '/directories': 'Довідники',
}
