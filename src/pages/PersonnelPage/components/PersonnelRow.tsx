import { MapPin, MoreHorizontal } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { STATUS_BADGE, STATUS_DOT, STATUS_LABEL, getAvatarColor, getInitials } from '../constants'
import type { Person } from '../types'

export function PersonnelRow({ person }: { person: Person }) {
  const avatarColor = getAvatarColor(person.fullName)
  const initials = getInitials(person.lastName, person.firstName)

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-slate-50/60">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white',
                avatarColor,
              )}
            >
              {initials}
            </div>
            <span
              className={cn(
                'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white',
                STATUS_DOT[person.status],
              )}
            />
          </div>
          <span className="font-semibold text-ink">{person.fullName}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted">{person.position ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-muted">{person.rank ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-muted">
        {person.unit ? (
          <span className="inline-flex items-center gap-1">
            <MapPin size={13} strokeWidth={2} aria-hidden />
            {person.unit}
          </span>
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
            STATUS_BADGE[person.status],
          )}
        >
          {STATUS_LABEL[person.status]}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            className="rounded border border-accent/25 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent transition hover:bg-accent/10"
          >
            Картка
          </button>
          <button
            type="button"
            className="rounded border border-border bg-white px-2.5 py-1 text-xs font-semibold text-ink transition hover:bg-slate-50"
          >
            Відп.
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded border border-border bg-white text-muted transition hover:bg-slate-50"
            aria-label="Дії"
          >
            <MoreHorizontal size={14} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </td>
    </tr>
  )
}
