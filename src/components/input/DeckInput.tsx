import { useState, useCallback, useRef } from 'react'
import { detectUrl } from '../../utils/urlDetector'
import { fetchDeckFromUrl } from '../../api/client'
import PlatformGuide from './PlatformGuide'

interface DeckInputProps {
  onAnalyze: (decklist: string) => void
  isLoading: boolean
}

export default function DeckInput({ onAnalyze, isLoading }: DeckInputProps) {
  const [text, setText] = useState('')
  const [fetchingUrl, setFetchingUrl] = useState(false)
  const [urlStatus, setUrlStatus] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState<ReturnType<typeof detectUrl> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePaste = useCallback(async (pasted: string) => {
    const detected = detectUrl(pasted)

    if (detected.platform === 'none') {
      return
    }

    if (detected.platform === 'archidekt') {
      setFetchingUrl(true)
      setUrlStatus('Fetching deck from Archidekt...')
      try {
        const decklist = await fetchDeckFromUrl(detected.url)
        setText(decklist)
        setUrlStatus('Deck loaded from Archidekt!')
        setTimeout(() => setUrlStatus(null), 3000)
      } catch {
        setUrlStatus('Failed to fetch from Archidekt. Try pasting the decklist text instead.')
      } finally {
        setFetchingUrl(false)
      }
      return
    }

    setShowGuide(detected)
  }, [])

  const handleChange = (value: string) => {
    setText(value)
    if (value.trim().startsWith('http')) {
      handlePaste(value)
    } else {
      setShowGuide(null)
      setUrlStatus(null)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        setText(content)
        setShowGuide(null)
        setUrlStatus(`Loaded ${file.name}`)
        setTimeout(() => setUrlStatus(null), 3000)
      }
    }
    reader.readAsText(file)

    // Reset so the same file can be re-uploaded
    e.target.value = ''
  }

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || isLoading || fetchingUrl) return
    onAnalyze(trimmed)
  }

  const cardCount = (() => {
    let count = 0
    let inExcluded = false
    for (const line of text.split('\n')) {
      const trimmed = line.trim().toLowerCase()
      if (!trimmed) continue
      // Track sections to skip
      if (trimmed.startsWith('//')) {
        inExcluded = trimmed.includes('sideboard') || trimmed.includes('maybeboard') || trimmed.includes('maybe')
        continue
      }
      if (['sideboard', 'sideboard:', 'maybeboard', 'maybeboard:'].includes(trimmed)) {
        inExcluded = true
        continue
      }
      if (['commander', 'commander:', 'mainboard', 'mainboard:', 'deck', 'deck:'].includes(trimmed)) {
        inExcluded = false
        continue
      }
      if (inExcluded) continue
      // Parse quantity
      const qtyMatch = line.trim().match(/^(\d+)x?\s/)
      count += qtyMatch ? parseInt(qtyMatch[1], 10) : 1
    }
    return count
  })()

  return (
    <div className="w-full space-y-3">
      <div className="relative">
        <textarea
          value={text}
          onChange={e => handleChange(e.target.value)}
          placeholder={`Paste your decklist or upload a file\n\nSupported formats:\n  MTG Arena, Moxfield, Archidekt, Manabox, MTGO\n\nOr paste an Archidekt deck URL`}
          className="w-full min-h-[180px] bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-200 font-mono placeholder-gray-600 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 resize-y"
          style={{ fontSize: '16px' }}
          disabled={fetchingUrl}
          spellCheck={false}
        />
        {cardCount > 0 && (
          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
            {cardCount} cards
          </div>
        )}
      </div>

      {/* File upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.csv,.dec,.dek,.mwDeck,.cod"
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={fetchingUrl}
        className="w-full py-2.5 bg-gray-900 border border-gray-700 border-dashed rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
      >
        Upload Deck File (.txt, .csv, .dec)
      </button>

      {urlStatus && (
        <div className={`text-sm px-3 py-2 rounded-md ${
          urlStatus.includes('loaded') || urlStatus.includes('Loaded') ? 'bg-green-900/30 text-green-400' :
          urlStatus.includes('Failed') ? 'bg-red-900/30 text-red-400' :
          'bg-blue-900/30 text-blue-400'
        }`}>
          {urlStatus}
        </div>
      )}

      {showGuide && (
        <PlatformGuide
          detected={showGuide}
          onDismiss={() => { setShowGuide(null); setText('') }}
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={!text.trim() || isLoading || fetchingUrl}
        className="w-full py-3 px-6 bg-white text-gray-950 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-base"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-400 border-t-gray-950 rounded-full" />
            Analyzing...
          </span>
        ) : (
          'Analyze Bracket'
        )}
      </button>
    </div>
  )
}
