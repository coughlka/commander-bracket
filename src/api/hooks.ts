import { useMutation, useQuery } from '@tanstack/react-query'
import { apiPost, apiGet } from './client'
import type { CompleteAnalysis } from './types'

// --- Bracket Analyzer ---

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

// --- Card Autocomplete ---

export function useCardAutocomplete(query: string) {
  return useQuery({
    queryKey: ['autocomplete', query],
    queryFn: () => apiGet<string[]>(`/cards/autocomplete?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    staleTime: 60_000,
  })
}

// --- Commander Profile ---

export interface CommanderProfile {
  commander_profile: {
    name: string
    color_identity: string[]
    primary_mechanics: string[]
    secondary_mechanics: string[]
    keywords: string[]
    cost_modifiers: unknown[]
    trigger_modifiers: unknown[]
    zone_interactions: string[]
    tribal_types: string[]
    build_axes: string[]
    primary_build_axis: string
    expected_engines: string[]
    power_level: string | number
    synergy_cards: Record<string, string[]>
  }
  card_data: {
    name: string
    mana_cost: string
    type_line: string
    oracle_text: string
    color_identity: string[]
  }
  schema_version: string
}

export function useCommanderProfile(name: string) {
  return useQuery({
    queryKey: ['commander-profile', name],
    queryFn: () => apiGet<CommanderProfile>(`/synergy/commander-profile?name=${encodeURIComponent(name)}`),
    enabled: !!name,
    staleTime: 300_000,
  })
}

// --- Collection Import ---

interface CollectionResult {
  collection_id: string
  card_count: number
  unique_count: number
  source_url: string
  source_type: string
  persistent: boolean
  status: string
}

export function useIngestCollection() {
  return useMutation({
    mutationFn: (url: string) =>
      apiPost<CollectionResult>('/collections/ingest-url', { url }),
  })
}

// --- Staple Suggestions ---

interface StaplesRequest {
  colors: string
  decklist: string
  budget?: number
  category?: string
  additional_owned?: string[]
  collection_id?: string
  engine_types?: string[]
  intent_mode?: string
  commander?: string
}

interface StapleCard {
  name: string
  price: number | null
  category: string
  reason: string
}

interface StaplesResult {
  colors: string[]
  category: string | null
  budget: number | null
  owned_cards: { count: number }
  recommended_additions: StapleCard[]
  filtering_applied: boolean
  cards_filtered_out: number
}

export function useStapleSuggestions() {
  return useMutation({
    mutationFn: (req: StaplesRequest) =>
      apiPost<StaplesResult>('/decks/staples-enforced', req),
  })
}

// --- Combo Completions ---

interface ComboCompletionsRequest {
  decklist: string
  commander?: string
}

interface ComboSuggestion {
  card: string
  completes_with: string
  combo_info: { card_1: string; card_2: string; effect: string }
  price: number
  type_line: string
}

interface ComboCompletionsResult {
  detected_combos: { card_1: string; card_2: string; effect: string }[]
  combo_pieces_present: string[]
  missing_pieces: Record<string, string[]>
  completion_suggestions: ComboSuggestion[]
  combo_density: number
  has_cedh_combo: boolean
}

export function useComboCompletions() {
  return useMutation({
    mutationFn: (req: ComboCompletionsRequest) =>
      apiPost<ComboCompletionsResult>('/decks/combo-completions', req),
  })
}

// --- Build and Analyze ---

interface BuildAndAnalyzeRequest {
  commander: string
  power_level?: number
  budget?: number
  partner?: string
}

interface DeckCard {
  name: string
  quantity: number
  role: string
  reason: string
  cmc?: number
  price_usd?: number
}

export interface BuildAndAnalyzeResult {
  summary: {
    headline: string
    key_stats: {
      power_bracket: number
      bracket_label: string
      estimated_win_turn: number
      primary_engine: string
      primary_win_condition: string
      tribal?: Record<string, unknown>
    }
    strengths: string[]
    weaknesses: string[]
    suggested_actions: string[]
    bracket_mismatch?: { requested: number; actual: number; reason: string }
  }
  deck: {
    commander: string
    color_identity: string[]
    card_count: number
    build_axis: string
    decklist: string
    cards: DeckCard[]
    build_notes: string[]
  }
  analysis: {
    validation: Record<string, unknown>
    ipom: Record<string, unknown>
    bracket: Record<string, unknown>
    win_conditions: Record<string, unknown>
    commander_synergy?: Record<string, unknown>
  }
  schema_versions: Record<string, string>
}

export function useBuildAndAnalyze() {
  return useMutation({
    mutationFn: (req: BuildAndAnalyzeRequest) =>
      apiPost<BuildAndAnalyzeResult>('/commander/build-and-analyze', req),
  })
}
