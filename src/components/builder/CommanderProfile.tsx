import { useCommanderProfile } from '../../api/hooks'
import { formatEngine } from '../../utils/formatters'

interface CommanderProfileProps {
  commander: string
}

const MANA_COLORS: Record<string, { label: string; bg: string }> = {
  W: { label: 'W', bg: 'bg-yellow-100 text-yellow-900' },
  U: { label: 'U', bg: 'bg-blue-400 text-blue-950' },
  B: { label: 'B', bg: 'bg-gray-700 text-gray-100' },
  R: { label: 'R', bg: 'bg-red-500 text-red-100' },
  G: { label: 'G', bg: 'bg-green-600 text-green-100' },
}

export default function CommanderProfile({ commander }: CommanderProfileProps) {
  const { data, isLoading } = useCommanderProfile(commander)

  if (isLoading) {
    return <div className="text-sm text-gray-500 py-4">Loading commander profile...</div>
  }

  if (!data) return null

  const { commander_profile: profile, card_data: card } = data

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-3">
      {/* Color identity */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Colors:</span>
        <div className="flex gap-1">
          {card.color_identity.map(c => (
            <span key={c} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${MANA_COLORS[c]?.bg ?? 'bg-gray-600'}`}>
              {MANA_COLORS[c]?.label ?? c}
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-600 ml-auto">{card.type_line}</span>
      </div>

      {/* Build axis */}
      {profile.implied_build_axis && (
        <div>
          <span className="text-xs text-gray-500">Build Axis: </span>
          <span className="text-sm text-gray-300">{profile.implied_build_axis}</span>
        </div>
      )}

      {/* Expected engines */}
      {profile.expected_engine_types.length > 0 && (
        <div>
          <span className="text-xs text-gray-500">Engines: </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.expected_engine_types.map(e => (
              <span key={e} className="text-xs bg-gray-800 border border-gray-700 rounded-md px-2 py-0.5 text-gray-400">
                {formatEngine(e)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Power level estimate */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Estimated Bracket: </span>
        <span className="text-gray-300 font-medium">{profile.power_level_estimate}</span>
      </div>

      {/* Tribal types */}
      {profile.tribal_types.length > 0 && (
        <div className="text-xs text-gray-500">
          Tribal: <span className="text-gray-400">{profile.tribal_types.join(', ')}</span>
        </div>
      )}
    </div>
  )
}
