import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const LOCAL_KEY = 'commander-bracket-collection'

interface CollectionState {
  collectionId: string | null
  ownedCards: string[] | null
  cardCount: number | null
  sourceUrl: string | null
  loading: boolean
  saveCollection: (data: { collectionId?: string; ownedCards?: string[]; sourceUrl?: string; cardCount?: number }) => Promise<void>
  clearCollection: () => Promise<void>
}

interface StoredCollection {
  collectionId: string | null
  ownedCards: string[] | null
  cardCount: number | null
  sourceUrl: string | null
}

function loadLocal(): StoredCollection {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return { collectionId: null, ownedCards: null, cardCount: null, sourceUrl: null }
    return JSON.parse(raw)
  } catch {
    return { collectionId: null, ownedCards: null, cardCount: null, sourceUrl: null }
  }
}

function persistLocal(data: StoredCollection) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
}

export function useCollection(): CollectionState {
  const { user } = useAuth()
  const [collection, setCollection] = useState<StoredCollection>(loadLocal)
  const [loading] = useState(false)

  // Load from Supabase user metadata on login
  useEffect(() => {
    if (!user || !supabase) {
      setCollection(loadLocal())
      return
    }

    const meta = user.user_metadata
    if (meta?.collection_id || meta?.owned_cards) {
      setCollection({
        collectionId: meta.collection_id ?? null,
        ownedCards: meta.owned_cards ?? null,
        cardCount: meta.collection_card_count ?? null,
        sourceUrl: meta.collection_source_url ?? null,
      })
    }
  }, [user])

  const saveCollection = useCallback(async (data: {
    collectionId?: string
    ownedCards?: string[]
    sourceUrl?: string
    cardCount?: number
  }) => {
    const updated: StoredCollection = {
      collectionId: data.collectionId ?? collection.collectionId,
      ownedCards: data.ownedCards ?? collection.ownedCards,
      cardCount: data.cardCount ?? collection.cardCount,
      sourceUrl: data.sourceUrl ?? collection.sourceUrl,
    }

    setCollection(updated)
    persistLocal(updated)

    // Persist to Supabase user metadata if logged in
    if (user && supabase) {
      await supabase.auth.updateUser({
        data: {
          collection_id: updated.collectionId,
          owned_cards: updated.ownedCards ? updated.ownedCards.slice(0, 5000) : null, // Limit size
          collection_card_count: updated.cardCount,
          collection_source_url: updated.sourceUrl,
        },
      })
    }
  }, [user, collection])

  const clearCollection = useCallback(async () => {
    const empty: StoredCollection = { collectionId: null, ownedCards: null, cardCount: null, sourceUrl: null }
    setCollection(empty)
    localStorage.removeItem(LOCAL_KEY)

    if (user && supabase) {
      await supabase.auth.updateUser({
        data: {
          collection_id: null,
          owned_cards: null,
          collection_card_count: null,
          collection_source_url: null,
        },
      })
    }
  }, [user])

  return {
    collectionId: collection.collectionId,
    ownedCards: collection.ownedCards,
    cardCount: collection.cardCount,
    sourceUrl: collection.sourceUrl,
    loading,
    saveCollection,
    clearCollection,
  }
}
