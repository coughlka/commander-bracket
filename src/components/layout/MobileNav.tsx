import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { path: '/', label: 'Home', icon: '&#9750;' },
  { path: '/bracket', label: 'Bracket', icon: '&#9876;' },
  { path: '/decks', label: 'My Decks', icon: '&#9733;' },
  { path: '/about', label: 'About', icon: '&#8505;' },
]

export default function MobileNav() {
  const location = useLocation()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800"
      style={{
        backgroundColor: '#111827',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-14">
        {TABS.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors ${
              location.pathname === path
                ? 'text-white'
                : 'text-gray-500'
            }`}
          >
            <span className="text-lg" dangerouslySetInnerHTML={{ __html: icon }} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
