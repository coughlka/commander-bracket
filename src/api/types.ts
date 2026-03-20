export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  card_count: number
  has_commanders: boolean
}

export interface DeckStats {
  total_cards: number
  cards_found: number
  cards_not_found: string[]
}

export interface EngineAnalysis {
  primary_engine: string
  engine_confidence: number
  secondary_engines: string[]
  engine_card_count: number
  engine_density: number
  engine_indicators: string[]
}

export interface ComboAnalysis {
  detected_combos: string[]
  has_deterministic_win: boolean
  has_cedh_combo: boolean
  highest_power_level: string
  combo_density: number
  missing_pieces: Record<string, string[]>
}

export interface TribalAnalysis {
  primary_tribe: string | null
  secondary_tribes: string[]
  tribal_density: number
  is_tribal_deck: boolean
  lords_present: string[]
  payoffs_present: string[]
}

export interface RoleSummary {
  engine_enabler: number
  engine_multiplier: number
  engine_support: number
  payload: number
  combo_piece: number
  utility: number
}

export interface IpomAnalysis {
  engine: EngineAnalysis
  combos: ComboAnalysis
  tribal: TribalAnalysis
  role_summary: RoleSummary
  cheap_enabler_count: number
  combo_piece_count: number
  total_classified: number
  ipom_version: string
}

export interface BracketAnalysis {
  deck_bracket: number
  bracket_description: string
  bracket_reason: string
  estimated_win_turn: number | null
  speed_bracket: number
  warp_bracket: number
  bracket_determined_by?: string
  engine_analysis: {
    primary_engine: string
    engine_confidence: number
    secondary_engines: string[]
  }
  combo_analysis: {
    has_cedh_combo: boolean
    detected_combos: string[]
    highest_power_level: string
  }
  game_changers_found: string[]
  total_game_changers: number
  game_changers_by_category: Record<string, string[]>
  cedh_cards_found: string[]
  total_cedh_cards: number
  requires_disclosure: boolean
  fast_mana_count: number
  fast_mana_found: string[]
  tutor_count: number
  tutor_weighted_score?: number
  tutors_found?: string[]
  has_turn_2_3_capability: boolean
  turn_breakdown?: Record<string, unknown>
  analysis_confidence?: Record<string, unknown>
  warp_analysis?: Record<string, unknown>
}

export interface WinConditions {
  primary_win_condition: string
  has_combo_win: boolean
  has_combat_win: boolean
  win_condition_cards: Record<string, string>
  commander_combos: string[]
}

export interface CompleteAnalysis {
  validation: ValidationResult
  deck_stats: DeckStats
  ipom_analysis: IpomAnalysis
  bracket_analysis: BracketAnalysis
  win_conditions: WinConditions
  schema_versions: Record<string, string>
  commander_analysis?: Record<string, unknown>
  commander_synergy?: Record<string, unknown>
}
