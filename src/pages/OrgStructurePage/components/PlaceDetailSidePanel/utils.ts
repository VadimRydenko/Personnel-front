import type { StackedActionButtonItem } from '../../../../components/ui'
import type { OrgPlaceDetails } from '../../../../app/orgStructureApi'

export const formatUkDate = (iso: string | null | undefined) => {
  if (!iso) return '—'

  const part = iso.split('T')[0]
  const [y, m, d] = part.split('-')

  if (!y || !m || !d) return '—'

  return `${d}.${m}.${y}`
}

export const getCreateOrderBasis = (details: OrgPlaceDetails | undefined) => {
  const order = details?.createOrder

  if (order?.orderNo && order?.orderDate) {
    return `Наказ №${order.orderNo} від ${formatUkDate(order.orderDate)}`
  }

  if (order?.orderNo) return `Наказ №${order.orderNo}`

  return '—'
}

export const getPlaceCardActions = (
  details: OrgPlaceDetails | undefined,
  navigate: (path: string) => void,
): StackedActionButtonItem[] => {
  if (!details) return []

  if (details.status === 'vacant') {
    return [
      { label: 'Призначити', variant: 'primary', onClick: () => navigate('/documents/new') },
      { label: 'Скоротити', variant: 'outline', disabled: true },
    ]
  }

  if (details.status === 'reduced') {
    return []
  }

  return [
    { label: 'Звільнити', variant: 'danger', disabled: true },
    { label: 'Перемістити', variant: 'outline', disabled: true },
    { label: 'Скоротити', variant: 'outline', disabled: true },
  ]
}
