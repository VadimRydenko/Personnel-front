import type { ReactNode } from 'react'
import { Folder, MapPin, Users } from 'lucide-react'
import { cn } from '../../../lib/cn'
import type { TreeNode } from '../state/tree'

const formatPathCode = (pathSortOrders: number[]) =>
  pathSortOrders.map((n) => String(n).padStart(3, '0')).join('-')

export const UnitChildCard = ({
  unit,
  pathSortOrders,
  onSelect,
}: {
  unit: TreeNode
  pathSortOrders: number[]
  onSelect: (code: number) => void
}) => {
  const label = unit.name || `#${unit.code}`
  const typeLabel = unit.unitType?.val ?? 'підрозділ'
  const city = unit.city?.trim() || '—'

  return (
    <button
      type="button"
      onClick={() => onSelect(unit.code)}
      className="w-full cursor-pointer rounded-lg border border-border bg-surface p-4 text-left shadow-card transition hover:border-accent/40 hover:bg-slate-50/80"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-slate-50 text-slate-700"
          aria-hidden
        >
          <Folder size={20} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold text-ink">{label}</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted">
              {typeLabel}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={2} aria-hidden />
              {city}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} strokeWidth={2} aria-hidden />— посад · — вакантних
            </span>
          </div>
          <span className="mt-3 inline-block font-mono text-xs text-muted/80">
            {formatPathCode([...pathSortOrders, unit.sortOrder])}
          </span>
        </div>
      </div>
    </button>
  )
}

export const TypeFilterPill = ({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition',
      active ? 'bg-sidebar text-sidebar-foreground' : 'bg-slate-100 text-ink hover:bg-slate-200/80',
    )}
  >
    {children}
  </button>
)
