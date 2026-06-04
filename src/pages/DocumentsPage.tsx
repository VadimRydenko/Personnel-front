import { useQuery } from '@tanstack/react-query'
import {
  ArrowUpDown,
  CalendarDays,
  ChevronDown,
  Download,
  FileText,
  LayoutGrid,
  List,
  Plus,
  Search,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type DocStatus, type Document, fetchDocuments } from '../app/documentsApi'
import { PageContent, PageTitle } from '../components/ui'
import { cn } from '../lib/cn'

const STATUS_LABEL: Record<DocStatus, string> = {
  draft: 'Чернетки',
  review: 'На розгляді',
  sign: 'На підписі',
  done: 'Виконані',
  cancelled: 'Скасовані',
}

const STATUS_BADGE_CLASS: Record<DocStatus, string> = {
  done: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-slate-100 text-slate-700',
  review: 'bg-blue-100 text-blue-800',
  sign: 'bg-violet-100 text-violet-800',
  cancelled: 'bg-rose-100 text-rose-800',
}

const formatUA = (iso: string) => {
  const date = iso.slice(0, 10)
  const [y, m, d] = date.split('-').map((x) => Number(x))

  if (!y || !m || !d) return iso

  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`
}

const toDateISO = (iso: string) => iso.slice(0, 10)

const startOfWeekMonday = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day + 6) % 7

  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - diff)

  return d
}

const CATEGORIES = [
  'Усі категорії',
  'Накази',
  'Відпустки',
  'Відрядження',
  'Відзнаки',
  'Призначення',
  'Інше',
] as const

type Category = (typeof CATEGORIES)[number]
type PanelTab = 'details' | 'objects' | 'text' | 'journal'

const PANEL_TABS: { id: PanelTab; label: string }[] = [
  { id: 'details', label: 'Реквізити' },
  { id: 'objects', label: "Об'єкти впливу" },
  { id: 'text', label: 'Текст наказу' },
  { id: 'journal', label: 'Журнал' },
]

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-border last:border-b-0">
      <span className="w-36 shrink-0 text-xs text-muted">{label}</span>
      <span className="min-w-0 text-sm font-medium text-ink">{value ?? '—'}</span>
    </div>
  )
}

const DocumentPanel = ({ doc, onClose }: { doc: Document; onClose: () => void }) => {
  const [tab, setTab] = useState<PanelTab>('details')

  return (
    <section
      className="fixed right-0 top-0 z-40 flex h-svh w-[480px] flex-col overflow-hidden border-l border-border bg-surface shadow-xl"
      aria-label="Картка документа"
    >
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="m-0 text-lg font-bold text-ink">Картка документа</h2>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-transparent text-muted hover:bg-slate-100 hover:text-ink"
          onClick={onClose}
          aria-label="Закрити картку"
        >
          <X size={20} strokeWidth={2} aria-hidden />
        </button>
      </header>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Identity */}
        <div className="px-5 pb-4 pt-5">
          <p className="m-0 text-xs text-muted">Документи / {doc.category}</p>
          <p className="m-0 mt-0.5 text-xs font-semibold text-muted">
            Документ {doc.number} від {formatUA(doc.date)}
          </p>
          <p className="m-0 mt-1.5 text-base font-bold leading-snug text-ink">{doc.title}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                STATUS_BADGE_CLASS[doc.status],
              )}
            >
              {STATUS_LABEL[doc.status]}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {doc.typeLabel}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-b border-border px-5 pb-4">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-transparent bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Підписати через КЕП
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-white px-3 text-sm font-semibold text-ink hover:bg-slate-50"
          >
            Дублювати
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-white px-3 text-sm font-semibold text-ink hover:bg-slate-50"
          >
            PDF
          </button>
        </div>

        {/* Tabs */}
        <nav
          className="flex shrink-0 gap-0 border-b border-border px-3"
          aria-label="Вкладки документа"
        >
          {PANEL_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'shrink-0 cursor-pointer border-0 border-b-2 bg-transparent px-3 py-3 text-sm font-medium transition',
                tab === t.id
                  ? 'border-ink text-ink'
                  : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="px-5 pb-6">
          {tab === 'details' ? (
            <div className="mt-4 flex gap-6">
              <div className="flex-1 min-w-0">
                <DetailRow label="Категорія" value={doc.category} />
                <DetailRow label="Тип" value={doc.typeLabel} />
                <DetailRow label="Дата" value={formatUA(doc.date)} />
                <DetailRow label="Номер" value={doc.number} />
                <DetailRow label="Статус" value={STATUS_LABEL[doc.status]} />
              </div>
              <div className="w-36 shrink-0">
                <p className="m-0 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                  КЕП-ПІДПИСИ
                </p>
                <p className="m-0 mt-2 text-xs text-muted">Підписів немає</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <FileText size={32} strokeWidth={1.25} className="text-slate-300" />
              <p className="m-0 mt-2 text-sm text-muted">Розділ у розробці</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export const DocumentsPage = () => {
  const navigate = useNavigate()

  const [tab, setTab] = useState<'all' | DocStatus>('all')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('Усі категорії')
  const [preset, setPreset] = useState<'none' | 'thisWeek' | 'vacationOrders'>('none')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)

  const docsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: () => fetchDocuments({ pageSize: 200 }),
  })

  const docs = useMemo(() => docsQuery.data?.items ?? [], [docsQuery.data?.items])
  const selectedDoc = docs.find((d) => d.id === selectedDocId) ?? null

  const weekStart = useMemo(() => startOfWeekMonday(new Date()), [])
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart)

    d.setDate(d.getDate() + 7)

    return d
  }, [weekStart])

  const normalizedQuery = query.trim().toLowerCase()

  const baseFiltered = useMemo(() => {
    return docs.filter((row) => {
      if (normalizedQuery) {
        const hay = `${row.number} ${row.typeLabel} ${row.title}`.toLowerCase()

        if (!hay.includes(normalizedQuery)) return false
      }

      if (category !== 'Усі категорії' && row.category !== category) return false

      if (preset === 'vacationOrders') {
        if (row.category !== 'Відпустки' && !row.typeLabel.toLowerCase().includes('відпуст'))
          return false
      }

      if (preset === 'thisWeek') {
        const dt = new Date(`${toDateISO(row.date)}T00:00:00`)

        if (dt < weekStart || dt >= weekEnd) return false
      }

      return true
    })
  }, [docs, category, normalizedQuery, preset, weekEnd, weekStart])

  const tabCounts = useMemo(() => {
    const counts: Record<'all' | DocStatus, number> = {
      all: baseFiltered.length,
      draft: 0,
      review: 0,
      sign: 0,
      done: 0,
      cancelled: 0,
    }

    for (const r of baseFiltered) counts[r.status] += 1

    return counts
  }, [baseFiltered])

  const visibleRows = useMemo(() => {
    const rows = tab === 'all' ? baseFiltered : baseFiltered.filter((r) => r.status === tab)

    return [...rows].sort((a, b) => {
      const av = toDateISO(a.date)
      const bv = toDateISO(b.date)

      if (av === bv) return a.number.localeCompare(b.number, 'uk')

      return sortDir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv)
    })
  }, [baseFiltered, sortDir, tab])

  const tabs: Array<{ id: 'all' | DocStatus; label: string }> = useMemo(
    () => [
      { id: 'all', label: 'Усі' },
      { id: 'draft', label: STATUS_LABEL.draft },
      { id: 'review', label: STATUS_LABEL.review },
      { id: 'sign', label: STATUS_LABEL.sign },
      { id: 'done', label: STATUS_LABEL.done },
      { id: 'cancelled', label: STATUS_LABEL.cancelled },
    ],
    [],
  )

  const tabBtnClass = (active: boolean) =>
    cn(
      'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-[background,color,border-color] border',
      active
        ? 'border-transparent bg-slate-900 text-white'
        : 'border-border bg-white text-ink hover:bg-slate-50',
    )

  const presetBtnClass = (active: boolean) =>
    cn(
      'inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-[background,color,border-color]',
      active
        ? 'border-transparent bg-slate-900 text-white'
        : 'border-border bg-white text-ink hover:bg-slate-50',
    )

  const thClass =
    'px-3 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted'
  const tdClass = 'px-3 py-3 text-sm text-ink'

  return (
    <PageContent>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <PageTitle>Документи</PageTitle>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-white px-3 text-sm font-semibold text-ink shadow-card hover:bg-slate-50"
          >
            <Download size={18} strokeWidth={1.75} aria-hidden />
            Експорт
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-sm border border-transparent bg-slate-900 px-3 text-sm font-semibold text-white shadow-card hover:bg-slate-800"
            onClick={() => navigate('/documents/new')}
          >
            <Plus size={18} strokeWidth={1.75} aria-hidden />
            Створити документ
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tabBtnClass(tab === t.id)}
              onClick={() => setTab(t.id)}
            >
              <span>{t.label}</span>
              <span
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.72rem] font-bold tabular-nums',
                  tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700',
                )}
              >
                {tabCounts[t.id]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-full border border-border bg-white px-3.5 max-w-[400px]">
            <Search size={16} strokeWidth={2} aria-hidden className="text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Номер, тема…"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </label>

          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-3.5 text-sm font-semibold text-ink hover:bg-slate-50">
            {category}
            <ChevronDown size={16} strokeWidth={2} aria-hidden className="text-muted" />
            <select
              className="absolute opacity-0 w-0 h-0"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              aria-label="Категорія"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-white px-3.5 text-sm font-semibold text-ink hover:bg-slate-50"
              onClick={() => setSortDir((p) => (p === 'desc' ? 'asc' : 'desc'))}
              title="Сортування за датою"
            >
              <ArrowUpDown size={16} strokeWidth={2} aria-hidden className="text-muted" />
              Дата
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-ink hover:bg-slate-50"
              title="Список"
            >
              <List size={16} strokeWidth={2} aria-hidden className="text-muted" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-ink hover:bg-slate-50"
              title="Плитки"
            >
              <LayoutGrid size={16} strokeWidth={2} aria-hidden className="text-muted" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={presetBtnClass(preset === 'thisWeek')}
            onClick={() => setPreset((p) => (p === 'thisWeek' ? 'none' : 'thisWeek'))}
          >
            <CalendarDays
              size={16}
              strokeWidth={2}
              aria-hidden
              className={cn(preset === 'thisWeek' ? '' : 'text-muted')}
            />
            За цей тиждень
          </button>
          <button
            type="button"
            className={presetBtnClass(preset === 'vacationOrders')}
            onClick={() => setPreset((p) => (p === 'vacationOrders' ? 'none' : 'vacationOrders'))}
          >
            Накази про відпустки
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="max-h-[min(70svh,560px)] overflow-auto">
            <table className="w-full min-w-[480px] border-collapse">
              <thead className="sticky top-0 z-[1] border-b border-border bg-slate-50/95 backdrop-blur-sm">
                <tr>
                  <th className={cn(thClass, 'w-10')}>
                    <span className="sr-only">Вибір</span>
                  </th>
                  <th className={cn(thClass, 'w-20')}>№</th>
                  <th className={cn(thClass, 'w-24')}>Дата</th>
                  <th className={thClass}>Тип / тема</th>
                  <th className={cn(thClass, 'w-28')}>Статус</th>
                  <th className={cn(thClass, 'w-10')}>
                    <span className="sr-only">Дії</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {docsQuery.isPending ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-sm text-muted">
                      Завантаження…
                    </td>
                  </tr>
                ) : docsQuery.isError ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-sm text-rose-600">
                      Помилка: {docsQuery.error.message}
                    </td>
                  </tr>
                ) : visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center">
                      <p className="m-0 text-sm font-semibold text-ink">
                        Немає документів для поточного фільтра.
                      </p>
                      <p className="m-0 mt-1 text-sm text-muted">
                        Спробуйте змінити таб, пошук або пресет.
                      </p>
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => {
                    const isSelected = row.id === selectedDocId

                    return (
                      <tr
                        key={row.id}
                        onClick={() =>
                          setSelectedDocId((prev) => (prev === row.id ? null : row.id))
                        }
                        className={cn(
                          'cursor-pointer border-b border-border last:border-b-0 transition-colors',
                          isSelected ? 'bg-slate-100' : 'hover:bg-slate-50/60',
                        )}
                      >
                        <td className={cn(tdClass, 'w-10')} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-slate-900"
                            aria-label={`Вибрати ${row.number}`}
                          />
                        </td>
                        <td className={cn(tdClass, 'tabular-nums text-muted')}>{row.number}</td>
                        <td className={cn(tdClass, 'tabular-nums text-muted')}>
                          {formatUA(row.date)}
                        </td>
                        <td className={tdClass}>
                          <div className="flex min-w-0 flex-col gap-1">
                            <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                              {row.typeLabel}
                            </span>
                            <div className="min-w-0 truncate font-medium">{row.title}</div>
                          </div>
                        </td>
                        <td className={tdClass}>
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                              STATUS_BADGE_CLASS[row.status],
                            )}
                          >
                            {STATUS_LABEL[row.status]}
                          </span>
                        </td>
                        <td
                          className={cn(tdClass, 'text-right')}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-transparent text-muted hover:border-border hover:bg-white"
                            aria-label="Дії"
                            title="Дії"
                          >
                            <span className="text-lg leading-none">…</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedDoc && <DocumentPanel doc={selectedDoc} onClose={() => setSelectedDocId(null)} />}
    </PageContent>
  )
}
