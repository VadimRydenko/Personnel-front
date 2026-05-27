import { Building2, Download, MapPin, MoreHorizontal, Plus, Printer, Users } from 'lucide-react'
import { ErrorAlert, Muted } from '../../../components/ui'
import type { OrgStructurePageState } from '../state/useOrgStructurePage'
import { TypeFilterPill, UnitChildCard } from './UnitChildCard'
import { UnitPlacesSection } from './UnitPlacesSection'

const stubActionClass =
  'inline-flex h-9 items-center gap-2 rounded-sm border border-border bg-white px-3 text-sm font-medium text-ink opacity-70'

const actionClass =
  'inline-flex h-9 cursor-pointer items-center gap-2 rounded-sm border border-border bg-white px-3 text-sm font-medium text-ink hover:bg-slate-50'

export const UnitCardPanel = ({ state }: { state: OrgStructurePageState }) => {
  const crumbs = state.selectedBreadcrumbs
  const details = state.selectedDetailsQuery.data
  const placesCount = state.selectedPlaces?.length ?? details?.places?.length
  const childrenCount = state.selectedNode?.children.length ?? 0
  const pathSortOrders = crumbs.map((c) => c.sortOrder)

  const title =
    details?.name ?? (state.selectedCode != null ? `Підрозділ #${state.selectedCode}` : 'Підрозділ')

  const cityLabel = details?.city?.trim() || '—'
  const staffLabel = placesCount != null ? `${placesCount} штатних одиниць` : '— штатних одиниць'
  const subdivisionsLabel =
    childrenCount > 0
      ? `${childrenCount} ${childrenCount === 1 ? 'підрозділ' : childrenCount < 5 ? 'підрозділи' : 'підрозділів'}`
      : '0 підрозділів'

  const unitTypes = state.catalogQuery.data?.unitTypes ?? []
  const hasChildUnits = childrenCount > 0

  return (
    <section
      className="box-border flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-l border-border bg-main px-5 py-4 max-[900px]:w-full max-[900px]:flex-[0_1_auto] max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:overflow-visible"
      aria-label="Контент підрозділу"
    >
      {state.selectedCode == null ? (
        <div className="flex flex-1 flex-col justify-center">
          <Muted className="text-center">
            Оберіть підрозділ зліва, щоб переглянути вкладені підрозділи.
          </Muted>
        </div>
      ) : (
        <>
          <div className="shrink-0 -mx-5 -mt-4 border-b border-border bg-surface px-5 pt-4 pb-4">
            <p className="m-0 text-sm text-muted">
              {crumbs.length ? crumbs.map((x) => x.name || `#${x.code}`).join(' / ') : '—'}
            </p>

            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="m-0 min-w-0 flex-1 text-[1.65rem] font-extrabold leading-tight tracking-[-0.03em] text-ink">
                {state.selectedDetailsQuery.isLoading ? 'Завантаження…' : title}
              </h1>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className={actionClass}
                  onClick={state.createPlaceModal.open}
                  title="Створити посаду"
                >
                  <Plus size={16} strokeWidth={2} aria-hidden />
                  Нова посада
                </button>
                <button type="button" className={stubActionClass} disabled title="Незабаром">
                  <Printer size={16} strokeWidth={2} aria-hidden />
                  Друк
                </button>
                <button type="button" className={stubActionClass} disabled title="Незабаром">
                  <Download size={16} strokeWidth={2} aria-hidden />
                  Експорт
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border bg-white text-ink opacity-70"
                  disabled
                  title="Незабаром"
                  aria-label="Ще"
                >
                  <MoreHorizontal size={18} strokeWidth={2} aria-hidden />
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={16} strokeWidth={2} aria-hidden className="shrink-0" />
                {cityLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={16} strokeWidth={2} aria-hidden className="shrink-0" />
                {staffLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 size={16} strokeWidth={2} aria-hidden className="shrink-0" />
                {subdivisionsLabel}
              </span>
            </div>
          </div>

          {state.selectedDetailsQuery.isError ? (
            <ErrorAlert className="mt-4 shrink-0">Не вдалося завантажити підрозділ</ErrorAlert>
          ) : null}

          <UnitPlacesSection
            key={state.selectedCode}
            places={state.selectedPlaces}
            isLoading={state.selectedPlacesLoading}
            isError={state.selectedPlacesError}
            selectedPlaceCode={state.selectedPlaceCode}
            onSelectPlace={state.setSelectedPlaceCode}
          />

          {hasChildUnits ? (
            <>
              <div className="mt-5 flex shrink-0 flex-wrap gap-2 overflow-x-auto pb-1">
                <TypeFilterPill active={!state.typeFilter} onClick={() => state.setTypeFilter('')}>
                  Усі типи
                </TypeFilterPill>
                {unitTypes.map((t) => (
                  <TypeFilterPill
                    key={t.code}
                    active={state.typeFilter === String(t.code)}
                    onClick={() => state.setTypeFilter(String(t.code))}
                  >
                    {t.val}
                  </TypeFilterPill>
                ))}
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-auto">
                {state.childUnits.length === 0 ? (
                  <Muted>Немає підрозділів для обраного типу.</Muted>
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-3 p-0">
                    {state.childUnits.map((child) => (
                      <li key={child.code}>
                        <UnitChildCard
                          unit={child}
                          pathSortOrders={pathSortOrders}
                          onSelect={state.setSelectedCode}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  )
}
