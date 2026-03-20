const API_BASE = import.meta.env.VITE_API_URL || 'https://mtg-assistant.up.railway.app'

export class ApiError extends Error {
  status: number
  statusText: string
  body?: string

  constructor(status: number, statusText: string, body?: string) {
    super(`API Error ${status}: ${statusText}`)
    this.status = status
    this.statusText = statusText
    this.body = body
  }
}

export async function apiPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, res.statusText, text)
  }

  return res.json() as Promise<T>
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    signal: AbortSignal.timeout(30_000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, res.statusText, text)
  }

  return res.json() as Promise<T>
}

interface FetchUrlResponse {
  decklist: string
  source_url: string
  source_type: string
  card_count: number
}

export async function fetchDeckFromUrl(url: string): Promise<string> {
  const data = await apiPost<FetchUrlResponse>('/decks/fetch-url', { url })
  return data.decklist
}
