import { useMemo, useState } from 'react'
import { ErrorAlert, Muted } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import type { OrgPlace } from '../../../app/orgStructureApi'
import {
  getPlaceDisplayStatus,
  matchesPlaceSearch,
  matchesPlaceStatusFilter,
  PLACE_STATUS_FILTERS,
  PLACE_STATUS_LABELS,
  type PlaceStatusFilter,
} from '../state/placeStatus'
import { TypeFilterPill } from './UnitChildCard'

const statusBadgeClass: Record<ReturnType<typeof getPlaceDisplayStatus>, string> = {
  vacant: 'bg-amber-50 text-amber-800',
  occupied: 'bg-emerald-50 text-emerald-800',
  processing: 'bg-sky-50 text-sky-800',
  reduced: 'bg-slate-100 text-muted',
}

const thClass =
  'px-3 py-2.5 text-left text-[0.68rem] font-semibold uppercase tracking-wide text-muted'

const tdClass = 'px-3 py-3 text-sm text-ink'

export const UnitPlacesSection = ({
  places,
  isLoading,
  isError,
  selectedPlaceCode,
  onSelectPlace,
}: {
  places: OrgPlace[] | undefined
  isLoading: boolean
  isError: boolean
  selectedPlaceCode?: number | null
  onSelectPlace?: (placeCode: number) => void
}) => {
  const [statusFilter, setStatusFilter] = useState<PlaceStatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const placeList = useMemo(() => places ?? [], [places])
  const hasPlaces = placeList.length > 0
  const showPlaceToolbar = !isLoading && hasPlaces

  const filteredPlaces = useMemo(() => {
    return placeList.filter(
      (p) => matchesPlaceStatusFilter(p, statusFilter) && matchesPlaceSearch(p, searchQuery),
    )
  }, [placeList, searchQuery, statusFilter])

  if (!isLoading && !isError && !hasPlaces) {
    return null
  }

  return (
    <section className="mt-5 shrink-0" aria-label="Посади підрозділу">
      {showPlaceToolbar ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {PLACE_STATUS_FILTERS.map((f) => (
              <TypeFilterPill
                key={f.id}
                active={statusFilter === f.id}
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label}
              </TypeFilterPill>
            ))}
          </div>

          <label className="flex h-9 min-w-[200px] flex-1 items-center rounded-full border border-border bg-white px-3.5 max-w-[280px] sm:flex-none">
            <span className="sr-only">Пошук посади</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук посади…"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </label>
        </div>
      ) : null}

      {isError ? (
        <ErrorAlert className={showPlaceToolbar ? 'mt-3' : undefined}>
          Не вдалося завантажити посади
        </ErrorAlert>
      ) : null}

      <div
        className={cn(
          'overflow-hidden rounded-lg border border-border bg-surface',
          showPlaceToolbar && 'mt-3',
        )}
      >
        <div className="max-h-[min(320px,40vh)] overflow-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="sticky top-0 z-[1] border-b border-border bg-slate-50/95 backdrop-blur-sm">
              <tr>
                <th className={thClass}>Найменування</th>
                <th className={thClass}>Звання</th>
                <th className={cn(thClass, 'w-14 text-center')}>Т.Р.</th>
                <th className={cn(thClass, 'text-right')}>Оклад</th>
                <th className={thClass}>Обіймач</th>
                <th className={cn(thClass, 'w-32')}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center">
                    <Muted>Завантаження посад…</Muted>
                  </td>
                </tr>
              ) : filteredPlaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center">
                    <Muted>Немає посад для обраного фільтра.</Muted>
                  </td>
                </tr>
              ) : (
                filteredPlaces.map((place) => {
                  const status = getPlaceDisplayStatus(place)
                  const isSelected = selectedPlaceCode === place.code

                  return (
                    <tr
                      key={place.code}
                      className={cn(
                        'border-b border-border last:border-b-0 hover:bg-slate-50/60',
                        onSelectPlace && 'cursor-pointer',
                        isSelected && 'bg-slate-100/80',
                      )}
                      onClick={
                        onSelectPlace
                          ? () => {
                              onSelectPlace(place.code)
                            }
                          : undefined
                      }
                    >
                      <td className={cn(tdClass, 'font-medium')}>{place.placeType?.val ?? '—'}</td>
                      <td className={tdClass}>—</td>
                      <td className={cn(tdClass, 'text-center tabular-nums')}>—</td>
                      <td className={cn(tdClass, 'text-right tabular-nums')}>—</td>
                      <td className={tdClass}>—</td>
                      <td className={tdClass}>
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            statusBadgeClass[status],
                          )}
                        >
                          {PLACE_STATUS_LABELS[status]}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
