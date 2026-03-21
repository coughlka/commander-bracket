import CardTooltip from '../shared/CardTooltip'

export interface DeckCard {
  name: string
  price: number | null
  section: 'commander' | 'mainboard'
}

interface DeckListProps {
  cards: DeckCard[]
  onRemove: (cardName: string) => void
}

export default function DeckList({ cards, onRemove }: DeckListProps) {
  const commander = cards.filter(c => c.section === 'commander')
  const mainboard = cards.filter(c => c.section === 'mainboard')
  const totalPrice = cards.reduce((sum, c) => sum + (c.price ?? 0), 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Deck ({cards.length}/100)
        </h3>
        {totalPrice > 0 && (
          <span className="text-xs text-gray-500">${totalPrice.toFixed(2)} total</span>
        )}
      </div>

      {cards.length === 0 ? (
        <p className="text-sm text-gray-600 py-4 text-center">
          Add cards from the suggestions below
        </p>
      ) : (
        <div className="space-y-2">
          {/* Commander */}
          {commander.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">Commander</h4>
              {commander.map(card => (
                <CardRow key={card.name} card={card} onRemove={onRemove} isCommander />
              ))}
            </div>
          )}

          {/* Mainboard */}
          {mainboard.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Mainboard ({mainboard.length})
              </h4>
              <div className="space-y-0.5">
                {mainboard.map(card => (
                  <CardRow key={card.name} card={card} onRemove={onRemove} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CardRow({ card, onRemove, isCommander }: { card: DeckCard; onRemove: (name: string) => void; isCommander?: boolean }) {
  return (
    <div className="flex items-center gap-2 bg-gray-900/30 rounded px-2 py-1">
      <CardTooltip cardName={card.name}>
        <span className="text-sm text-gray-300 hover:text-white cursor-pointer flex-1">
          {card.name}
        </span>
      </CardTooltip>
      {card.price !== null && (
        <span className="text-xs text-gray-600">${card.price.toFixed(2)}</span>
      )}
      {!isCommander && (
        <button
          onClick={() => onRemove(card.name)}
          className="text-gray-600 hover:text-red-400 text-xs transition-colors"
        >
          &times;
        </button>
      )}
    </div>
  )
}
