export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-white">How It Works</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-200">Bracket System</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          CommanderBracket uses a WotC-aligned 5-tier power level classification system
          to rate Commander decks. Each bracket represents a different level of optimization
          and expected game speed.
        </p>
        <div className="space-y-2">
          {BRACKETS.map(b => (
            <div key={b.bracket} className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-3">
              <span className="text-lg font-bold" style={{ color: b.color }}>{b.bracket}</span>
              <div>
                <span className="text-sm font-medium text-gray-200">{b.name}</span>
                <span className="text-xs text-gray-500 ml-2">{b.turns}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-200">Engine Analysis (IPOM)</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          The Intent, Purpose, Objective, Mechanics system analyzes your deck's core engine &mdash;
          how it generates value, what role each card plays, and what combos are present.
          This ensures bracket classification understands <em>how</em> your deck wins, not just
          what cards it contains.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-200">Two-Axis Classification</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Decks are evaluated on two axes: <strong className="text-gray-300">Speed</strong> (how
          fast can this deck threaten a win?) and <strong className="text-gray-300">Warp</strong> (how
          much does this deck warp the game around itself?). The higher of the two determines
          the final bracket.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-200">Supported Formats</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Paste decklists from any major platform: MTG Arena, Moxfield, Archidekt, Manabox,
          MTGO, or simple text format. Archidekt deck URLs are automatically fetched.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-200">Disclaimer</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          This tool provides informational signals, not authoritative rulings. Bracket classification
          is based on card analysis and heuristics. Always discuss power level with your playgroup.
          Card data provided by Scryfall.
        </p>
      </section>
    </div>
  )
}

const BRACKETS = [
  { bracket: 1, name: 'Exhibition', turns: '9+ turns', color: '#22c55e' },
  { bracket: 2, name: 'Core', turns: '8+ turns', color: '#3b82f6' },
  { bracket: 3, name: 'Upgraded', turns: '6+ turns', color: '#a855f7' },
  { bracket: 4, name: 'Optimized', turns: '4+ turns', color: '#f97316' },
  { bracket: 5, name: 'cEDH', turns: 'Any turn', color: '#ef4444' },
]
