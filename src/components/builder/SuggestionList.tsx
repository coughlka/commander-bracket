import CardTooltip from '../shared/CardTooltip'

interface Suggestion {
  name: string
  price: number | null
  category?: string
  reason: string
}

interface SuggestionListProps {
  title: string
  suggestions: Suggestion[]
  loading: boolean
  onAdd: (cardName: string) => void
  totalBudget: number | null
  currentSpend: number
}

export default function SuggestionList({ title, suggestions, loading, onAdd, totalBudget, currentSpend }: SuggestionListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">{title}</h3>
        <p className="text-sm text-gray-500 animate-pulse">Loading suggestions...</p>
      </div>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        {title} ({suggestions.length})
      </h3>
      <div className="space-y-1">
        {suggestions.map(card => {
          const overBudget = totalBudget !== null && card.price !== null && (currentSpend + card.price) > totalBudget

          return (
            <div key={card.name} className="flex items-start gap-2 bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CardTooltip cardName={card.name}>
                    <span className="text-sm text-gray-200 hover:text-white cursor-pointer font-medium">
                      {card.name}
                    </span>
                  </CardTooltip>
                  {card.price !== null && (
                    <span className={`text-xs ${overBudget ? 'text-red-400' : 'text-gray-500'}`}>
                      ${card.price.toFixed(2)}
                    </span>
                  )}
                  {card.category && (
                    <span className="text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">
                      {card.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{card.reason}</p>
              </div>
              <button
                onClick={() => onAdd(card.name)}
                disabled={overBudget}
                className="shrink-0 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-xs text-gray-300 transition-colors disabled:opacity-30"
              >
                + Add
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
