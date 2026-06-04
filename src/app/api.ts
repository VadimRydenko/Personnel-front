export const getApiBaseUrl = () => {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
  const trimmed = baseUrl.trim().replace(/[;/]+$/, '')

  if (!trimmed) {
    throw new Error('VITE_API_BASE_URL is not set')
  }

  try {
    // validate + normalize (throws on invalid URL)
    return new URL(trimmed).toString().replace(/\/+$/, '')
  } catch {
    throw new Error(`VITE_API_BASE_URL is invalid: "${baseUrl}"`)
  }
}
