import { useState, useRef } from 'react'
import { useIngestCollection } from '../../api/hooks'

interface CollectionInputProps {
  onCollectionLoaded: (data: { collectionId?: string; ownedCards?: string[] }) => void
}

export default function CollectionInput({ onCollectionLoaded }: CollectionInputProps) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ingestMutation = useIngestCollection()

  const handleUrlSubmit = () => {
    if (!url.trim()) return
    ingestMutation.mutate(url.trim(), {
      onSuccess: (data) => {
        setStatus(`${data.unique_count} cards loaded from your collection`)
        onCollectionLoaded({ collectionId: data.collection_id })
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
          // Strip quantity, set codes, collector numbers
          const match = trimmed.match(/^\d+x?\s+(.+?)(?:\s+[\(\[][A-Za-z0-9]+[\)\]].*)?$/)
          if (match) return match[1].trim()
          // Plain card name
          if (trimmed.length > 1 && !trimmed.match(/^\d+$/)) return trimmed
          return null
        })
        .filter((c): c is string => c !== null)

      if (cards.length > 0) {
        setStatus(`${cards.length} cards loaded from file`)
        onCollectionLoaded({ ownedCards: cards })
      } else {
        setStatus('No cards found in file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
        Collection (optional)
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
    </div>
  )
}
