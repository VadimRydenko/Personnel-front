export const getDisplayFirstName = (name: string | null | undefined, email: string): string => {
  const raw = (name?.trim() || email.split('@')[0] || '').trim()
  const first = raw.split(/\s+/)[0]

  return first || 'колега'
}

export const getInitials = (name: string | null | undefined, email: string): string => {
  const raw = name?.trim() || email
  const parts = raw.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }

  const single = parts[0] ?? email[0] ?? '?'

  return single.slice(0, 2).toUpperCase()
}
