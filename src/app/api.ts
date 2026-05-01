export type HealthCheckResult = {
  ok: true
  status: number
  url: string
  body?: unknown
}

export function getApiBaseUrl() {
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

async function readBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.toLowerCase().includes('application/json')) {
    try {
      return await res.json()
    } catch {
      // fall through to text for broken/mislabelled JSON responses
    }
  }
  const text = await res.text()
  return text ? { text } : undefined
}

export async function healthCheck(): Promise<HealthCheckResult> {
  const url = `${getApiBaseUrl()}/health`
  let res: Response
  try {
    res = await fetch(url, { method: 'GET' })
  } catch (e) {
    console.log('222_fetch_error', url, e)
    throw e
  }

  const body = await readBody(res)
  if (!res.ok) {
    const error = new Error(`Health check failed (${res.status})`)
    ;(error as Error & { status?: number; url?: string; body?: unknown }).status = res.status
    ;(error as Error & { status?: number; url?: string; body?: unknown }).url = url
    ;(error as Error & { status?: number; url?: string; body?: unknown }).body = body
    throw error
  }
  return { ok: true, status: res.status, url, body }
}
