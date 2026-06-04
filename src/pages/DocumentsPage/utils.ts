export const toDateISO = (iso: string) => iso.slice(0, 10)

export const startOfWeekMonday = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day + 6) % 7

  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - diff)

  return d
}
