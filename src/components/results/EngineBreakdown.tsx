import type { IpomAnalysis } from '../../api/types'
import { formatEngine, formatConfidence } from '../../utils/formatters'

interface EngineBreakdownProps {
  ipom: IpomAnalysis
}

export default function EngineBreakdown({ ipom }: EngineBreakdownProps) {
  const { engine, role_summary } = ipom
  const roles = [
    { label: 'Enablers', value: role_summary.engine_enabler, color: 'bg-blue-500' },
    { label: 'Multipliers', value: role_summary.engine_multiplier, color: 'bg-purple-500' },
    { label: 'Support', value: role_summary.engine_support, color: 'bg-gray-500' },
    { label: 'Payloads', value: role_summary.payload, color: 'bg-orange-500' },
    { label: 'Combo', value: role_summary.combo_piece, color: 'bg-red-500' },
    { label: 'Utility', value: role_summary.utility, color: 'bg-gray-600' },
  ].filter(r => r.value > 0)

  const total = roles.reduce((sum, r) => sum + r.value, 0)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Engine Analysis
      </h3>

      <div className="flex items-center gap-3">
        <span className="text-base font-medium text-gray-200">
          {formatEngine(engine.primary_engine)}
        </span>
        <span className="text-xs text-gray-500">
          {formatConfidence(engine.engine_confidence)} confidence
        </span>
      </div>

      {engine.secondary_engines.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {engine.secondary_engines.map(e => (
            <span key={e} className="text-xs bg-gray-800 rounded-md px-2 py-0.5 text-gray-400">
              {formatEngine(e)}
            </span>
          ))}
        </div>
      )}

      {/* Role bar chart */}
      {total > 0 && (
        <div className="space-y-2">
          <div className="flex h-3 rounded-full overflow-hidden">
            {roles.map(r => (
              <div
                key={r.label}
                className={`${r.color} transition-all`}
                style={{ width: `${(r.value / total) * 100}%` }}
                title={`${r.label}: ${r.value}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {roles.map(r => (
              <div key={r.label} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className={`w-2 h-2 rounded-full ${r.color}`} />
                {r.label}: {r.value}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Engine density: {Math.round(engine.engine_density * 100)}% of cards contribute to engine
      </div>
    </div>
  )
}
