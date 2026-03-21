import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center space-y-8">
        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            What Bracket Is
            <br />
            <span className="bg-gradient-to-r from-green-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
              Your Deck?
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Analyze your Commander deck's bracket level or build a new deck
            from your collection with card suggestions.
          </p>
        </div>

        {/* Two CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/bracket"
            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-950 font-bold text-lg rounded-xl hover:bg-gray-200 transition-colors text-center"
          >
            Check Your Bracket
          </Link>
          <Link
            to="/build"
            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-950 font-bold text-lg rounded-xl hover:bg-gray-200 transition-colors text-center"
          >
            Build a Deck
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
          <FeatureCard
            title="Bracket 1-5"
            description="WotC-aligned power level classification"
          />
          <FeatureCard
            title="Deck Builder"
            description="Get card suggestions from your collection by engine and play style"
          />
          <FeatureCard
            title="Card Previews"
            description="Click any card to see it full-size with role analysis"
          />
        </div>

        {/* Supported formats */}
        <p className="text-xs text-gray-600 pt-4">
          Supports MTG Arena, Moxfield, Archidekt, Manabox, MTGO, and simple text formats.
          Free. No login. No ads.
        </p>
      </div>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-left">
      <h3 className="text-sm font-semibold text-gray-200 mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}
