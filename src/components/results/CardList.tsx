import { useState } from 'react'
import CardTooltip from '../shared/CardTooltip'

interface CardListProps {
  title: string
  cards: string[]
  count: number
  colorClass?: string
}

export default function CardList({ title, cards, count, colorClass = 'text-gray-300' }: CardListProps) {
  const [expanded, setExpanded] = useState(false)

  if (count === 0) return null

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wide hover:text-white transition-colors"
      >
        <span>{expanded ? '\u25BC' : '\u25B6'}</span>
        <span className={colorClass}>{title} ({count})</span>
      </button>

      {expanded && (
        <div className="flex flex-wrap gap-1.5">
          {cards.map(card => (
            <CardTooltip key={card} cardName={card}>
              <span className="text-xs bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-gray-300 hover:bg-gray-700 hover:border-gray-500 cursor-pointer transition-colors">
                {card}
              </span>
            </CardTooltip>
          ))}
        </div>
      )}
    </div>
  )
}
