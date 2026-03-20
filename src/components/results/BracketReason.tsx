import type { BracketAnalysis } from '../../api/types'

interface BracketReasonProps {
  bracket: BracketAnalysis
}

export default function BracketReason({ bracket }: BracketReasonProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Why Bracket {bracket.deck_bracket}?
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed">
        {bracket.bracket_reason}
      </p>

      {bracket.bracket_determined_by && (
        <p className="text-xs text-gray-500">
          Determined by: <span className="text-gray-400">{bracket.bracket_determined_by}</span>
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <StatBox label="Fast Mana" value={bracket.fast_mana_count} />
        <StatBox label="Tutors" value={bracket.tutor_count} />
        <StatBox label="Game Changers" value={bracket.total_game_changers} />
        <StatBox label="cEDH Cards" value={bracket.total_cedh_cards} />
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
      <div className="text-lg font-bold text-gray-200">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
