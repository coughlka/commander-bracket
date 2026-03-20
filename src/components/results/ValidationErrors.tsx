import type { ValidationResult } from '../../api/types'
import CardTooltip from '../shared/CardTooltip'

interface ValidationErrorsProps {
  validation: ValidationResult
}

export default function ValidationErrors({ validation }: ValidationErrorsProps) {
  if (validation.valid && validation.warnings.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-lg overflow-hidden">
          <div className="bg-red-900/30 px-4 py-2 border-b border-red-800/40">
            <h3 className="text-sm font-semibold text-red-400">
              Deck Legality Issues ({validation.errors.length})
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {validation.errors.map((err, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 text-xs font-mono bg-red-900/30 px-1.5 py-0.5 rounded">
                    {formatErrorCode(err.code)}
                  </span>
                  <p className="text-sm text-red-300">{err.message}</p>
                </div>
                {err.cards && err.cards.length > 0 && (
                  <div className="ml-6 flex flex-wrap gap-1.5 mt-1">
                    {err.cards.map(card => (
                      <CardTooltip key={card} cardName={card}>
                        <span className="text-xs bg-red-900/40 border border-red-800/50 rounded-md px-2 py-0.5 text-red-300 hover:bg-red-900/60 cursor-pointer transition-colors">
                          {card}
                        </span>
                      </CardTooltip>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className="bg-yellow-950/30 border border-yellow-800/40 rounded-lg p-4 space-y-1">
          {validation.warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-400">{typeof w === 'string' ? w : (w as { message?: string }).message ?? JSON.stringify(w)}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function formatErrorCode(code: string): string {
  return code.replace(/_/g, ' ').toLowerCase()
}
