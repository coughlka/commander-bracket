import { forwardRef } from 'react'
import type { CompleteAnalysis } from '../../api/types'
import { BRACKET_HEX } from '../../utils/colors'
import { formatBracket, formatEngine, formatTurn } from '../../utils/formatters'

interface BracketCardProps {
  analysis: CompleteAnalysis
}

const BracketCard = forwardRef<HTMLDivElement, BracketCardProps>(({ analysis }, ref) => {
  const { bracket_analysis: ba, ipom_analysis: ipom } = analysis
  const bracket = ba.deck_bracket
  const color = BRACKET_HEX[bracket] ?? BRACKET_HEX[3]
  const commander = extractCommander(analysis)
  const engine = formatEngine(ipom.engine.primary_engine)
  const turn = formatTurn(ba.estimated_win_turn)

  return (
    <div
      ref={ref}
      className="w-[600px] h-[400px] rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #111827 0%, #0a0f1a 50%, ${color}11 100%)`,
        border: `1px solid ${color}44`,
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
          Commander Bracket
        </span>
        <span className="text-xs text-gray-600">commanderbracket.com</span>
      </div>

      {/* Center: bracket number + name */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="text-8xl font-black leading-none"
          style={{ color }}
        >
          {bracket}
        </div>
        <div
          className="text-2xl font-bold uppercase tracking-[0.15em]"
          style={{ color }}
        >
          {formatBracket(bracket)}
        </div>
      </div>

      {/* Bottom: details */}
      <div className="space-y-2">
        {commander && (
          <p className="text-sm text-gray-300 font-medium truncate">{commander}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Engine: <span className="text-gray-300">{engine}</span></span>
          <span>Win Turn: <span className="text-gray-300">{turn}</span></span>
        </div>
        {/* Mini gauge */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(b => (
            <div
              key={b}
              className="h-1.5 flex-1 rounded-full"
              style={{
                backgroundColor: b <= bracket ? BRACKET_HEX[b] : '#1f2937',
                opacity: b <= bracket ? 1 : 0.3,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-600">
          <span>Speed: B{ba.speed_bracket} | Warp: B{ba.warp_bracket}</span>
          <span>
            {ba.total_game_changers > 0 && `${ba.total_game_changers} Game Changers`}
            {ba.combo_analysis.detected_combos.length > 0 &&
              ` | ${ba.combo_analysis.detected_combos.length} Combos`}
          </span>
        </div>
      </div>
    </div>
  )
})

BracketCard.displayName = 'BracketCard'

function extractCommander(analysis: CompleteAnalysis): string | null {
  const ca = analysis.commander_analysis
  if (ca && typeof ca === 'object' && 'name' in ca) {
    return ca.name as string
  }
  return null
}

export default BracketCard
