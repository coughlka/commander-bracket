import { useState } from 'react'
import { useBuildAndAnalyze, type BuildAndAnalyzeResult } from '../api/hooks'
import { useSavedDecks } from '../hooks/useSavedDecks'
import CommanderSearch from '../components/builder/CommanderSearch'
import CommanderProfile from '../components/builder/CommanderProfile'
import BuildPreferences, { type Preferences } from '../components/builder/BuildPreferences'
import BracketBadge from '../components/results/BracketBadge'
import BracketMeter from '../components/results/BracketMeter'
import CardTooltip from '../components/shared/CardTooltip'
import ErrorBoundary from '../components/shared/ErrorBoundary'
import { formatEngine, formatBracket } from '../utils/formatters'

const ROLE_COLORS: Record<string, string> = {
  commander: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  ramp: 'bg-green-900/40 text-green-300 border-green-700/50',
  draw: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  removal: 'bg-red-900/40 text-red-300 border-red-700/50',
  land: 'bg-gray-800/40 text-gray-400 border-gray-700/50',
  creature: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  combo: 'bg-orange-900/40 text-orange-300 border-orange-700/50',
  protection: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
  synergy: 'bg-pink-900/40 text-pink-300 border-pink-700/50',
  tribal: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
}

export default function BuildPage() {
  const [commander, setCommander] = useState<string | null>(null)
  const [partner, setPartner] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<Preferences>({
    targetBracket: 3,
    intentModes: ['value'],
    maxPerCard: null,
    totalBudget: null,
  })
  const [saved, setSaved] = useState(false)

  const buildMutation = useBuildAndAnalyze()
  const { saveDeck } = useSavedDecks()
  const result = buildMutation.data

  const handleCommanderSelect = (name: string, partnerName: string | null) => {
    setPartner(partnerName)
    setCommander(name || null)
    buildMutation.reset()
    setSaved(false)
  }

  const handleBuild = () => {
    if (!commander) return
    buildMutation.mutate({
      commander,
      power_level: preferences.targetBracket,
      budget: preferences.maxPerCard ?? undefined,
      partner: partner ?? undefined,
    })
  }

  const handleSave = async () => {
    if (!result) return
    // Build a CompleteAnalysis-compatible object for saving
    const analysis = {
      validation: result.analysis.validation,
      deck_stats: { total_cards: result.deck.card_count, cards_found: result.deck.card_count, cards_not_found: [] },
      ipom_analysis: result.analysis.ipom,
      bracket_analysis: result.analysis.bracket,
      win_conditions: result.analysis.win_conditions,
      schema_versions: result.schema_versions ?? {},
      commander_analysis: { name: result.deck.commander },
    }
    await saveDeck(analysis as never, result.deck.decklist)
    setSaved(true)
  }

  return (
    <ErrorBoundary>
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Deck Builder</h1>
        <p className="text-sm text-gray-500">
          Pick a commander, set your power level, get a complete deck
        </p>
      </div>

      {/* Step 1: Commander */}
      <CommanderSearch onSelect={handleCommanderSelect} selected={commander} partner={partner} />

      {/* Commander profile */}
      {commander && <CommanderProfile commander={commander} />}

      {/* Step 2: Preferences */}
      {commander && (
        <BuildPreferences preferences={preferences} onChange={setPreferences} />
      )}

      {/* Build button */}
      {commander && (
        <button
          onClick={handleBuild}
          disabled={buildMutation.isPending}
          className="w-full py-3 bg-white text-gray-950 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors text-base"
        >
          {buildMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-400 border-t-gray-950 rounded-full" />
              Building deck...
            </span>
          ) : (
            'Build My Deck'
          )}
        </button>
      )}

      {/* Error */}
      {buildMutation.isError && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-sm text-red-400">
          {buildMutation.error instanceof Error ? buildMutation.error.message : 'Build failed. Try a different commander.'}
        </div>
      )}

      {/* Results */}
      {result && <BuildResult result={result} saved={saved} onSave={handleSave} />}
    </div>
    </ErrorBoundary>
  )
}

