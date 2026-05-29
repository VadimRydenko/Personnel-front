import { MapPin, MoreHorizontal } from 'lucide-react'
import { cn } from '../../../lib/cn'
import {
  DATE_COLOR,
  STATUS_BADGE,
  STATUS_DOT,
  STATUS_LABEL,
  getAvatarColor,
  getInitials,
} from '../constants'
import type { Person } from '../types'

export function PersonnelCard({ person }: { person: Person }) {
  const avatarColor = getAvatarColor(person.fullName)
  const initials = getInitials(person.lastName, person.firstName)

  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface shadow-card">
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full text-base font-bold tracking-wide text-white',
                avatarColor,
              )}
            >
              {initials}
            </div>
            <span
              className={cn(
                'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white',
                STATUS_DOT[person.status],
              )}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="m-0 text-base font-bold leading-snug text-ink">{person.fullName}</p>
            <span
              className={cn(
                'mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                STATUS_BADGE[person.status],
              )}
            >
              {STATUS_LABEL[person.status]}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-sm text-muted">
          <p className="m-0 font-medium text-ink">{person.position ?? '—'}</p>
          {person.rank && <p className="m-0">{person.rank}</p>}
          {person.unit && (
            <p className="m-0 inline-flex items-center gap-1">
              <MapPin size={13} strokeWidth={2} className="shrink-0 text-muted" aria-hidden />
              {person.unit}
            </p>
          )}
          {person.dateFrom && person.dateTo && (
            <p className={cn('m-0 mt-0.5 text-xs font-semibold', DATE_COLOR[person.status])}>
              {person.dateFrom} — {person.dateTo}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <button
          type="button"
          className="flex-1 rounded border border-accent/25 bg-accent/5 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent/10"
        >
          Картка
        </button>
        <button
          type="button"
          className="rounded border border-border bg-white px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-slate-50"
        >
          Відп.
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded border border-border bg-white text-muted transition hover:bg-slate-50 hover:text-ink"
          aria-label="Дії"
        >
          <MoreHorizontal size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  )
}
