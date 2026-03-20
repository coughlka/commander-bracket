export const BRACKET_COLORS: Record<number, { bg: string; text: string; border: string; glow: string }> = {
  1: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500', glow: 'shadow-green-500/30' },
  2: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500', glow: 'shadow-blue-500/30' },
  3: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500', glow: 'shadow-purple-500/30' },
  4: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500', glow: 'shadow-orange-500/30' },
  5: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', glow: 'shadow-red-500/30' },
}

export const BRACKET_HEX: Record<number, string> = {
  1: '#22c55e',
  2: '#3b82f6',
  3: '#a855f7',
  4: '#f97316',
  5: '#ef4444',
}

export function getBracketColor(bracket: number) {
  return BRACKET_COLORS[bracket] ?? BRACKET_COLORS[3]
}
