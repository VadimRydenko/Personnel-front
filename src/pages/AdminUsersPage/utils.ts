export const toggleNumber = (list: number[], value: number) =>
  list.includes(value) ? list.filter((x) => x !== value) : [...list, value]

export const toggleString = (list: string[], value: string) =>
  list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
