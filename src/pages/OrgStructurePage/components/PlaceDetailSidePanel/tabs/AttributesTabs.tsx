import { Muted } from '../../../../../components/ui'
import { AttributeRow } from '../../AttributeRow'
import type { PlaceDetailsTabProps } from '../types'
import { formatUkDate, getCreateOrderBasis } from '../utils'

export const VacantAttributesTab = ({ details, isLoading }: PlaceDetailsTabProps) => {
  if (isLoading) {
    return <Muted className="py-4">Завантаження…</Muted>
  }

  return (
    <div>
      <AttributeRow label="Найменування" value={details?.title?.trim() || '—'} />
      <AttributeRow label="Тарифний розряд" value="—" />
      <AttributeRow label="Код КП" value="—" />
      <AttributeRow label="Посадовий оклад" value="—" />
      <AttributeRow label="Керівна" value={details?.isChief ? 'Так' : 'Ні'} />
      <AttributeRow label="Введено" value={formatUkDate(details?.validFrom)} />
      <AttributeRow label="Підстава" value={getCreateOrderBasis(details)} />
    </div>
  )
}

export const OccupiedAttributesTab = ({ details, isLoading }: PlaceDetailsTabProps) => {
  if (isLoading) {
    return <Muted className="py-4">Завантаження…</Muted>
  }

  return (
    <div>
      <AttributeRow label="Найменування" value={details?.title?.trim() || '—'} />
      <AttributeRow label="Обіймач" value={details?.assignee?.fullName?.trim() || '—'} />
      <AttributeRow label="Тарифний розряд" value="—" />
      <AttributeRow label="Код КП" value="—" />
      <AttributeRow label="Посадовий оклад" value="—" />
      <AttributeRow label="Керівна" value={details?.isChief ? 'Так' : 'Ні'} />
      <AttributeRow label="Введено" value={formatUkDate(details?.validFrom)} />
      <AttributeRow label="Підстава" value={getCreateOrderBasis(details)} />
    </div>
  )
}

export const ReducedAttributesTab = ({ details, isLoading }: PlaceDetailsTabProps) => {
  if (isLoading) {
    return <Muted className="py-4">Завантаження…</Muted>
  }

  const destroyOrder = details?.destroyOrder

  return (
    <div>
      <AttributeRow label="Найменування" value={details?.title?.trim() || '—'} />
      <AttributeRow label="Введено" value={formatUkDate(details?.validFrom)} />
      <AttributeRow label="Підстава введення" value={getCreateOrderBasis(details)} />
      <AttributeRow label="Виведено" value={formatUkDate(details?.validTo)} />
      <AttributeRow
        label="Підстава виведення"
        value={
          destroyOrder?.orderNo && destroyOrder?.orderDate
            ? `Наказ №${destroyOrder.orderNo} від ${formatUkDate(destroyOrder.orderDate)}`
            : destroyOrder?.orderNo
              ? `Наказ №${destroyOrder.orderNo}`
              : '—'
        }
      />
    </div>
  )
}
