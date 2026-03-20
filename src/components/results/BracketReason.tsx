import { useState } from 'react'
import type { BracketAnalysis } from '../../api/types'
import { formatEngine, formatBracket } from '../../utils/formatters'
import CardTooltip from '../shared/CardTooltip'

interface BracketReasonProps {
  bracket: BracketAnalysis
}

export default function BracketReason({ bracket }: BracketReasonProps) {
  const [activeCards, setActiveCards] = useState<{ label: string; cards: string[] } | null>(null)

  const statBoxes: { label: string; value: number; cards: string[] }[] = [
    { label: 'Fast Mana', value: bracket.fast_mana_count, cards: bracket.fast_mana_found },
    { label: 'Tutors', value: bracket.tutor_count, cards: bracket.tutors_found ?? [] },
    { label: 'Game Changers', value: bracket.total_game_changers, cards: bracket.game_changers_found },
    { label: 'cEDH Cards', value: bracket.total_cedh_cards, cards: bracket.cedh_cards_found },
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Why {formatBracket(bracket.deck_bracket)}?
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed">
        {formatReason(bracket)}
      </p>

      {/* Clickable stat boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {statBoxes.map(box => (
          <button
            key={box.label}
            onClick={() => {
              if (box.cards.length === 0) return
              setActiveCards(activeCards?.label === box.label ? null : { label: box.label, cards: box.cards })
            }}
            className={`bg-gray-800/50 rounded-lg p-3 text-center transition-colors ${
              box.cards.length > 0
                ? 'hover:bg-gray-700/50 cursor-pointer border border-transparent hover:border-gray-600'
                : 'cursor-default'
            } ${activeCards?.label === box.label ? 'bg-gray-700/50 border border-gray-600' : 'border border-transparent'}`}
          >
            <div className="text-lg font-bold text-gray-200">{box.value}</div>
            <div className="text-xs text-gray-500">{box.label}</div>
            {box.cards.length > 0 && (
              <div className="text-[10px] text-gray-600 mt-0.5">click to view</div>
            )}
          </button>
        ))}
      </div>

      {/* Expanded card list */}
      {activeCards && activeCards.cards.length > 0 && (
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {activeCards.label} ({activeCards.cards.length})
            </h4>
            <button
              onClick={() => setActiveCards(null)}
              className="text-gray-500 hover:text-gray-300 text-sm"
            >
              &times;
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeCards.cards.map(card => (
              <CardTooltip key={card} cardName={card}>
                <span className="text-xs bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-gray-300 hover:bg-gray-700 hover:border-gray-500 cursor-pointer transition-colors">
                  {card}
                </span>
              </CardTooltip>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatReason(bracket: BracketAnalysis): string {
  const engine = formatEngine(bracket.engine_analysis.primary_engine)
  const turn = bracket.estimated_win_turn
  const axis = bracket.bracket_determined_by
  const bracketName = formatBracket(bracket.deck_bracket)

  const parts: string[] = []

  if (turn) {
    parts.push(`This deck has an estimated win around turn ${turn.toFixed(1)} using a ${engine} strategy.`)
  } else {
    parts.push(`This deck runs a ${engine} strategy.`)
  }

  if (axis === 'speed') {
    parts.push(`The bracket is primarily determined by how quickly the deck can threaten a win.`)
  } else if (axis === 'warp') {
    parts.push(`The bracket is primarily determined by how much the deck warps the game around itself.`)
  }

  if (bracket.fast_mana_count > 0) {
    parts.push(`It includes ${bracket.fast_mana_count} fast mana source${bracket.fast_mana_count > 1 ? 's' : ''}.`)
  }

  if (bracket.total_game_changers > 0) {
    parts.push(`${bracket.total_game_changers} game changer${bracket.total_game_changers > 1 ? 's' : ''} push${bracket.total_game_changers === 1 ? 'es' : ''} the power level up.`)
  }

  if (bracket.combo_analysis.has_cedh_combo) {
    parts.push(`Contains competitive-level combos.`)
  } else if (bracket.combo_analysis.detected_combos.length > 0) {
    parts.push(`${bracket.combo_analysis.detected_combos.length} combo${bracket.combo_analysis.detected_combos.length > 1 ? 's' : ''} detected.`)
  }

  if (bracket.deck_bracket <= 2 && bracket.total_game_changers === 0 && bracket.tutor_count === 0) {
    parts.push(`With no game changers or tutors, this deck fits comfortably in ${bracketName}.`)
  }

  return parts.join(' ')
}
