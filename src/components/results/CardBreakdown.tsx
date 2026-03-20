import { useState, useMemo } from 'react'
import type { CardClassification } from '../../api/types'
import CardTooltip from '../shared/CardTooltip'

interface CardBreakdownProps {
  cards: CardClassification[]
}

type SortKey = 'name' | 'role' | 'contribution'
type FilterRole = 'all' | string

const ROLE_COLORS: Record<string, string> = {
  engine_enabler: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  engine_multiplier: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  engine_support: 'bg-gray-800/60 text-gray-300 border-gray-600/50',
  payload: 'bg-orange-900/40 text-orange-300 border-orange-700/50',
  combo_piece: 'bg-red-900/40 text-red-300 border-red-700/50',
  utility: 'bg-gray-800/40 text-gray-400 border-gray-700/50',
}

const ROLE_LABELS: Record<string, string> = {
  engine_enabler: 'Enabler',
  engine_multiplier: 'Multiplier',
  engine_support: 'Support',
  payload: 'Payload',
  combo_piece: 'Combo',
  utility: 'Utility',
}

export default function CardBreakdown({ cards }: CardBreakdownProps) {
  const [expanded, setExpanded] = useState(false)
  const [sort, setSort] = useState<SortKey>('contribution')
  const [filter, setFilter] = useState<FilterRole>('all')

  const roles = useMemo(() => {
    const set = new Set(cards.map(c => c.primary_role))
    return Array.from(set).sort()
  }, [cards])

  const sorted = useMemo(() => {
    const filtered = filter === 'all' ? cards : cards.filter(c => c.primary_role === filter)
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.card_name.localeCompare(b.card_name)
      if (sort === 'role') return a.primary_role.localeCompare(b.primary_role)
      return b.engine_contribution - a.engine_contribution
    })
  }, [cards, sort, filter])

  if (cards.length === 0) return null

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wide hover:text-white transition-colors"
      >
        <span>{expanded ? '\u25BC' : '\u25B6'}</span>
        Full Card Breakdown ({cards.length} cards)
      </button>

      {expanded && (
        <div className="space-y-3">
          {/* Filters + sort */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${
                filter === 'all' ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              All
            </button>
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setFilter(role)}
                className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${
                  filter === role ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {ROLE_LABELS[role] ?? role}
              </button>
            ))}

            <span className="text-gray-700 mx-1">|</span>
            <span className="text-xs text-gray-500">Sort:</span>
            {(['contribution', 'name', 'role'] as SortKey[]).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${
                  sort === s ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {s === 'contribution' ? 'Impact' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Card list */}
          <div className="space-y-1">
            {sorted.map(card => (
              <CardRow key={card.card_name} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CardRow({ card }: { card: CardClassification }) {
  const roleStyle = ROLE_COLORS[card.primary_role] ?? ROLE_COLORS.utility
  const contribPct = Math.round(card.engine_contribution * 100)

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 space-y-1">
      <div className="flex items-center gap-3">
        {/* Card name with preview */}
        <CardTooltip cardName={card.card_name}>
          <span className="text-sm text-gray-200 hover:text-white cursor-pointer font-medium flex-1 min-w-0 truncate">
            {card.card_name}
          </span>
        </CardTooltip>

        {/* Role badge */}
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${roleStyle}`}>
          {ROLE_LABELS[card.primary_role] ?? card.primary_role}
        </span>

        {/* Engine contribution bar */}
        {contribPct > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 min-w-[80px]">
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min(contribPct, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 w-7 text-right">{contribPct}%</span>
          </div>
        )}
      </div>

      {/* Reasons shown inline */}
      {card.role_reasons.length > 0 && (
        <p className="text-xs text-gray-500 truncate">
          {card.role_reasons.join(' · ')}
        </p>
      )}
    </div>
  )
}
