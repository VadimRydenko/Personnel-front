export const formatUkDate = (iso: string | null | undefined): string => {
  if (!iso) return '—'

  const part = iso.split('T')[0]
  const [y, m, d] = part.split('-')

  if (!y || !m || !d) return '—'

  return `${d}.${m}.${y}`
}
