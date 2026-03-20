import { useAnalyzeDeck } from '../api/hooks'
import DeckInput from '../components/input/DeckInput'
import LoadingState from '../components/shared/LoadingState'
import BracketBadge from '../components/results/BracketBadge'
import BracketMeter from '../components/results/BracketMeter'
import BracketReason from '../components/results/BracketReason'
import ValidationErrors from '../components/results/ValidationErrors'
import GameChangers from '../components/results/GameChangers'
import EngineBreakdown from '../components/results/EngineBreakdown'
import ComboList from '../components/results/ComboList'
import CardBreakdown from '../components/results/CardBreakdown'
import CardList from '../components/results/CardList'
import FeedbackWidget from '../components/shared/FeedbackWidget'

export default function BracketPage() {
  const mutation = useAnalyzeDeck()
  const analysis = mutation.data

  const handleAnalyze = (decklist: string) => {
    mutation.mutate({ decklist })
  }

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
        <div className="space-y-6">
          {/* Validation errors — always show first */}
          <ValidationErrors validation={analysis.validation} />

          {/* Bracket result header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <BracketBadge bracket={analysis.bracket_analysis.deck_bracket} size="lg" />
            <div className="flex-1 space-y-3 w-full">
              <BracketMeter
                bracket={analysis.bracket_analysis.deck_bracket}
                speedBracket={analysis.bracket_analysis.speed_bracket}
                warpBracket={analysis.bracket_analysis.warp_bracket}
              />
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span>Cards: {analysis.deck_stats.cards_found}/{analysis.deck_stats.total_cards}</span>
                {analysis.bracket_analysis.estimated_win_turn && (
                  <span>Est. Win Turn: ~{analysis.bracket_analysis.estimated_win_turn.toFixed(1)}</span>
                )}
                {analysis.bracket_analysis.has_turn_2_3_capability && (
                  <span className="text-red-400">Turn 2-3 capable</span>
                )}
              </div>
            </div>
          </div>

          {/* Detailed sections */}
          <div className="space-y-6 divide-y divide-gray-800">
            <BracketReason bracket={analysis.bracket_analysis} />

            <div className="pt-6">
              <EngineBreakdown ipom={analysis.ipom_analysis} />
            </div>

            {/* Game changers */}
            <div className="pt-6">
              <GameChangers
                byCategory={analysis.bracket_analysis.game_changers_by_category}
                total={analysis.bracket_analysis.total_game_changers}
              />
            </div>

            {/* Combos */}
            <div className="pt-6">
              <ComboList combos={analysis.ipom_analysis.combos} />
            </div>

            {/* Fast mana */}
            <div className="pt-6">
              <CardList
                title="Fast Mana"
                cards={analysis.bracket_analysis.fast_mana_found}
                count={analysis.bracket_analysis.fast_mana_count}
              />
            </div>

            {/* Tutors */}
            <div className="pt-6">
              <CardList
                title="Tutors"
                cards={analysis.bracket_analysis.tutors_found ?? []}
                count={analysis.bracket_analysis.tutor_count}
              />
            </div>

            {/* cEDH cards */}
            {analysis.bracket_analysis.total_cedh_cards > 0 && (
              <div className="pt-6">
                <CardList
                  title="cEDH Cards"
                  cards={analysis.bracket_analysis.cedh_cards_found}
                  count={analysis.bracket_analysis.total_cedh_cards}
                  colorClass="text-red-400"
                />
              </div>
            )}

            {/* Full card breakdown */}
            {analysis.ipom_analysis.card_classifications && (
              <div className="pt-6">
                <CardBreakdown cards={analysis.ipom_analysis.card_classifications} />
              </div>
            )}

            {/* Cards not found */}
            {analysis.deck_stats.cards_not_found.length > 0 && (
              <div className="pt-6 space-y-2">
                <h3 className="text-sm font-semibold text-yellow-500 uppercase tracking-wide">
                  Cards Not Found ({analysis.deck_stats.cards_not_found.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.deck_stats.cards_not_found.map(card => (
                    <span key={card} className="text-xs bg-yellow-900/20 border border-yellow-800/40 rounded-md px-2 py-1 text-yellow-400">
                      {card}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer stats */}
            <div className="pt-6 text-xs text-gray-600 flex flex-wrap gap-4">
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
