import { BRACKET_HEX } from '../../utils/colors'
import { formatBracket } from '../../utils/formatters'

export interface Preferences {
  targetBracket: number
  intentModes: string[]
  maxPerCard: number | null
  totalBudget: number | null
}

interface BuildPreferencesProps {
  preferences: Preferences
  onChange: (prefs: Preferences) => void
}

const INTENT_MODES = [
  { value: 'value', label: 'Value' },
  { value: 'combo', label: 'Combo' },
  { value: 'aggro', label: 'Aggro' },
  { value: 'control', label: 'Control' },
  { value: 'midrange', label: 'Midrange' },
]

export default function BuildPreferences({ preferences, onChange }: BuildPreferencesProps) {
  const toggleIntent = (mode: string) => {
    const modes = preferences.intentModes.includes(mode)
      ? preferences.intentModes.filter(m => m !== mode)
      : [...preferences.intentModes, mode]
    onChange({ ...preferences, intentModes: modes })
  }

  return (
    <div className="space-y-4">
      {/* Target Bracket */}
      <div className="space-y-2">
        <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Target Bracket</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(b => (
            <button
              key={b}
              onClick={() => onChange({ ...preferences, targetBracket: b })}
              className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                backgroundColor: preferences.targetBracket === b ? BRACKET_HEX[b] : '#1f2937',
                color: preferences.targetBracket === b ? '#fff' : '#6b7280',
                border: `1px solid ${preferences.targetBracket === b ? BRACKET_HEX[b] : '#374151'}`,
              }}
            >
              {b}
              <div className="text-[9px] font-normal opacity-70">{formatBracket(b)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Intent Modes */}
      <div className="space-y-2">
        <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Play Style</label>
        <div className="flex flex-wrap gap-2">
          {INTENT_MODES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleIntent(value)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                preferences.intentModes.includes(value)
                  ? 'bg-purple-900/40 border-purple-600 text-purple-300'
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Max per card ($)</label>
          <input
            type="number"
            value={preferences.maxPerCard ?? ''}
            onChange={e => onChange({ ...preferences, maxPerCard: e.target.value ? Number(e.target.value) : null })}
            placeholder="No limit"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500"
            min={0}
            step={1}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Total budget ($)</label>
          <input
            type="number"
            value={preferences.totalBudget ?? ''}
            onChange={e => onChange({ ...preferences, totalBudget: e.target.value ? Number(e.target.value) : null })}
            placeholder="No limit"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500"
            min={0}
            step={5}
          />
        </div>
      </div>
    </div>
  )
}
