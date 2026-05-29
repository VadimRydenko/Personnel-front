import { Download, LayoutGrid, List, Printer, Search, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageContent, PageTitle } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { PersonnelCard } from '../components/PersonnelCard'
import { PersonnelRow } from '../components/PersonnelRow'
import { FILTER_TABS, MOCK_PEOPLE, STAT_LABELS, STAT_ORDER, STATUS_DOT } from '../constants'
import type { PersonStatus } from '../types'

export function PersonnelPage() {
  const [statusFilter, setStatusFilter] = useState<PersonStatus | null>(null)
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const counts = useMemo(() => {
    const result = {} as Record<PersonStatus, number>

    for (const p of MOCK_PEOPLE) result[p.status] = (result[p.status] ?? 0) + 1

    return result
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()

    return MOCK_PEOPLE.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false

      if (
        q &&
        !p.fullName.toLowerCase().includes(q) &&
        !p.rank?.toLowerCase().includes(q) &&
        !p.unit?.toLowerCase().includes(q)
      )
        return false

      return true
    })
  }, [statusFilter, query])

  const tabBtnClass = (active: boolean) =>
    cn(
      'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition',
      active
        ? 'border-transparent bg-slate-900 text-white'
        : 'border-border bg-white text-ink hover:bg-slate-50',
    )

  const viewBtnClass = (active: boolean) =>
    cn(
      'flex h-9 w-9 items-center justify-center rounded-full border transition',
      active
        ? 'border-slate-900 bg-slate-900 text-white'
        : 'border-border bg-white text-muted hover:bg-slate-50 hover:text-ink',
    )

  return (
    <PageContent>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PageTitle>Особовий склад</PageTitle>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-900 px-2 text-sm font-bold text-white tabular-nums">
            {MOCK_PEOPLE.length}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-border bg-white px-3 text-sm font-semibold text-ink shadow-card hover:bg-slate-50"
          >
            <Download size={16} strokeWidth={1.75} aria-hidden />
            Експорт
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-border bg-white px-3 text-sm font-semibold text-ink shadow-card hover:bg-slate-50"
          >
            <Printer size={16} strokeWidth={1.75} aria-hidden />
            Друк
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-transparent bg-accent px-3 text-sm font-semibold text-white shadow-card hover:bg-accent-hover"
          >
            <UserPlus size={16} strokeWidth={1.75} aria-hidden />
            Новий співробітник
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-medium text-muted">
        {STAT_ORDER.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT[s])} />
            {STAT_LABELS[s]}: <span className="font-bold text-ink">{counts[s] ?? 0}</span>
          </span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="flex h-9 min-w-[200px] max-w-[280px] flex-1 items-center gap-2 rounded-full border border-border bg-white px-3.5">
          <Search size={15} strokeWidth={2} className="shrink-0 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ПІБ, табельний номер…"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </label>

        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tabBtnClass(statusFilter === tab.id)}
            onClick={() => setStatusFilter((prev) => (prev === tab.id ? null : tab.id))}
          >
            {tab.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            className={viewBtnClass(viewMode === 'grid')}
            onClick={() => setViewMode('grid')}
            title="Плитки"
          >
            <LayoutGrid size={16} strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            className={viewBtnClass(viewMode === 'list')}
            onClick={() => setViewMode('list')}
            title="Список"
          >
            <List size={16} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-5">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="m-0 text-sm font-semibold text-ink">
              Немає співробітників для поточного фільтра.
            </p>
            <p className="m-0 mt-1 text-sm text-muted">Спробуйте змінити пошук або статус.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((person) => (
              <PersonnelCard key={person.id} person={person} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full min-w-[700px] border-collapse">
              <thead className="border-b border-border bg-slate-50/95">
                <tr>
                  {['ПІБ', 'Посада', 'Звання', 'Підрозділ', 'Статус', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((person) => (
                  <PersonnelRow key={person.id} person={person} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContent>
  )
}
