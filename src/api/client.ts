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

export async function fetchArchidektDeck(deckId: string): Promise<string> {
  const res = await fetch(`https://archidekt.com/api/decks/${deckId}/`, {
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    throw new Error('Failed to fetch deck from Archidekt')
  }

  const data = await res.json()
  const lines: string[] = []

  for (const card of data.cards ?? []) {
    const name = card.card?.oracleCard?.name ?? card.card?.name
    const qty = card.quantity ?? 1
    const categories = card.categories ?? []

    if (!name) continue

    if (categories.includes('Commander')) {
      lines.unshift(`// Commander`)
      lines.splice(1, 0, `${qty} ${name}`)
    } else {
      lines.push(`${qty} ${name}`)
    }
  }

  return lines.join('\n')
}
