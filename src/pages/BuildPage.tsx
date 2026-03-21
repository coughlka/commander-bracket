import { useState, useCallback } from 'react'
import { useCommanderProfile, useStapleSuggestions, useComboCompletions, useAnalyzeDeck } from '../api/hooks'
import { useSavedDecks } from '../hooks/useSavedDecks'
import CommanderSearch from '../components/builder/CommanderSearch'
import CommanderProfile from '../components/builder/CommanderProfile'
import CollectionInput from '../components/builder/CollectionInput'
import BuildPreferences, { type Preferences } from '../components/builder/BuildPreferences'
import SuggestionList from '../components/builder/SuggestionList'
import DeckList, { type DeckCard } from '../components/builder/DeckList'
import BracketBadge from '../components/results/BracketBadge'
import BracketMeter from '../components/results/BracketMeter'
import ErrorBoundary from '../components/shared/ErrorBoundary'

export default function BuildPage() {
  const [commander, setCommander] = useState<string | null>(null)
  const [collectionId, setCollectionId] = useState<string | null>(null)
  const [ownedCards, setOwnedCards] = useState<string[] | null>(null)
  const [cards, setCards] = useState<DeckCard[]>([])
  const [preferences, setPreferences] = useState<Preferences>({
    targetBracket: 3,
    intentModes: ['value'],
    maxPerCard: null,
    totalBudget: null,
  })
  const [saved, setSaved] = useState(false)

  const { data: profile } = useCommanderProfile(commander ?? '')
  const staplesMutation = useStapleSuggestions()
  const combosMutation = useComboCompletions()
  const analyzeMutation = useAnalyzeDeck()
  const { saveDeck } = useSavedDecks()

  const currentSpend = cards.reduce((sum, c) => sum + (c.price ?? 0), 0)

  const buildDecklist = useCallback(() => {
    const lines: string[] = []
    const cmdr = cards.filter(c => c.section === 'commander')
    const main = cards.filter(c => c.section === 'mainboard')
    if (cmdr.length > 0) {
      lines.push('// Commander')
      cmdr.forEach(c => lines.push(`1 ${c.name}`))
      lines.push('')
    }
    main.forEach(c => lines.push(`1 ${c.name}`))
    return lines.join('\n')
  }, [cards])

  const handleCommanderSelect = (name: string) => {
    if (name) {
      setCommander(name)
      setCards([{ name, price: null, section: 'commander' }])
    } else {
      setCommander(null)
      setCards([])
    }
    staplesMutation.reset()
    combosMutation.reset()
    analyzeMutation.reset()
    setSaved(false)
  }

  const handleCollectionLoaded = (data: { collectionId?: string; ownedCards?: string[] }) => {
    if (data.collectionId) setCollectionId(data.collectionId)
    if (data.ownedCards) setOwnedCards(data.ownedCards)
  }

  const handleGetSuggestions = () => {
    if (!commander || !profile) return

    const colors = profile.commander_profile.color_identity.join('')
    const decklist = buildDecklist()
    const intentMode = preferences.intentModes[0] ?? 'value'

    staplesMutation.mutate({
      colors,
      decklist,
      budget: preferences.maxPerCard ?? undefined,
      collection_id: collectionId ?? undefined,
      additional_owned: ownedCards ?? undefined,
      engine_types: profile.commander_profile.expected_engines ?? [],
      intent_mode: intentMode,
      commander,
    })

    combosMutation.mutate({
      decklist,
      commander,
    })
  }

  const handleAddCard = (cardName: string) => {
    if (cards.some(c => c.name === cardName)) return
    if (cards.length >= 100) return

    // Find price from suggestions
    const staple = staplesMutation.data?.recommended_additions.find(s => s.name === cardName)
    const combo = combosMutation.data?.completion_suggestions.find(s => s.card === cardName)
    const price = staple?.price ?? combo?.price ?? null

    setCards(prev => [...prev, { name: cardName, price, section: 'mainboard' }])
    setSaved(false)
  }

  const handleRemoveCard = (cardName: string) => {
    setCards(prev => prev.filter(c => c.name !== cardName))
    setSaved(false)
  }

  const handleAnalyze = () => {
    const decklist = buildDecklist()
    analyzeMutation.mutate({ decklist, commander: commander ?? undefined })
  }

  const handleSave = async () => {
    if (!analyzeMutation.data) return
    await saveDeck(analyzeMutation.data, buildDecklist())
    setSaved(true)
  }

  // Filter out cards already in deck from suggestions
  const deckCardNames = new Set(cards.map(c => c.name.toLowerCase()))
  const filteredStaples = (staplesMutation.data?.recommended_additions ?? [])
    .filter(s => !deckCardNames.has(s.name.toLowerCase()))
  const filteredCombos = (combosMutation.data?.completion_suggestions ?? [])
    .filter(s => !deckCardNames.has(s.card.toLowerCase()))
    .map(s => ({
      name: s.card,
      price: s.price,
      category: 'combo',
      reason: `Combos with ${s.completes_with}: ${s.combo_info.effect}`,
    }))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Deck Builder</h1>
        <p className="text-sm text-gray-500">
          Pick a commander, link your collection, build a deck
        </p>
      </div>

      <ErrorBoundary>
        {/* Step 1: Commander */}
        <CommanderSearch onSelect={handleCommanderSelect} selected={commander} />

        {/* Commander profile */}
        {commander && <CommanderProfile commander={commander} />}

        {/* Step 2: Collection (optional) */}
        {commander && (
          <CollectionInput onCollectionLoaded={handleCollectionLoaded} />
        )}

        {/* Step 3: Preferences */}
        {commander && (
          <BuildPreferences preferences={preferences} onChange={setPreferences} />
        )}

        {/* Get Suggestions button */}
        {commander && profile && (
          <button
            onClick={handleGetSuggestions}
            disabled={staplesMutation.isPending}
            className="w-full py-3 bg-white text-gray-950 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors text-base"
          >
            {staplesMutation.isPending ? 'Building...' : 'Build My Deck'}
          </button>
        )}

        {/* Deck list + Suggestions side by side on desktop, stacked on mobile */}
        {commander && (staplesMutation.data || cards.length > 1) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Deck */}
            <div className="space-y-4">
              <DeckList cards={cards} onRemove={handleRemoveCard} />

              {/* Budget tracker */}
              {preferences.totalBudget !== null && (
                <div className="text-xs text-gray-500">
                  Budget: <span className={currentSpend > preferences.totalBudget ? 'text-red-400' : 'text-green-400'}>
                    ${currentSpend.toFixed(2)}
                  </span> / ${preferences.totalBudget.toFixed(2)}
                </div>
              )}

              {/* Analyze button */}
              {cards.length >= 10 && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending}
                  className="w-full py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors text-sm"
                >
                  {analyzeMutation.isPending ? 'Analyzing...' : `Analyze Bracket (${cards.length} cards)`}
                </button>
              )}

              {/* Bracket result */}
              {analyzeMutation.data && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <BracketBadge bracket={analyzeMutation.data.bracket_analysis.deck_bracket} size="sm" />
                    <BracketMeter
                      bracket={analyzeMutation.data.bracket_analysis.deck_bracket}
                      speedBracket={analyzeMutation.data.bracket_analysis.speed_bracket}
                      warpBracket={analyzeMutation.data.bracket_analysis.warp_bracket}
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saved}
                    className={`w-full py-2 rounded-lg text-sm transition-colors ${
                      saved
                        ? 'bg-green-900/30 border border-green-800/50 text-green-400'
                        : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {saved ? 'Saved to My Decks' : 'Save to My Decks'}
                  </button>
                </div>
              )}
            </div>

            {/* Right: Suggestions */}
            <div className="space-y-6">
              <SuggestionList
                title="Recommended Cards"
                suggestions={filteredStaples}
                loading={staplesMutation.isPending}
                onAdd={handleAddCard}
                totalBudget={preferences.totalBudget}
                currentSpend={currentSpend}
              />

              {filteredCombos.length > 0 && (
                <SuggestionList
                  title="Combo Completions"
                  suggestions={filteredCombos}
                  loading={combosMutation.isPending}
                  onAdd={handleAddCard}
                  totalBudget={preferences.totalBudget}
                  currentSpend={currentSpend}
                />
              )}

              {/* Refresh suggestions */}
              {staplesMutation.data && (
                <button
                  onClick={handleGetSuggestions}
                  disabled={staplesMutation.isPending}
                  className="w-full py-2 border border-gray-700 text-gray-400 rounded-lg hover:text-white hover:border-gray-500 transition-colors text-sm"
                >
                  Refresh Suggestions
                </button>
              )}
            </div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
}
