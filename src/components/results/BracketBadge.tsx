import { getBracketColor } from '../../utils/colors'
import { formatBracket } from '../../utils/formatters'

interface BracketBadgeProps {
  bracket: number
  size?: 'sm' | 'lg'
}

export default function BracketBadge({ bracket, size = 'lg' }: BracketBadgeProps) {
  const colors = getBracketColor(bracket)

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${colors.bg} text-white`}>
        B{bracket}
      </span>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-1 border-2 ${colors.border} rounded-xl px-8 py-4 shadow-lg ${colors.glow} shadow-xl`}>
      <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">Bracket</span>
      <span className={`text-6xl font-black ${colors.text}`}>{bracket}</span>
      <span className={`text-lg font-bold ${colors.text} uppercase tracking-wide`}>
        {formatBracket(bracket)}
      </span>
    </div>
  )
}
