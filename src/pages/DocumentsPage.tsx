import {
  ArrowUpDown,
  CalendarDays,
  ChevronDown,
  Download,
  LayoutGrid,
  List,
  Plus,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../app/authClient'
import { PageContent, PageTitle } from '../components/ui'
import { useMe } from '../hooks/useMe'
import { cn } from '../lib/cn'

type DocStatus = 'draft' | 'review' | 'sign' | 'done' | 'cancelled'

type DocumentRow = {
  id: string
  number: string
  dateISO: string // YYYY-MM-DD
  category: 'Усі категорії' | 'Накази' | 'Відпустки' | 'Відрядження' | 'Відзнаки' | 'Призначення'
  typeLabel: string
  title: string
  status: DocStatus
  author: string
  needsMyAction?: boolean
}

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

const MOCK_DOCS: DocumentRow[] = [
  {
    id: 'd1',
    number: '№142',
    dateISO: '2018-09-01',
    category: 'Призначення',
    typeLabel: 'Призначення на посаду',
    title: 'Призначення Іваненка О.М. на посаду начальника відділу',
    status: 'done',
    author: 'Коваленко П.М.',
  },
  {
    id: 'd2',
    number: '№112',
    dateISO: '2015-03-01',
    category: 'Призначення',
    typeLabel: 'Призначення на посаду',
    title: 'Призначення Литвина М.С. на посаду начальника сектору',
    status: 'done',
    author: 'Коваленко П.М.',
  },
  {
    id: 'd3',
    number: '№45/1',
    dateISO: '2026-04-08',
    category: 'Відпустки',
    typeLabel: 'Відпустка',
    title: 'Надання щорічної відпустки майору Шевченку Д.С.',
    status: 'done',
    author: 'Коваленко П.М.',
  },
  {
    id: 'd4',
    number: '№52/1',
    dateISO: '2026-04-12',
    category: 'Відрядження',
    typeLabel: 'Відрядження',
    title: 'Відрядження підполковника Литвина М.С. до інституту',
    status: 'done',
    author: 'Коваленко П.М.',
  },
  {
    id: 'd5',
    number: '№draft-001',
    dateISO: '2026-04-13',
    category: 'Призначення',
    typeLabel: 'Призначення на посаду',
    title: 'Призначення на вакантну посаду інспектора (підготовка)',
    status: 'draft',
    author: 'Коваленко П.М.',
  },
  {
    id: 'd6',
    number: '№47/2',
    dateISO: '2026-04-10',
    category: 'Відзнаки',
    typeLabel: 'Відзнака',
    title: 'Нагородження капітана Коваля П.М. відзнакою',
    status: 'review',
    author: 'Коваленко П.М.',
    needsMyAction: true,
  },
  {
    id: 'd7',
    number: '№48/1',
    dateISO: '2026-04-11',
    category: 'Накази',
    typeLabel: 'Звільнення з посади',
    title: 'Звільнення з посади фахівця (завершення переведення)',
    status: 'sign',
    author: 'Коваленко П.М.',
    needsMyAction: true,
  },
  {
    id: 'd8',
    number: '№49/1',
    dateISO: '2026-05-26',
    category: 'Відпустки',
    typeLabel: 'Наказ про відпустку',
    title: 'Наказ про відпустку сержанта Романюка І.І. (підписання)',
    status: 'sign',
    author: 'Петренко Л.В.',
    needsMyAction: true,
  },
  {
    id: 'd9',
    number: '№draft-002',
    dateISO: '2026-05-25',
    category: 'Відпустки',
    typeLabel: 'Наказ про відпустку',
    title: 'Наказ про відпустку: погодження графіку на підрозділ',
    status: 'draft',
    author: 'Коваленко П.М.',
  },
]

const formatUA = (iso: string) => {
  const [y, m, d] = iso.split('-').map((x) => Number(x))

  if (!y || !m || !d) return iso

  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`
}

const startOfWeekMonday = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay() // 0..6, 0 is Sunday
  const diff = (day + 6) % 7

  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - diff)

  return d
}

export function DocumentsPage() {
  const navigate = useNavigate()
  const session = useSession()
  const me = useMe()
  const currentUserLabel =
    me.data?.name?.trim() ||
    session.data?.user?.name?.trim() ||
    session.data?.user?.email ||
    'Коваленко П.М.'

  const [tab, setTab] = useState<'all' | DocStatus>('all')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<DocumentRow['category']>('Усі категорії')
  const [preset, setPreset] = useState<
    'none' | 'myDrafts' | 'thisWeek' | 'waitingMe' | 'vacationOrders'
  >('none')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  const weekStart = useMemo(() => startOfWeekMonday(new Date()), [])
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart)

    d.setDate(d.getDate() + 7)

    return d
  }, [weekStart])

  const normalizedQuery = query.trim().toLowerCase()

  const baseFiltered = useMemo(() => {
    const matchesText = (row: DocumentRow) => {
      if (!normalizedQuery) return true

      const hay = `${row.number} ${row.typeLabel} ${row.title} ${row.author}`.toLowerCase()

      return hay.includes(normalizedQuery)
    }

    const matchesCategory = (row: DocumentRow) =>
      category === 'Усі категорії' || row.category === category

    const matchesPreset = (row: DocumentRow) => {
      if (preset === 'none') return true

      if (preset === 'myDrafts') return row.status === 'draft' && row.author === currentUserLabel

      if (preset === 'waitingMe') return Boolean(row.needsMyAction)

      if (preset === 'vacationOrders') {
        return row.category === 'Відпустки' || row.typeLabel.toLowerCase().includes('відпуст')
      }

      if (preset === 'thisWeek') {
        const dt = new Date(`${row.dateISO}T00:00:00`)

        return dt >= weekStart && dt < weekEnd
      }

      return true
    }

    return MOCK_DOCS.filter((r) => matchesText(r) && matchesCategory(r) && matchesPreset(r))
  }, [category, currentUserLabel, normalizedQuery, preset, weekEnd, weekStart])

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
    const sorted = [...rows].sort((a, b) => {
      const av = a.dateISO
      const bv = b.dateISO

      if (av === bv) return a.number.localeCompare(b.number, 'uk')

      return sortDir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv)
    })

    return sorted
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
          <label className="flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-full border border-border bg-white px-3.5 max-w-[520px]">
            <Search size={16} strokeWidth={2} aria-hidden className="text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Номер, тема, особа…"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-white px-3.5 text-sm font-semibold text-ink hover:bg-slate-50"
            >
              Усі категорії{' '}
              <ChevronDown size={16} strokeWidth={2} aria-hidden className="text-muted" />
            </button>
            <select
              className="sr-only"
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentRow['category'])}
              aria-label="Категорія"
            >
              {(
                [
                  'Усі категорії',
                  'Накази',
                  'Відпустки',
                  'Відрядження',
                  'Відзнаки',
                  'Призначення',
                ] as const
              ).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

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
            className={presetBtnClass(preset === 'myDrafts')}
            onClick={() => setPreset((p) => (p === 'myDrafts' ? 'none' : 'myDrafts'))}
          >
            Мої чернетки
          </button>
          <button
            type="button"
            className={presetBtnClass(preset === 'waitingMe')}
            onClick={() => setPreset((p) => (p === 'waitingMe' ? 'none' : 'waitingMe'))}
          >
            Очікують моєї дії
          </button>
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

      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="max-h-[min(70svh,560px)] overflow-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead className="sticky top-0 z-[1] border-b border-border bg-slate-50/95 backdrop-blur-sm">
              <tr>
                <th className={cn(thClass, 'w-10')}>
                  <span className="sr-only">Вибір</span>
                </th>
                <th className={cn(thClass, 'w-24')}>№</th>
                <th className={cn(thClass, 'w-28')}>Дата</th>
                <th className={thClass}>Тип / тема</th>
                <th className={cn(thClass, 'w-36')}>Статус</th>
                <th className={cn(thClass, 'w-44')}>Автор</th>
                <th className={cn(thClass, 'w-10')}>
                  <span className="sr-only">Дії</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center">
                    <p className="m-0 text-sm font-semibold text-ink">
                      Немає документів для поточного фільтра.
                    </p>
                    <p className="m-0 mt-1 text-sm text-muted">
                      Спробуйте змінити таб, пошук або пресет.
                    </p>
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-b-0 hover:bg-slate-50/60"
                  >
                    <td className={cn(tdClass, 'w-10')}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-slate-900"
                        aria-label={`Вибрати ${row.number}`}
                      />
                    </td>
                    <td className={cn(tdClass, 'tabular-nums text-muted')}>{row.number}</td>
                    <td className={cn(tdClass, 'tabular-nums text-muted')}>
                      {formatUA(row.dateISO)}
                    </td>
                    <td className={tdClass}>
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                            {row.typeLabel}
                          </span>
                          {row.needsMyAction ? (
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                              Потрібна дія
                            </span>
                          ) : null}
                        </div>
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
                    <td className={cn(tdClass, 'text-muted')}>{row.author}</td>
                    <td className={cn(tdClass, 'text-right')}>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContent>
  )
}
