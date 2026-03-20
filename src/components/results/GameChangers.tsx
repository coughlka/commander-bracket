import { useState } from 'react'
import CardTooltip from '../shared/CardTooltip'

interface GameChangersProps {
  byCategory: Record<string, string[] | number>
  found: string[]
  total: number
}

export default function GameChangers({ byCategory, found, total }: GameChangersProps) {
  const [expanded, setExpanded] = useState(true)

  if (total === 0) return null

  // Try to use categorized data if available (arrays), otherwise fall back to flat list
  const categories = Object.entries(byCategory)
    .filter(([, cards]) => Array.isArray(cards) && cards.length > 0) as [string, string[]][]

  const hasCategoryCards = categories.length > 0

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wide hover:text-white transition-colors"
      >
        <span>{expanded ? '\u25BC' : '\u25B6'}</span>
        Game Changers ({total})
      </button>

      {expanded && (
        <div className="space-y-4">
          {hasCategoryCards ? (
            categories.map(([category, cards]) => (
              <div key={category}>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  {formatCategory(category)} ({cards.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {cards.map(card => (
                    <CardChip key={card} name={card} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {found.map(card => (
                <CardChip key={card} name={card} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CardChip({ name }: { name: string }) {
  return (
    <CardTooltip cardName={name}>
      <span className="text-xs bg-yellow-900/30 border border-yellow-800/40 rounded-md px-2 py-1 text-yellow-300 hover:bg-yellow-900/50 hover:border-yellow-700/60 cursor-pointer transition-colors">
        {name}
      </span>
    </CardTooltip>
  )
}

function formatCategory(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
