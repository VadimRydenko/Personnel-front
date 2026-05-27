import { Muted } from '../../../../../components/ui'
import { AttributeRow } from '../AttributeRow'
import type { PlaceDetailsTabProps } from '../types'

export const VacantCurrentStateTab = ({ details, isLoading }: PlaceDetailsTabProps) => {
  if (isLoading) {
    return <Muted className="py-4">Завантаження…</Muted>
  }

  return (
    <div>
      <p className="m-0 border-b border-border py-3 text-sm leading-relaxed text-muted">
        Посада вакантна. Обіймач не призначений — можна призначити військовослужбовця на цю штатну
        одиницю.
      </p>
      <AttributeRow label="Статус" value={details?.statusLabel ?? 'Вакантна'} />
      <AttributeRow label="Обіймач" value="—" />
      <AttributeRow label="Ставок" value={details != null ? `0 / ${details.posCount}` : '—'} />
      <AttributeRow label="Підрозділ" value={details?.orgUnit?.name?.trim() || '—'} />
    </div>
  )
}

export const OccupiedCurrentStateTab = ({ details, isLoading }: PlaceDetailsTabProps) => {
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
      <AttributeRow label="Статус" value={details?.statusLabel ?? '—'} />
    </div>
  )
}
