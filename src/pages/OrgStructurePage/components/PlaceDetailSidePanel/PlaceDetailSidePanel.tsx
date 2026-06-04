import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { ErrorAlert, Muted, StackedActionButtons, TabPlaceholder } from '../../../../components/ui'
import { cn } from '../../../../lib/cn'
import type { OrgStructurePageState } from '../../state/useOrgStructurePage'
import { DETAIL_TABS, statusBadgeClass } from './constants'
import { getPlaceCardActions } from './utils'
import {
  ReducedAttributesTab,
  OccupiedAttributesTab,
  VacantAttributesTab,
} from './tabs/AttributesTabs'
import { OccupiedCurrentStateTab, VacantCurrentStateTab } from './tabs/CurrentStateTabs'

const PanelHeader = ({ onClose }: { onClose: () => void }) => (
  <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
    <h2 className="m-0 text-lg font-bold text-ink">Картка посади</h2>
    <button
      type="button"
      className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-muted hover:bg-slate-100 hover:text-ink"
      onClick={onClose}
      aria-label="Закрити картку"
    >
      <X size={20} strokeWidth={2} aria-hidden />
    </button>
  </header>
)

const PlaceTitleSection = ({
  title,
  status,
  statusLabel,
  isLoading,
}: {
  title: string
  status: 'vacant' | 'occupied' | 'processing' | 'reduced' | undefined
  statusLabel: string | undefined
  isLoading: boolean
}) => (
  <div className="shrink-0 border-b border-border px-5 py-4">
    {isLoading ? (
      <p className="m-0 text-xl font-bold text-ink">Завантаження…</p>
    ) : (
      <>
        <h3 className="m-0 text-xl font-bold leading-snug text-ink">{title}</h3>
        {status ? (
          <span
            className={cn(
              'mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold',
              statusBadgeClass[status],
            )}
          >
            {statusLabel}
          </span>
        ) : null}
      </>
    )}
  </div>
)

const TabsNav = ({
  activeTab,
  onChange,
}: {
  activeTab: OrgStructurePageState['placeDetailCardTab']
  onChange: (t: OrgStructurePageState['placeDetailCardTab']) => void
}) => (
  <nav className="flex shrink-0 gap-0 border-b border-border px-5" aria-label="Вкладки картки">
    {DETAIL_TABS.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={cn(
          'cursor-pointer border-0 border-b-2 bg-transparent px-3 py-3 text-sm font-medium transition',
          activeTab === tab.id
            ? 'border-ink text-ink'
            : 'border-transparent text-muted hover:text-ink',
        )}
      >
        {tab.label}
      </button>
    ))}
  </nav>
)

const PanelBody = ({
  state,
  isLoading,
  isVacant,
  isReduced,
}: {
  state: OrgStructurePageState
  isLoading: boolean
  isVacant: boolean
  isReduced: boolean
}) => {
  const details = state.selectedPlaceDetailsQuery.data

  return (
    <div className="min-h-0 flex-1 overflow-auto px-5">
      {state.selectedPlaceDetailsQuery.isError ? (
        <ErrorAlert className="my-4">Не вдалося завантажити посаду</ErrorAlert>
      ) : null}

      {state.placeDetailCardTab === 'attributes' ? (
        isReduced ? (
          <ReducedAttributesTab details={details} isLoading={isLoading} />
        ) : isVacant ? (
          <VacantAttributesTab details={details} isLoading={isLoading} />
        ) : (
          <OccupiedAttributesTab details={details} isLoading={isLoading} />
        )
      ) : state.placeDetailCardTab === 'currentState' ? (
        isVacant ? (
          <VacantCurrentStateTab details={details} isLoading={isLoading} />
        ) : (
          <OccupiedCurrentStateTab details={details} isLoading={isLoading} />
        )
      ) : state.placeDetailCardTab === 'documents' ? (
        <TabPlaceholder title="Документи" />
      ) : (
        <TabPlaceholder title="Історія" />
      )}
    </div>
  )
}

export const PlaceDetailSidePanel = ({ state }: { state: OrgStructurePageState }) => {
  const details = state.selectedPlaceDetailsQuery.data
  const isLoading = state.selectedPlaceDetailsQuery.isLoading
  const isVacant = details?.status === 'vacant'
  const isReduced = details?.status === 'reduced'
  const navigate = useNavigate()

  const cardActions = useMemo(() => getPlaceCardActions(details, navigate), [details, navigate])

  return (
    <section
      className="box-border flex w-[400px] shrink-0 flex-col overflow-hidden border-l border-border bg-surface max-[900px]:hidden"
      aria-label="Картка посади"
    >
      <PanelHeader onClose={state.closePlaceDetailCard} />

      <PlaceTitleSection
        title={details?.title?.trim() || '—'}
        status={details?.status}
        statusLabel={details?.statusLabel}
        isLoading={isLoading}
      />

      <TabsNav activeTab={state.placeDetailCardTab} onChange={state.setPlaceDetailCardTab} />

      {details == null && !isLoading ? (
        <Muted className="px-5 py-4">—</Muted>
      ) : (
        <PanelBody state={state} isLoading={isLoading} isVacant={isVacant} isReduced={isReduced} />
      )}

      {cardActions.length > 0 ? (
        <div className="shrink-0 border-t border-border px-5">
          <div className="pt-4 pb-5">
            <StackedActionButtons items={cardActions} />
          </div>
        </div>
      ) : null}
    </section>
  )
}
