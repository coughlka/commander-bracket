import { useState, useCallback } from 'react'
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

  const handlePaste = useCallback(async (pasted: string) => {
    const detected = detectUrl(pasted)

    if (detected.platform === 'none') {
      // Plain text decklist — just use it
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

    // Unsupported platform — show guide
    setShowGuide(detected)
  }, [])

  const handleChange = (value: string) => {
    setText(value)
    // Check for URL on every change (handles paste)
    if (value.trim().startsWith('http')) {
      handlePaste(value)
    } else {
      setShowGuide(null)
      setUrlStatus(null)
    }
  }

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || isLoading || fetchingUrl) return
    onAnalyze(trimmed)
  }

  const lineCount = text.split('\n').filter(l => l.trim() && !l.startsWith('//')).length

  return (
    <div className="w-full space-y-3">
      <div className="relative">
        <textarea
          value={text}
          onChange={e => handleChange(e.target.value)}
          placeholder={`Paste your decklist here...\n\nSupported formats:\n  MTG Arena, Moxfield, Archidekt, Manabox, MTGO\n\nOr paste an Archidekt deck URL`}
          className="w-full min-h-[220px] bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-200 font-mono placeholder-gray-600 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 resize-y"
          style={{ fontSize: '16px' }} // Prevents iOS zoom
          disabled={fetchingUrl}
          spellCheck={false}
        />
        {lineCount > 0 && (
          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
            {lineCount} cards
          </div>
        )}
      </div>

      {urlStatus && (
        <div className={`text-sm px-3 py-2 rounded-md ${
          urlStatus.includes('loaded') ? 'bg-green-900/30 text-green-400' :
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
