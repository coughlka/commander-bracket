import { useRef } from 'react'
import { useAnalyzeDeck } from '../api/hooks'
import DeckInput from '../components/input/DeckInput'
import LoadingState from '../components/shared/LoadingState'
import BracketCard from '../components/results/BracketCard'
import BracketBadge from '../components/results/BracketBadge'
import BracketMeter from '../components/results/BracketMeter'
import BracketReason from '../components/results/BracketReason'
import GameChangers from '../components/results/GameChangers'
import EngineBreakdown from '../components/results/EngineBreakdown'
import ComboList from '../components/results/ComboList'
import ShareButton from '../components/results/ShareButton'
import FeedbackWidget from '../components/shared/FeedbackWidget'

export default function BracketPage() {
  const mutation = useAnalyzeDeck()
  const cardRef = useRef<HTMLDivElement>(null)
  const analysis = mutation.data

  const handleAnalyze = (decklist: string) => {
    mutation.mutate({ decklist })
  }

  const commander = analysis?.commander_analysis &&
    typeof analysis.commander_analysis === 'object' &&
    'name' in analysis.commander_analysis
    ? (analysis.commander_analysis.name as string)
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Bracket Analyzer
        </h1>
        <p className="text-sm text-gray-500">
          Paste your Commander decklist or an Archidekt URL
        </p>
      </div>

      {/* Input */}
      <DeckInput onAnalyze={handleAnalyze} isLoading={mutation.isPending} />

      {/* Error */}
      {mutation.isError && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-sm text-red-400">
          {mutation.error instanceof Error ? mutation.error.message : 'Analysis failed. Please check your decklist and try again.'}
        </div>
      )}

      {/* Loading */}
      {mutation.isPending && <LoadingState />}

      {/* Results */}
      {analysis && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Validation warnings */}
          {analysis.validation.warnings.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3 space-y-1">
              {analysis.validation.warnings.map((w, i) => (
                <p key={i} className="text-xs text-yellow-500">{w}</p>
              ))}
            </div>
          )}

          {/* Shareable card — centered with horizontal scroll on mobile */}
          <div className="flex justify-center overflow-x-auto py-4">
            <BracketCard ref={cardRef} analysis={analysis} />
          </div>

          {/* Share buttons */}
          <div className="flex justify-center">
            <ShareButton
              cardRef={cardRef}
              bracket={analysis.bracket_analysis.deck_bracket}
              commander={commander}
            />
          </div>

          {/* Mobile-friendly bracket badge for small screens */}
          <div className="flex justify-center sm:hidden">
            <BracketBadge bracket={analysis.bracket_analysis.deck_bracket} size="lg" />
          </div>

          {/* Bracket meter */}
          <BracketMeter
            bracket={analysis.bracket_analysis.deck_bracket}
            speedBracket={analysis.bracket_analysis.speed_bracket}
            warpBracket={analysis.bracket_analysis.warp_bracket}
          />

          {/* Detailed sections */}
          <div className="space-y-6 divide-y divide-gray-800">
            <BracketReason bracket={analysis.bracket_analysis} />

            <div className="pt-6">
              <EngineBreakdown ipom={analysis.ipom_analysis} />
            </div>

            <div className="pt-6">
              <GameChangers
                byCategory={analysis.bracket_analysis.game_changers_by_category}
                total={analysis.bracket_analysis.total_game_changers}
              />
            </div>

            <div className="pt-6">
              <ComboList combos={analysis.ipom_analysis.combos} />
            </div>

            {/* Fast mana details */}
            {analysis.bracket_analysis.fast_mana_found.length > 0 && (
              <div className="pt-6 space-y-2">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  Fast Mana ({analysis.bracket_analysis.fast_mana_count})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.bracket_analysis.fast_mana_found.map(card => (
                    <span key={card} className="text-xs bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-gray-400">
                      {card}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Deck stats */}
            <div className="pt-6 text-xs text-gray-600 flex flex-wrap gap-4">
              <span>Cards found: {analysis.deck_stats.cards_found}/{analysis.deck_stats.total_cards}</span>
              <span>IPOM v{analysis.ipom_analysis.ipom_version}</span>
              <span>Brackets v{analysis.schema_versions.brackets}</span>
            </div>
          </div>

          <FeedbackWidget />
        </div>
      )}
    </div>
  )
}
