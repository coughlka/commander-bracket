import { useState, useCallback, useEffect } from 'react'
import type { CompleteAnalysis } from '../api/types'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface SavedDeck {
  id: string
  commander: string | null
  bracket: number
  engine: string
  cardCount: number
  decklist?: string
  savedAt: string // ISO date
  analysis: CompleteAnalysis
}

const STORAGE_KEY = 'commander-bracket-saved-decks'
const MIGRATION_KEY = 'commander-bracket-migrated'

// --- localStorage helpers ---

function loadLocalDecks(): SavedDeck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedDeck[]
  } catch {
    return []
  }
}

function persistLocalDecks(decks: SavedDeck[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
}

// --- Supabase helpers ---

interface DbRow {
  id: string
  commander: string | null
  bracket: number
  engine: string
  card_count: number
  decklist: string | null
  analysis: CompleteAnalysis
  created_at: string
  updated_at: string
}

function rowToDeck(row: DbRow): SavedDeck {
  return {
    id: row.id,
    commander: row.commander,
    bracket: row.bracket,
    engine: row.engine,
    cardCount: row.card_count,
    decklist: row.decklist ?? undefined,
    savedAt: row.created_at,
    analysis: row.analysis,
  }
}

// --- Shared ---

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

// --- Hook ---

export function useSavedDecks(decklist?: string) {
  const { user } = useAuth()
  const isCloud = !!user && !!supabase
  const [decks, setDecks] = useState<SavedDeck[]>(isCloud ? [] : loadLocalDecks)
  const [loading, setLoading] = useState(isCloud)
  const [migrationNeeded, setMigrationNeeded] = useState(false)

  // Load cloud decks when user logs in
  useEffect(() => {
    if (!isCloud || !supabase) {
      setDecks(loadLocalDecks())
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('saved_decks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load cloud decks:', error)
          setDecks(loadLocalDecks()) // fallback
        } else {
          setDecks((data as DbRow[]).map(rowToDeck))
        }
        setLoading(false)
      })

    // Check if there are local decks to migrate
    const alreadyMigrated = localStorage.getItem(MIGRATION_KEY)
    const localDecks = loadLocalDecks()
    if (!alreadyMigrated && localDecks.length > 0) {
      setMigrationNeeded(true)
    }
  }, [isCloud])

  const saveDeck = useCallback(async (analysis: CompleteAnalysis, decklistText?: string) => {
    const commander = extractCommander(analysis)
    const usedDecklist = decklistText ?? decklist

    if (isCloud && supabase) {
      // Cloud save
      // Check if same commander already exists — update instead of insert
      const { data: existing } = await supabase
        .from('saved_decks')
        .select('id')
        .eq('user_id', user!.id)
        .eq('commander', commander ?? '')
        .limit(1)

      if (existing && existing.length > 0) {
        // Update existing
        const { error } = await supabase
          .from('saved_decks')
          .update({
            bracket: analysis.bracket_analysis.deck_bracket,
            engine: analysis.ipom_analysis.engine.primary_engine,
            card_count: analysis.deck_stats.total_cards,
            decklist: usedDecklist ?? null,
            analysis: analysis as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing[0].id)

        if (error) {
          console.error('Failed to update deck:', error)
          return existing[0].id
        }

        // Refresh list
        const { data } = await supabase
          .from('saved_decks')
          .select('*')
          .order('created_at', { ascending: false })
        if (data) setDecks((data as DbRow[]).map(rowToDeck))

        return existing[0].id as string
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('saved_decks')
          .insert({
            user_id: user!.id,
            commander,
            bracket: analysis.bracket_analysis.deck_bracket,
            engine: analysis.ipom_analysis.engine.primary_engine,
            card_count: analysis.deck_stats.total_cards,
            decklist: usedDecklist ?? null,
            analysis: analysis as unknown as Record<string, unknown>,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to save deck:', error)
          return ''
        }

        setDecks(prev => [rowToDeck(data as DbRow), ...prev])
        return (data as DbRow).id
      }
    } else {
      // Local save
      const newDeck: SavedDeck = {
        id: generateId(),
        commander,
        bracket: analysis.bracket_analysis.deck_bracket,
        engine: analysis.ipom_analysis.engine.primary_engine,
        cardCount: analysis.deck_stats.total_cards,
        decklist: usedDecklist,
        savedAt: new Date().toISOString(),
        analysis,
      }

      setDecks(prev => {
        const existing = prev.findIndex(d => d.commander && d.commander === commander)
        let updated: SavedDeck[]
        if (existing >= 0) {
          updated = [...prev]
          updated[existing] = newDeck
        } else {
          updated = [newDeck, ...prev]
        }
        persistLocalDecks(updated)
        return updated
      })

      return newDeck.id
    }
  }, [isCloud, user, decklist])

  const removeDeck = useCallback(async (id: string) => {
    if (isCloud && supabase) {
      const { error } = await supabase
        .from('saved_decks')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Failed to delete deck:', error)
        return
      }

      setDecks(prev => prev.filter(d => d.id !== id))
    } else {
      setDecks(prev => {
        const updated = prev.filter(d => d.id !== id)
        persistLocalDecks(updated)
        return updated
      })
    }
  }, [isCloud])

  const migrateLocalDecks = useCallback(async () => {
    if (!isCloud || !supabase || !user) return

    const localDecks = loadLocalDecks()
    if (localDecks.length === 0) return

    // Insert all local decks into Supabase
    const rows = localDecks.map(d => ({
      user_id: user.id,
      commander: d.commander,
      bracket: d.bracket,
      engine: d.engine,
      card_count: d.cardCount,
      decklist: d.decklist ?? null,
      analysis: d.analysis as unknown as Record<string, unknown>,
    }))

    const { error } = await supabase.from('saved_decks').insert(rows)

    if (!error) {
      // Clear local storage and mark as migrated
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(MIGRATION_KEY, 'true')
      setMigrationNeeded(false)

      // Reload cloud decks
      const { data } = await supabase
        .from('saved_decks')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setDecks((data as DbRow[]).map(rowToDeck))
    } else {
      console.error('Migration failed:', error)
    }
  }, [isCloud, user])

  const dismissMigration = useCallback(() => {
    localStorage.setItem(MIGRATION_KEY, 'true')
    setMigrationNeeded(false)
  }, [])

  return {
    decks,
    loading,
    saveDeck,
    removeDeck,
    isCloud,
    migrationNeeded,
    migrateLocalDecks,
    dismissMigration,
  }
}
