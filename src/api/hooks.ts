import { useMutation } from '@tanstack/react-query'
import { apiPost } from './client'
import type { CompleteAnalysis } from './types'

interface AnalyzeRequest {
  decklist: string
  commander?: string
}

export function useAnalyzeDeck() {
  return useMutation({
    mutationFn: (req: AnalyzeRequest) =>
      apiPost<CompleteAnalysis>('/decks/analyze-complete', req),
  })
}
