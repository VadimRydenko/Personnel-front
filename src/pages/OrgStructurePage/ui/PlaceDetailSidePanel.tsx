import { X } from 'lucide-react'
import { ErrorAlert, Muted, StackedActionButtons } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import type { OrgPlaceDetails } from '../../../app/orgStructureApi'
import type { PlaceDetailCardTab, OrgStructurePageState } from '../state/useOrgStructurePage'

const DETAIL_TABS: { id: PlaceDetailCardTab; label: string }[] = [
  { id: 'attributes', label: 'Атрибути' },
  { id: 'currentState', label: 'Поточний стан' },
  { id: 'documents', label: 'Документи' },
  { id: 'history', label: 'Історія' },
]

const formatUkDate = (iso: string | null | undefined) => {
  if (!iso) return '—'

  const part = iso.split('T')[0]
  const [y, m, d] = part.split('-')

  if (!y || !m || !d) return '—'

  return `${d}.${m}.${y}`
}

const statusBadgeClass: Record<OrgPlaceDetails['status'], string> = {
  vacant: 'border-amber-200 bg-amber-50 text-amber-800',
  occupied: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  processing: 'border-sky-200 bg-sky-50 text-sky-800',
  reduced: 'border-border bg-slate-100 text-muted',
}

const AttributeRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
    <span className="shrink-0 text-sm text-muted">{label}</span>
    <span className="min-w-0 text-right text-sm font-semibold text-ink">{value}</span>
  </div>
)

const AttributesTab = ({
  details,
  isLoading,
}: {
  details: OrgPlaceDetails | undefined
  isLoading: boolean
}) => {
  if (isLoading) {
    return <Muted className="py-4">Завантаження…</Muted>
  }

  const order = details?.createOrder
  const basis =
    order?.orderNo && order?.orderDate
      ? `Наказ №${order.orderNo} від ${formatUkDate(order.orderDate)}`
      : order?.orderNo
        ? `Наказ №${order.orderNo}`
        : '—'

  return (
    <div>
      <AttributeRow label="Найменування" value={details?.title?.trim() || '—'} />
      <AttributeRow label="Тарифний розряд" value="—" />
      <AttributeRow label="Код КП" value="—" />
      <AttributeRow label="Посадовий оклад" value="—" />
      <AttributeRow label="Керівна" value={details?.isChief ? 'Так' : 'Ні'} />
      <AttributeRow label="Введено" value={formatUkDate(details?.validFrom)} />
      <AttributeRow label="Підстава" value={basis} />
    </div>
  )
}

const CurrentStateTab = ({
  details,
  isLoading,
}: {
  details: OrgPlaceDetails | undefined
  isLoading: boolean
}) => {
  if (isLoading) {
    return <Muted className="py-4">Завантаження…</Muted>
  }

  return (
    <div>
      <AttributeRow label="Обіймач" value={details?.assignee?.fullName?.trim() || '—'} />
      <AttributeRow
        label="Ставок"
        value={details != null ? `${details.manCount} / ${details.posCount}` : '—'}
      />
      <AttributeRow label="Підрозділ" value={details?.orgUnit?.name?.trim() || '—'} />
    </div>
  )
}

const TabPlaceholder = ({ title }: { title: string }) => (
  <Muted className="py-8 text-center">{title} (незабаром)</Muted>
)

export const PlaceDetailSidePanel = ({ state }: { state: OrgStructurePageState }) => {
  const details = state.selectedPlaceDetailsQuery.data

  const cardActions = [
    { label: 'Звільнити', variant: 'danger' as const, disabled: true },
    { label: 'Перемістити', variant: 'outline' as const, disabled: true },
    { label: 'Скоротити', variant: 'outline' as const, disabled: true },
  ]

  return (
    <section
      className="box-border flex w-[400px] shrink-0 flex-col overflow-hidden border-l border-border bg-surface max-[900px]:hidden"
      aria-label="Картка посади"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="m-0 text-lg font-bold text-ink">Картка посади</h2>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-muted hover:bg-slate-100 hover:text-ink"
          onClick={state.closePlaceDetailCard}
          aria-label="Закрити картку"
        >
          <X size={20} strokeWidth={2} aria-hidden />
        </button>
      </header>

      <div className="shrink-0 border-b border-border px-5 py-4">
        {state.selectedPlaceDetailsQuery.isLoading ? (
          <p className="m-0 text-xl font-bold text-ink">Завантаження…</p>
        ) : (
          <>
            <h3 className="m-0 text-xl font-bold leading-snug text-ink">
              {details?.title?.trim() || '—'}
            </h3>
            {details ? (
              <span
                className={cn(
                  'mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                  statusBadgeClass[details.status],
                )}
              >
                {details.statusLabel}
              </span>
            ) : null}
          </>
        )}
      </div>

      <nav className="flex shrink-0 gap-0 border-b border-border px-5" aria-label="Вкладки картки">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => state.setPlaceDetailCardTab(tab.id)}
            className={cn(
              'cursor-pointer border-0 border-b-2 bg-transparent px-3 py-3 text-sm font-medium transition',
              state.placeDetailCardTab === tab.id
                ? 'border-ink text-ink'
                : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-auto px-5">
        {state.selectedPlaceDetailsQuery.isError ? (
          <ErrorAlert className="my-4">Не вдалося завантажити посаду</ErrorAlert>
        ) : null}

        {state.placeDetailCardTab === 'attributes' ? (
          <AttributesTab details={details} isLoading={state.selectedPlaceDetailsQuery.isLoading} />
        ) : state.placeDetailCardTab === 'currentState' ? (
          <CurrentStateTab
            details={details}
            isLoading={state.selectedPlaceDetailsQuery.isLoading}
          />
        ) : state.placeDetailCardTab === 'documents' ? (
          <TabPlaceholder title="Документи" />
        ) : (
          <TabPlaceholder title="Історія" />
        )}

        <div className="pt-4 pb-5">
          <StackedActionButtons items={cardActions} />
        </div>
      </div>
    </section>
  )
}
