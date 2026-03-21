import { useState } from 'react'
import { useAdjustBracket, type AdjustBracketResult } from '../../api/hooks'
import { BRACKET_HEX } from '../../utils/colors'
import { formatBracket } from '../../utils/formatters'
import CardTooltip from '../shared/CardTooltip'

interface BracketAdjustProps {
  decklist: string
  currentBracket: number
  commander?: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  fast_mana: 'Fast Mana',
  tutor: 'Tutor',
  game_changer: 'Game Changer',
  combo: 'Combo',
  threat: 'Threat',
  removal: 'Removal',
  other: 'Other',
}

export default function BracketAdjust({ decklist, currentBracket, commander }: BracketAdjustProps) {
  const [showAdjust, setShowAdjust] = useState(false)
  const [targetBracket, setTargetBracket] = useState<number | null>(null)
  const [acceptedSwaps, setAcceptedSwaps] = useState<Set<number>>(new Set())
  const [rejectedSwaps, setRejectedSwaps] = useState<Set<number>>(new Set())

  const adjustMutation = useAdjustBracket()

  const handleAdjust = (target: number) => {
    setTargetBracket(target)
    setAcceptedSwaps(new Set())
    setRejectedSwaps(new Set())
    adjustMutation.mutate({
      decklist,
      target_bracket: target,
      commander: commander ?? undefined,
    })
  }

  if (!showAdjust) {
    return (
      <button
        onClick={() => setShowAdjust(true)}
        className="w-full py-2 border border-gray-700 text-gray-400 rounded-lg hover:text-white hover:border-gray-500 transition-colors text-sm"
      >
        Adjust Power Level
      </button>
    )
  }

  return (
    <div className="space-y-4 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Adjust Power Level
        </h3>
        <button
          onClick={() => { setShowAdjust(false); adjustMutation.reset() }}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          &times;
        </button>
      </div>

      {/* Target bracket selector */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">Current: {formatBracket(currentBracket)}. Select target:</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(b => (
            <button
              key={b}
              onClick={() => handleAdjust(b)}
              disabled={b === currentBracket || adjustMutation.isPending}
              className="flex-1 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-20"
              style={{
                backgroundColor: targetBracket === b ? BRACKET_HEX[b] : '#1f2937',
                color: targetBracket === b ? '#fff' : '#6b7280',
                border: `1px solid ${targetBracket === b ? BRACKET_HEX[b] : b === currentBracket ? BRACKET_HEX[b] + '66' : '#374151'}`,
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {adjustMutation.isPending && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-600 border-t-purple-500 rounded-full" />
          Analyzing swaps...
        </div>
      )}

      {/* Error */}
      {adjustMutation.isError && (
        <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3">
          {adjustMutation.error instanceof Error ? adjustMutation.error.message : 'Failed to generate swap suggestions.'}
        </div>
      )}

      {/* Results */}
      {adjustMutation.data && <SwapResults result={adjustMutation.data} accepted={acceptedSwaps} rejected={rejectedSwaps} onAccept={i => setAcceptedSwaps(prev => new Set(prev).add(i))} onReject={i => setRejectedSwaps(prev => new Set(prev).add(i))} />}
    </div>
  )
}

function SwapResults({ result, accepted, rejected, onAccept, onReject }: {
  result: AdjustBracketResult
  accepted: Set<number>
  rejected: Set<number>
  onAccept: (i: number) => void
  onReject: (i: number) => void
}) {
  if (result.swaps.length === 0) {
    return <p className="text-sm text-gray-400">{result.explanation}</p>
  }

  const acceptedCount = accepted.size
  const totalSwaps = result.swaps.length

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400">{result.explanation}</p>

      <div className="text-xs text-gray-500">
        {acceptedCount}/{totalSwaps} swaps accepted
        {' '}| Estimated result: {formatBracket(result.estimated_new_bracket)}
      </div>

      <div className="space-y-2">
        {result.swaps.map((swap, i) => {
          const isAccepted = accepted.has(i)
          const isRejected = rejected.has(i)
          const isDecided = isAccepted || isRejected

          return (
            <div
              key={i}
              className={`border rounded-lg p-3 space-y-2 transition-colors ${
                isAccepted ? 'bg-green-900/10 border-green-800/40' :
                isRejected ? 'bg-gray-900/30 border-gray-800 opacity-50' :
                'bg-gray-900/30 border-gray-800'
              }`}
            >
              {/* Swap header */}
              <div className="flex items-start gap-2">
                <span className="text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded mt-0.5">
                  {CATEGORY_LABELS[swap.category] ?? swap.category}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTooltip cardName={swap.remove}>
                      <span className="text-sm text-red-400 line-through cursor-pointer">{swap.remove}</span>
                    </CardTooltip>
                    <span className="text-gray-600">&rarr;</span>
                    <CardTooltip cardName={swap.add}>
                      <span className="text-sm text-green-400 cursor-pointer">{swap.add}</span>
                    </CardTooltip>
                  </div>
                </div>
              </div>

              {/* Reasons */}
              <div className="text-xs text-gray-500 space-y-0.5 pl-2 border-l border-gray-800">
                <p><span className="text-red-400/70">Out:</span> {swap.remove_reason}</p>
                <p><span className="text-green-400/70">In:</span> {swap.add_reason}</p>
              </div>

              {/* Accept/Reject buttons */}
              {!isDecided && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onAccept(i)}
                    className="px-3 py-1 bg-green-900/30 border border-green-800/50 text-green-400 rounded text-xs hover:bg-green-900/50 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(i)}
                    className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-400 rounded text-xs hover:bg-gray-700 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              )}

              {isAccepted && <span className="text-xs text-green-500">Accepted</span>}
              {isRejected && <span className="text-xs text-gray-600">Skipped</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
