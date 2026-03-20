export const BRACKET_NAMES: Record<number, string> = {
  1: 'Exhibition',
  2: 'Core',
  3: 'Upgraded',
  4: 'Optimized',
  5: 'cEDH',
}

export const ENGINE_LABELS: Record<string, string> = {
  creature_type_triggers: 'Creature Triggers',
  spell_casting_loops: 'Spell Loops',
  landfall_chains: 'Landfall',
  artifact_synergies: 'Artifacts',
  graveyard_recursion: 'Graveyard Recursion',
  control_denial: 'Control/Denial',
  token_generation: 'Tokens',
  counter_manipulation: 'Counters',
  sacrifice_loops: 'Sacrifice',
  blink_flicker: 'Blink/Flicker',
  combat_damage: 'Combat',
  lifegain_payoffs: 'Lifegain',
  mill_self_mill: 'Mill',
  discard_madness: 'Discard/Madness',
  enchantment_constellation: 'Enchantments',
  voltron_equipment: 'Voltron',
  stax_tax: 'Stax/Tax',
  group_slug: 'Group Slug',
  wheels_cycling: 'Wheels',
  unknown: 'Unknown',
}

export function formatEngine(engine: string): string {
  return ENGINE_LABELS[engine] ?? engine.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function formatBracket(bracket: number): string {
  return BRACKET_NAMES[bracket] ?? `Bracket ${bracket}`
}

export function formatTurn(turn: number | null | undefined): string {
  if (turn == null) return 'N/A'
  return `~${turn.toFixed(1)}`
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}
