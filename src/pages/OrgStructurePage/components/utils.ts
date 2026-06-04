export const formatPathCode = (pathSortOrders: number[]) =>
  pathSortOrders.map((n) => String(n).padStart(3, '0')).join('-')
