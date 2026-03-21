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

  const profile = data.commander_profile
  const card = data.card_data
  const colors = profile.color_identity ?? card?.color_identity ?? []
  const engines = profile.expected_engines ?? []
  const buildAxis = profile.primary_build_axis ?? ''
  const typeLine = card?.type_line ?? ''

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-3">
      {/* Color identity */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Colors:</span>
        <div className="flex gap-1">
          {colors.map(c => (
            <span key={c} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${MANA_COLORS[c]?.bg ?? 'bg-gray-600'}`}>
              {MANA_COLORS[c]?.label ?? c}
            </span>
          ))}
        </div>
        {typeLine && <span className="text-xs text-gray-600 ml-auto">{typeLine}</span>}
      </div>

      {/* Build axis */}
      {buildAxis && (
        <div>
          <span className="text-xs text-gray-500">Build Axis: </span>
          <span className="text-sm text-gray-300">{buildAxis}</span>
        </div>
      )}

      {/* Expected engines */}
      {engines.length > 0 && (
        <div>
          <span className="text-xs text-gray-500">Engines: </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {engines.map(e => (
              <span key={e} className="text-xs bg-gray-800 border border-gray-700 rounded-md px-2 py-0.5 text-gray-400">
                {formatEngine(e)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Build axes */}
      {profile.build_axes && profile.build_axes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.build_axes.map(axis => (
            <span key={axis} className="text-xs bg-purple-900/30 border border-purple-800/40 rounded-md px-2 py-0.5 text-purple-300">
              {axis}
            </span>
          ))}
        </div>
      )}

      {/* Tribal types */}
      {profile.tribal_types && profile.tribal_types.length > 0 && (
        <div className="text-xs text-gray-500">
          Tribal: <span className="text-gray-400">{profile.tribal_types.join(', ')}</span>
        </div>
      )}
    </div>
  )
}
