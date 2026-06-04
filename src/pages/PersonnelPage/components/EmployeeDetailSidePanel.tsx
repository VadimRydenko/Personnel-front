import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useState } from 'react'
import { fetchEmployee } from '../../../app/employeesApi'
import { Muted, TabPlaceholder } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { formatUkDate } from '../../../lib/dateUtils'
import { STATUS_BADGE, STATUS_DOT, STATUS_LABEL, getAvatarColor, getInitials } from '../constants'
import type { Person } from '../types'

type PanelTab = 'card' | 'family' | 'education' | 'assignment' | 'documents' | 'history'

const PANEL_TABS: { id: PanelTab; label: string }[] = [
  { id: 'card', label: 'Картка' },
  { id: 'family', label: "Сім'я" },
  { id: 'education', label: 'Освіта' },
  { id: 'assignment', label: 'Призначення' },
  { id: 'documents', label: 'Документи' },
  { id: 'history', label: 'Історія' },
]

const ACTION_BUTTONS = ['Звільнити', 'Перевести', 'Відпустка', 'Відрядження', 'Видати довідку']

const formatSex = (sex: string | undefined) => {
  if (sex === 'М' || sex === 'M' || sex === 'м') return 'Чоловіча'

  if (sex === 'Ж' || sex === 'F' || sex === 'ж') return 'Жіноча'

  return sex ?? '—'
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
    <span className="shrink-0 text-sm text-muted">{label}</span>
    <span className="min-w-0 max-w-[60%] text-right text-sm font-semibold text-ink">{value}</span>
  </div>
)

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-0 mt-5 text-[0.68rem] font-bold uppercase tracking-widest text-muted first:mt-4">
    {children}
  </p>
)

export const EmployeeDetailSidePanel = ({
  person,
  onClose,
}: {
  person: Person
  onClose: () => void
}) => {
  const [activeTab, setActiveTab] = useState<PanelTab>('card')

  const employeeCode = Number(person.id)
  const detailQuery = useQuery({
    queryKey: ['employee', employeeCode],
    queryFn: () => fetchEmployee(employeeCode),
    enabled: !Number.isNaN(employeeCode),
  })

  const emp = detailQuery.data
  const avatarColor = getAvatarColor(person.fullName)
  const initials = getInitials(person.lastName, person.firstName)
  const employeeNo = emp?.personalNo
    ? `№${emp.personalNo}`
    : `№${String(employeeCode).padStart(5, '0')}`

  return (
    <section
      className="fixed right-0 top-0 z-40 flex h-svh w-150 flex-col overflow-hidden border-l border-border bg-surface shadow-xl"
      aria-label="Картка особи"
    >
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="m-0 text-lg font-bold text-ink">Картка особи</h2>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-muted hover:bg-slate-100 hover:text-ink"
          onClick={onClose}
          aria-label="Закрити картку"
        >
          <X size={20} strokeWidth={2} aria-hidden />
        </button>
      </header>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Person identity */}
        <div className="flex items-start gap-4 px-5 pb-4 pt-5">
          <div className="relative shrink-0">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold tracking-wide text-white',
                avatarColor,
              )}
            >
              {initials}
            </div>
            <span
              className={cn(
                'absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white',
                STATUS_DOT[person.status],
              )}
            />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="m-0 text-base font-bold leading-snug text-ink">{person.fullName}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  STATUS_BADGE[person.status],
                )}
              >
                {STATUS_LABEL[person.status]}
              </span>
              <span className="text-xs font-medium text-muted">{employeeNo}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 border-b border-border px-5 pb-4">
          {ACTION_BUTTONS.map((label) => (
            <button
              key={label}
              type="button"
              disabled
              className="rounded border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <nav
          className="flex shrink-0 gap-0 border-b border-border px-3"
          aria-label="Вкладки картки"
        >
          {PANEL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'shrink-0 cursor-pointer border-0 border-b-2 bg-transparent px-3 py-3 text-sm font-medium transition',
                activeTab === tab.id
                  ? 'border-ink text-ink'
                  : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="px-5 pb-6">
          {activeTab === 'card' ? (
            detailQuery.isLoading ? (
              <Muted className="py-6 text-center">Завантаження…</Muted>
            ) : (
              <>
                <SectionHeading>Загальна інформація</SectionHeading>
                <InfoRow label="Повне ПІБ" value={person.fullName} />
                <InfoRow label="Дата народження" value={formatUkDate(emp?.birthday)} />
                <InfoRow label="Місце народження" value="—" />
                <InfoRow label="Стать" value={formatSex(emp?.sex)} />

                <SectionHeading>Контакти</SectionHeading>
                <InfoRow label="Телефон" value="—" />
                <InfoRow label="Email" value="—" />
                <InfoRow label="Адреса" value="—" />

                <SectionHeading>Поточне призначення</SectionHeading>
                <InfoRow label="Посада" value={person.position ?? '—'} />
                <InfoRow label="Підрозділ" value={person.unit ?? '—'} />
                <InfoRow label="Звання" value={person.rank ?? '—'} />
                <InfoRow label="Категорія" value="—" />
                <InfoRow label="На посаді з" value="—" />

                <SectionHeading>Стажі</SectionHeading>
                <InfoRow label="Загальний стаж" value="—" />
                <InfoRow label="Стаж у системі" value="—" />
                <InfoRow label="На поточній посаді" value="—" />
              </>
            )
          ) : activeTab === 'family' ? (
            <TabPlaceholder title="Сім'я" />
          ) : activeTab === 'education' ? (
            <TabPlaceholder title="Освіта" />
          ) : activeTab === 'assignment' ? (
            <TabPlaceholder title="Призначення" />
          ) : activeTab === 'documents' ? (
            <TabPlaceholder title="Документи" />
          ) : (
            <TabPlaceholder title="Історія" />
          )}
        </div>
      </div>
    </section>
  )
}
