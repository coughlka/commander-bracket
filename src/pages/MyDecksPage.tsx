import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSavedDecks, type SavedDeck } from '../hooks/useSavedDecks'
import { BRACKET_HEX } from '../utils/colors'
import { formatBracket, formatEngine } from '../utils/formatters'
import BracketBadge from '../components/results/BracketBadge'
import BracketMeter from '../components/results/BracketMeter'
import BracketReason from '../components/results/BracketReason'
import EngineBreakdown from '../components/results/EngineBreakdown'
import GameChangers from '../components/results/GameChangers'
import ComboList from '../components/results/ComboList'
import CardBreakdown from '../components/results/CardBreakdown'
import CardList from '../components/results/CardList'
import ValidationErrors from '../components/results/ValidationErrors'

export default function MyDecksPage() {
  const { decks, removeDeck } = useSavedDecks()
  const [viewingDeck, setViewingDeck] = useState<SavedDeck | null>(null)

  if (viewingDeck) {
    return <DeckDetail deck={viewingDeck} onBack={() => setViewingDeck(null)} onRemove={removeDeck} />
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">My Decks</h1>
        <p className="text-sm text-gray-500">
          Saved bracket analyses — tap to show at your LGS
        </p>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-gray-500">No saved decks yet</p>
          <Link
            to="/bracket"
            className="inline-block px-6 py-3 bg-white text-gray-950 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Analyze a Deck
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {decks.map(deck => (
            <button
              key={deck.id}
              onClick={() => setViewingDeck(deck)}
              className="w-full text-left bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:bg-gray-800/50 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Bracket badge */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black shrink-0"
                  style={{
                    backgroundColor: `${BRACKET_HEX[deck.bracket]}15`,
                    color: BRACKET_HEX[deck.bracket],
                    border: `1px solid ${BRACKET_HEX[deck.bracket]}33`,
                  }}
                >
                  {deck.bracket}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-200 truncate">
                    {deck.commander ?? 'Unknown Commander'}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                    <span>{formatBracket(deck.bracket)}</span>
                    <span>{formatEngine(deck.engine)}</span>
                    <span>{deck.cardCount} cards</span>
                  </div>
                </div>

                <span className="text-gray-600 text-sm shrink-0">&rsaquo;</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DeckDetail({ deck, onBack, onRemove }: { deck: SavedDeck; onBack: () => void; onRemove: (id: string) => void }) {
  const [showFull, setShowFull] = useState(false)
  const analysis = deck.analysis
  const ba = analysis.bracket_analysis

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8 space-y-6">
      {/* Back button */}
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
        &larr; Back to My Decks
      </button>

      {/* LGS-friendly hero view — big bracket, clear at a glance */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center space-y-4">
        <BracketBadge bracket={ba.deck_bracket} size="lg" />

        {deck.commander && (
          <p className="text-lg font-medium text-gray-200">{deck.commander}</p>
        )}

        <BracketMeter
          bracket={ba.deck_bracket}
          speedBracket={ba.speed_bracket}
          warpBracket={ba.warp_bracket}
        />

        <div className="flex justify-center gap-4 text-xs text-gray-500">
          <span>{formatEngine(analysis.ipom_analysis.engine.primary_engine)}</span>
          {ba.estimated_win_turn && (
            <span>Win turn ~{ba.estimated_win_turn.toFixed(1)}</span>
          )}
          <span>{deck.cardCount} cards</span>
        </div>

        <p className="text-[10px] text-gray-600">
          Analyzed {new Date(deck.savedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Toggle full details */}
      <button
        onClick={() => setShowFull(!showFull)}
        className="w-full py-2 text-sm text-gray-400 hover:text-white border border-gray-800 rounded-lg hover:border-gray-600 transition-colors"
      >
        {showFull ? 'Hide Full Analysis' : 'Show Full Analysis'}
      </button>

      {showFull && (
        <div className="space-y-6 divide-y divide-gray-800">
          <ValidationErrors validation={analysis.validation} />
          <BracketReason bracket={ba} />
          <div className="pt-6"><EngineBreakdown ipom={analysis.ipom_analysis} /></div>
          <div className="pt-6">
            <GameChangers byCategory={ba.game_changers_by_category} found={ba.game_changers_found} total={ba.total_game_changers} />
          </div>
          <div className="pt-6"><ComboList combos={analysis.ipom_analysis.combos} /></div>
          <div className="pt-6">
            <CardList title="Fast Mana" cards={ba.fast_mana_found} count={ba.fast_mana_count} />
          </div>
          <div className="pt-6">
            <CardList title="Tutors" cards={ba.tutors_found ?? []} count={ba.tutor_count} />
          </div>
          {analysis.ipom_analysis.card_classifications && (
            <div className="pt-6">
              <CardBreakdown cards={analysis.ipom_analysis.card_classifications} />
            </div>
          )}
        </div>
      )}

      {/* Remove */}
      <button
        onClick={() => { onRemove(deck.id); onBack() }}
        className="w-full py-2 text-sm text-red-500/60 hover:text-red-400 transition-colors"
      >
        Remove Saved Deck
      </button>
    </div>
  )
}
