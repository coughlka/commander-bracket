import { useState, useRef, useEffect, type ReactNode } from 'react'

interface CardTooltipProps {
  cardName: string
  children: ReactNode
}

export default function CardTooltip({ cardName, children }: CardTooltipProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState<'above' | 'below'>('above')
  const triggerRef = useRef<HTMLSpanElement>(null)
  const imageUrl = `https://api.scryfall.com/cards/named?format=image&version=normal&fuzzy=${encodeURIComponent(cardName)}`

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      // If not enough room above, show below
      setPosition(rect.top < 320 ? 'below' : 'above')
    }
  }, [show])

  return (
    <span
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(s => !s)}
    >
      {children}
      {show && (
        <div
          className={`absolute z-50 left-1/2 -translate-x-1/2 pointer-events-none ${
            position === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
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
