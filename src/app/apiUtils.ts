export const getErrorMessage = (body: unknown, status: number) =>
  typeof body === 'object' &&
  body !== null &&
  'message' in body &&
  typeof (body as { message: unknown }).message === 'string'
    ? (body as { message: string }).message
    : `Request failed (${status})`

export const readJson = async (res: Response): Promise<unknown> => {
  const text = await res.text()

  if (!text) return undefined

  try {
    return JSON.parse(text) as unknown
  } catch {
    return { text }
  }
}
