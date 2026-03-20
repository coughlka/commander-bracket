import { useState, type ReactNode } from 'react'

interface CardTooltipProps {
  cardName: string
  children: ReactNode
}

export default function CardTooltip({ cardName, children }: CardTooltipProps) {
  const [show, setShow] = useState(false)
  const imageUrl = `https://api.scryfall.com/cards/named?format=image&version=normal&fuzzy=${encodeURIComponent(cardName)}`

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(s => !s)}
    >
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
          <img
            src={imageUrl}
            alt={cardName}
            className="w-56 rounded-lg shadow-2xl border border-gray-700"
            loading="lazy"
          />
        </div>
      )}
    </span>
  )
}
