import { useState, useCallback } from 'react'
import type { CompleteAnalysis } from '../api/types'

export interface SavedDeck {
  id: string
  commander: string | null
  bracket: number
  engine: string
  cardCount: number
  savedAt: string // ISO date
  analysis: CompleteAnalysis
}

const STORAGE_KEY = 'commander-bracket-saved-decks'

function loadDecks(): SavedDeck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedDeck[]
  } catch {
    return []
  }
}

function persistDecks(decks: SavedDeck[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
}

export function extractCommander(analysis: CompleteAnalysis): string | null {
  const ca = analysis.commander_analysis
  if (ca && typeof ca === 'object' && 'name' in ca) {
    return ca.name as string
  }
  return null
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function useSavedDecks() {
  const [decks, setDecks] = useState<SavedDeck[]>(loadDecks)

  const saveDeck = useCallback((analysis: CompleteAnalysis) => {
    const commander = extractCommander(analysis)
    const newDeck: SavedDeck = {
      id: generateId(),
      commander,
      bracket: analysis.bracket_analysis.deck_bracket,
      engine: analysis.ipom_analysis.engine.primary_engine,
      cardCount: analysis.deck_stats.total_cards,
      savedAt: new Date().toISOString(),
      analysis,
    }

    setDecks(prev => {
      // Replace if same commander exists, otherwise add
      const existing = prev.findIndex(d => d.commander && d.commander === commander)
      let updated: SavedDeck[]
      if (existing >= 0) {
        updated = [...prev]
        updated[existing] = newDeck
      } else {
        updated = [newDeck, ...prev]
      }
      persistDecks(updated)
      return updated
    })

    return newDeck.id
  }, [])

  const removeDeck = useCallback((id: string) => {
    setDecks(prev => {
      const updated = prev.filter(d => d.id !== id)
      persistDecks(updated)
      return updated
    })
  }, [])

  return { decks, saveDeck, removeDeck }
}
