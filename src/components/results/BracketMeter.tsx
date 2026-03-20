import { BRACKET_HEX } from '../../utils/colors'

interface BracketMeterProps {
  bracket: number
  speedBracket: number
  warpBracket: number
}

export default function BracketMeter({ bracket, speedBracket, warpBracket }: BracketMeterProps) {
  return (
    <div className="space-y-3 w-full">
      {/* Main bracket gauge */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(b => (
          <div
            key={b}
            className="h-2 flex-1 rounded-full transition-all duration-500"
            style={{
              backgroundColor: b <= bracket ? BRACKET_HEX[b] : '#1f2937',
              opacity: b <= bracket ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Speed / Warp axis labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Speed: <span className="text-gray-300 font-medium">B{speedBracket}</span></span>
        <span>Warp: <span className="text-gray-300 font-medium">B{warpBracket}</span></span>
      </div>
    </div>
  )
}
