import { useState, useRef } from 'react'
import { useIngestCollection } from '../../api/hooks'
import { useCollection } from '../../hooks/useCollection'

interface CollectionInputProps {
  onCollectionLoaded: (data: { collectionId?: string; ownedCards?: string[] }) => void
}

export default function CollectionInput({ onCollectionLoaded }: CollectionInputProps) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [showInput, setShowInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ingestMutation = useIngestCollection()
  const { collectionId, ownedCards, cardCount, sourceUrl, saveCollection, clearCollection } = useCollection()

  const hasCollection = !!(collectionId || (ownedCards && ownedCards.length > 0))

  // Auto-notify parent if we have a saved collection
  useState(() => {
    if (collectionId) {
      onCollectionLoaded({ collectionId })
    } else if (ownedCards && ownedCards.length > 0) {
      onCollectionLoaded({ ownedCards })
    }
  })

  const handleUrlSubmit = () => {
    if (!url.trim()) return
    ingestMutation.mutate(url.trim(), {
      onSuccess: (data) => {
        const count = data.unique_count
        setStatus(`${count} cards loaded from your collection`)
        onCollectionLoaded({ collectionId: data.collection_id })
        saveCollection({
          collectionId: data.collection_id,
          sourceUrl: url.trim(),
          cardCount: count,
        })
        setShowInput(false)
      },
      onError: () => {
        setStatus('Failed to load collection. Check the URL and try again.')
      },
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content !== 'string') return

      const cards = content
        .split('\n')
        .map(line => {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return null
          const match = trimmed.match(/^\d+x?\s+(.+?)(?:\s+[\(\[][A-Za-z0-9]+[\)\]].*)?$/)
          if (match) return match[1].trim()
          if (trimmed.length > 1 && !trimmed.match(/^\d+$/)) return trimmed
          return null
        })
        .filter((c): c is string => c !== null)

      if (cards.length > 0) {
        setStatus(`${cards.length} cards loaded from file`)
        onCollectionLoaded({ ownedCards: cards })
        saveCollection({
          ownedCards: cards,
          cardCount: cards.length,
        })
        setShowInput(false)
      } else {
        setStatus('No cards found in file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClear = async () => {
    await clearCollection()
    onCollectionLoaded({})
    setStatus(null)
    setShowInput(false)
  }

  // Show saved collection summary
  if (hasCollection && !showInput) {
    return (
      <div className="space-y-2">
        <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          My Collection
        </label>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">
              {cardCount ? `${cardCount} cards` : 'Collection loaded'}
            </p>
            {sourceUrl && (
              <p className="text-xs text-gray-600 truncate max-w-[200px]">{sourceUrl}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInput(true)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Update
            </button>
            <button
              onClick={handleClear}
              className="text-xs text-red-500/60 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
        My Collection (optional)
      </label>

      {/* Archidekt URL */}
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Archidekt collection URL..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500"
          style={{ fontSize: '16px' }}
        />
        <button
          onClick={handleUrlSubmit}
          disabled={!url.trim() || ingestMutation.isPending}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          {ingestMutation.isPending ? '...' : 'Link'}
        </button>
      </div>

      {/* File upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.csv,.dec"
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-2 bg-gray-900 border border-gray-700 border-dashed rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
      >
        Or upload collection file (.txt, .csv)
      </button>

      {/* Status */}
      {status && (
        <p className={`text-xs ${status.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
          {status}
        </p>
      )}

      <p className="text-xs text-gray-600">
        Upload once — your collection is saved for future deck builds
      </p>
    </div>
  )
}
