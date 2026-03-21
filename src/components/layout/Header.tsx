import { Link, useLocation } from 'react-router-dom'
import AuthButton from '../auth/AuthButton'

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/bracket', label: 'Bracket' },
  { path: '/build', label: 'Build' },
  { path: '/decks', label: 'My Decks' },
  { path: '/about', label: 'About' },
]

export default function Header() {
  const location = useLocation()

  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-gray-200 transition-colors">
          <img src="/logo.png" alt="CommanderBracket" className="h-8 w-auto" />
          <span className="hidden sm:inline">CommanderBracket</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <AuthButton />
        </div>
      </div>
    </header>
  )
}
