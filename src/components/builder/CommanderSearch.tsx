import { useState, useEffect, useRef } from 'react'
import { useCardAutocomplete } from '../../api/hooks'

interface CommanderSearchProps {
  onSelect: (name: string) => void
  selected: string | null
}

export default function CommanderSearch({ onSelect, selected }: CommanderSearchProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: suggestions } = useCardAutocomplete(debouncedQuery)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (suggestions && suggestions.length > 0 && query.length >= 2) {
      setShowDropdown(true)
    }
  }, [suggestions, query])

  const handleSelect = (name: string) => {
    setQuery(name)
    setShowDropdown(false)
    onSelect(name)
  }

  const handleClear = () => {
    setQuery('')
    setDebouncedQuery('')
    setShowDropdown(false)
    onSelect('')
    inputRef.current?.focus()
  }

  if (selected) {
    return (
      <div className="space-y-2">
        <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Commander</label>
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg p-3">
          <img
            src={`https://api.scryfall.com/cards/named?format=image&version=art_crop&fuzzy=${encodeURIComponent(selected)}`}
            alt={selected}
            className="w-12 h-12 rounded-lg object-cover"
            loading="lazy"
          />
          <span className="text-sm text-gray-200 font-medium flex-1">{selected}</span>
          <button onClick={handleClear} className="text-gray-500 hover:text-gray-300 text-sm">&times;</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 relative">
      <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Commander</label>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => suggestions && suggestions.length > 0 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="Search for a commander..."
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        style={{ fontSize: '16px' }}
      />

      {showDropdown && suggestions && suggestions.length > 0 && (
        <div className="absolute z-40 left-0 right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map(name => (
            <button
              key={name}
              onMouseDown={() => handleSelect(name)}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