function BuildResult({ result, saved, onSave }: { result: BuildAndAnalyzeResult; saved: boolean; onSave: () => void }) {
  const { summary, deck, analysis } = result
  const bracket = (analysis.bracket as Record<string, number>)?.deck_bracket ?? summary.key_stats.power_bracket
  const speedBracket = (analysis.bracket as Record<string, number>)?.speed_bracket ?? bracket
  const warpBracket = (analysis.bracket as Record<string, number>)?.warp_bracket ?? bracket
  const totalPrice = deck.cards.reduce((sum, c) => sum + (c.price_usd ?? 0), 0)

  // Group cards by role
  const cardsByRole: Record<string, typeof deck.cards> = {}
  for (const card of deck.cards) {
    const role = card.role || 'other'
    if (!cardsByRole[role]) cardsByRole[role] = []
    cardsByRole[role].push(card)
  }

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
        <p className="text-base font-medium text-gray-200">{summary.headline}</p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <BracketBadge bracket={bracket} size="lg" />
          <div className="flex-1 w-full space-y-2">
            <BracketMeter bracket={bracket} speedBracket={speedBracket} warpBracket={warpBracket} />
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span>{deck.card_count} cards</span>
              <span>{formatEngine(summary.key_stats.primary_engine)}</span>
              <span>Win turn ~{summary.key_stats.estimated_win_turn}</span>
              {totalPrice > 0 && <span>${totalPrice.toFixed(2)} total</span>}
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        {summary.strengths.length > 0 && (
          <div>
            <h4 className="text-xs text-green-500 uppercase tracking-wide mb-1">Strengths</h4>
            <ul className="space-y-0.5">
              {summary.strengths.map((s, i) => (
                <li key={i} className="text-xs text-gray-400">{s}</li>
              ))}
            </ul>
          </div>
        )}
        {summary.weaknesses.length > 0 && (
          <div>
            <h4 className="text-xs text-red-500 uppercase tracking-wide mb-1">Weaknesses</h4>
            <ul className="space-y-0.5">
              {summary.weaknesses.map((s, i) => (
                <li key={i} className="text-xs text-gray-400">{s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Bracket mismatch warning */}
        {summary.bracket_mismatch && (
          <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-3 text-xs text-yellow-400">
            Requested {formatBracket(summary.bracket_mismatch.requested)} but built at {formatBracket(summary.bracket_mismatch.actual)}: {summary.bracket_mismatch.reason}
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={saved}
        className={`w-full py-3 rounded-lg font-medium text-sm transition-colors ${
          saved
            ? 'bg-green-900/30 border border-green-800/50 text-green-400'
            : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
        }`}
      >
        {saved ? 'Saved to My Decks' : 'Save to My Decks'}
      </button>

      {/* Build notes */}
      {deck.build_notes && deck.build_notes.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Build Notes</h3>
          {deck.build_notes.map((note, i) => (
            <p key={i} className="text-xs text-gray-500">{note}</p>
          ))}
        </div>
      )}

      {/* Card list by role */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Decklist ({deck.card_count} cards)
        </h3>

        {Object.entries(cardsByRole)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([role, cards]) => (
          <div key={role}>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              {role} ({cards.length})
            </h4>
            <div className="space-y-0.5">
              {cards.map(card => {
                const roleStyle = ROLE_COLORS[role] ?? 'bg-gray-800/40 text-gray-400 border-gray-700/50'
                return (
                  <div key={card.name} className="bg-gray-900/30 border border-gray-800 rounded-lg px-3 py-2 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <CardTooltip cardName={card.name}>
                        <span className="text-sm text-gray-200 hover:text-white cursor-pointer font-medium">
                          {card.name}
                        </span>
                      </CardTooltip>
                      <div className="flex items-center gap-2 shrink-0">
                        {card.price_usd != null && card.price_usd > 0 && (
                          <span className="text-xs text-gray-600">${card.price_usd.toFixed(2)}</span>
                        )}
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${roleStyle}`}>
                          {role}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{card.reason}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested actions */}
      {summary.suggested_actions && summary.suggested_actions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Next Steps</h3>
          {summary.suggested_actions.map((action, i) => (
            <p key={i} className="text-xs text-gray-400">{action}</p>
          ))}
        </div>
      )}
    </div>
  )
}
