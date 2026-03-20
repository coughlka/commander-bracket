import { useState, type ReactNode } from 'react'

interface CardTooltipProps {
  cardName: string
  children: ReactNode
}

export default function CardTooltip({ cardName, children }: CardTooltipProps) {
  const [show, setShow] = useState(false)
  const imageUrl = `https://api.scryfall.com/cards/named?format=image&version=normal&fuzzy=${encodeURIComponent(cardName)}`

  return (
    <span className="inline-block">
      <span
        className="cursor-pointer"
        onClick={() => setShow(s => !s)}
      >
        {children}
      </span>
      {show && (
        <div className="mt-2 mb-2 block">
          <img
            src={imageUrl}
            alt={cardName}
            className="w-64 sm:w-72 rounded-xl shadow-2xl border border-gray-700"
            loading="lazy"
          />
        </div>
      )}
    </span>
  )
}
