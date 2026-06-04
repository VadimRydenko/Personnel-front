import { X } from 'lucide-react'
import { ErrorAlert, Muted, StackedActionButtons, TabPlaceholder } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { formatUkDate } from '../../../lib/dateUtils'
import type { OrgUnitDetails } from '../../../app/orgStructureApi'
import type { DetailCardTab, OrgStructurePageState } from '../state/useOrgStructurePage'
import { formatPathCode } from './utils'
import { AttributeRow } from './AttributeRow'

const DETAIL_TABS: { id: DetailCardTab; label: string }[] = [
  { id: 'attributes', label: 'Атрибути' },
  { id: 'positions', label: 'Посади' },
  { id: 'documents', label: 'Документи' },
  { id: 'history', label: 'Історія' },
]

const shortNameFromUnit = (name: string | undefined) => {
  if (!name?.trim()) return '—'

  const words = name.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) return '—'

  if (words.length === 1) return words[0].slice(0, 3).toUpperCase()

  return words
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

const AttributeBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="border-b border-border py-3 last:border-b-0">
    <p className="m-0 text-sm text-muted">{label}</p>
    <p className="mt-1.5 m-0 text-sm font-semibold leading-snug text-ink">{value}</p>
  </div>
)

const AttributesTab = ({
  details,
  pathSortOrders,
  isLoading,
}: {
  details: OrgUnitDetails | undefined
  pathSortOrders: number[]
  isLoading: boolean
}) => {
  if (isLoading) {
    return <Muted className="py-4">Завантаження…</Muted>
  }

  const placesCount = details?.places?.length ?? 0
  const order = details?.createOrder
  const basis =
    order?.orderNo && order?.orderDate
      ? `Наказ №${order.orderNo} від ${formatUkDate(order.orderDate)}`
      : '—'

  const positionsLabel =
    placesCount > 0 ? `${placesCount} (— зайнятих, — вакантних)` : '— (— зайнятих, — вакантних)'

  const status = details?.validTo == null ? 'Активний' : 'Неактивний'

  return (
    <div>
      <AttributeRow label="Повна назва" value={details?.name?.trim() || '—'} />
      <AttributeRow label="Скорочена назва" value={shortNameFromUnit(details?.name)} />
      <AttributeRow label="Тип" value={details?.unitType?.val?.toLowerCase() || '—'} />
      <AttributeRow
        label="Код підрозділу"
        value={
          pathSortOrders.length && details
            ? formatPathCode([...pathSortOrders, details.sortOrder])
            : '—'
        }
      />
      <AttributeRow label="Дислокація" value={details?.city?.trim() || '—'} />
      <AttributeRow label="Введено" value={formatUkDate(details?.validFrom)} />
      <AttributeRow label="Підстава" value={basis} />
      <AttributeRow label="Статус" value={status} />
      <AttributeRow label="Посад" value={positionsLabel} />
      <AttributeBlock label="Функція" value="—" />
    </div>
  )
}

export const UnitDetailSidePanel = ({ state }: { state: OrgStructurePageState }) => {
  const pathSortOrders = state.selectedBreadcrumbs.map((c) => c.sortOrder)
  const details = state.selectedDetailsQuery.data

  const cardActions = [
    {
      label: 'Переглянути в штатному розписі',
      variant: 'primary' as const,
      disabled: true,
    },
    { label: 'Перейменувати', variant: 'outline' as const, disabled: true },
    { label: 'Вивести зі штату', variant: 'danger' as const, disabled: true },
  ]

  return (
    <section
      className="box-border flex w-[400px] shrink-0 flex-col overflow-hidden border-l border-border bg-surface max-[900px]:hidden"
      aria-label="Картка підрозділу"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="m-0 text-lg font-bold text-ink">Картка підрозділу</h2>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-muted hover:bg-slate-100 hover:text-ink"
          onClick={state.closeDetailCard}
          aria-label="Закрити картку"
        >
          <X size={20} strokeWidth={2} aria-hidden />
        </button>
      </header>

      <nav className="flex shrink-0 gap-0 border-b border-border px-5" aria-label="Вкладки картки">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => state.setDetailCardTab(tab.id)}
            className={cn(
              'cursor-pointer border-0 border-b-2 bg-transparent px-3 py-3 text-sm font-medium transition',
              state.detailCardTab === tab.id
                ? 'border-ink text-ink'
                : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-auto px-5">
        {state.selectedDetailsQuery.isError ? (
          <ErrorAlert className="my-4">Не вдалося завантажити підрозділ</ErrorAlert>
        ) : null}

        {state.detailCardTab === 'attributes' ? (
          <AttributesTab
            details={details}
            pathSortOrders={pathSortOrders}
            isLoading={state.selectedDetailsQuery.isLoading}
          />
        ) : state.detailCardTab === 'positions' ? (
          <TabPlaceholder title="Посади" />
        ) : state.detailCardTab === 'documents' ? (
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
