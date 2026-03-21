import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import MobileNav from './components/layout/MobileNav'
import HomePage from './pages/HomePage'
import BracketPage from './pages/BracketPage'
import MyDecksPage from './pages/MyDecksPage'
import BuildPage from './pages/BuildPage'
import AboutPage from './pages/AboutPage'

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-svh">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/bracket" element={<BracketPage />} />
              <Route path="/build" element={<BuildPage />} />
              <Route path="/decks" element={<MyDecksPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
          <Footer />
          <MobileNav />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
