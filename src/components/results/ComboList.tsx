import type { ComboAnalysis } from '../../api/types'

interface ComboListProps {
  combos: ComboAnalysis
}

export default function ComboList({ combos }: ComboListProps) {
  if (combos.detected_combos.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex items-center gap-2">
        Combos Detected
        {combos.has_cedh_combo && (
          <span className="text-[10px] bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded-full font-medium">
            cEDH
          </span>
        )}
      </h3>

      <ul className="space-y-1.5">
        {combos.detected_combos.map((combo, i) => (
          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
            <span className="text-gray-600 mt-0.5">&bull;</span>
            {typeof combo === 'string' ? combo : combo.combo_name}
          </li>
        ))}
      </ul>

      {combos.has_deterministic_win && (
        <p className="text-xs text-yellow-500/80">
          Contains deterministic win condition
        </p>
      )}
    </div>
  )
}
