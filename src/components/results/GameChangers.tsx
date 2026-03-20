import { useState } from 'react'
import CardTooltip from '../shared/CardTooltip'

interface GameChangersProps {
  byCategory: Record<string, string[] | number>
  total: number
}

export default function GameChangers({ byCategory, total }: GameChangersProps) {
  const [expanded, setExpanded] = useState(total > 0)
  const categories = Object.entries(byCategory)
    .filter(([, cards]) => Array.isArray(cards) && cards.length > 0) as [string, string[]][]

  if (total === 0) return null

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
          {categories.map(([category, cards]) => (
            <div key={category}>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                {formatCategory(category)} ({cards.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {cards.map(card => (
                  <CardTooltip key={card} cardName={card}>
                    <span className="text-xs bg-yellow-900/30 border border-yellow-800/40 rounded-md px-2 py-1 text-yellow-300 hover:bg-yellow-900/50 hover:border-yellow-700/60 cursor-pointer transition-colors">
                      {card}
                    </span>
                  </CardTooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatCategory(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
