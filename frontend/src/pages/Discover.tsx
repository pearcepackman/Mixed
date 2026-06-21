import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@clerk/react'
import { useNavigate } from 'react-router'
import { Search, X } from 'lucide-react'
import CocktailCard from '../components/CocktailCard'

interface CanMakeResult {
  cocktailId: number
  name: string
  imageUrl: string | null
  category: string | null
  glass: string | null
  alcoholic: boolean
  instructions: string
  totalIngredients: number
  ownedIngredients: number
  missingIngredients: string[]
  ingredients: { name: string; measure: string | null; owned: boolean }[]
}

export default function Discover() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [canMake, setCanMake] = useState<CanMakeResult[]>([])
  const [searchResults, setSearchResults] = useState<CanMakeResult[]>([])
  const [query, setQuery] = useState('')
  const [loadingCanMake, setLoadingCanMake] = useState(true)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'all' | 'missing1' | 'missing2'>('all')
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const authFetch = useCallback(
    async (path: string) => {
      const token = await getToken()
      if (!token) throw new Error('No active session')
      const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`${res.status}`)
      return res.json()
    },
    [getToken],
  )

  useEffect(() => {
    authFetch('/api/cabinet/can-make')
      .then((data: { cocktails: CanMakeResult[] }) => setCanMake(data.cocktails))
      .catch(() => setError('Failed to load cocktails.'))
      .finally(() => setLoadingCanMake(false))
  }, [authFetch])

  useEffect(() => {
    let active = true
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (!query.trim()) return

    searchTimeout.current = setTimeout(() => {
      if (!active) return
      setLoadingSearch(true)
      authFetch(`/api/cocktails/search?q=${encodeURIComponent(query.trim())}`)
        .then((data: { cocktails: CanMakeResult[] }) => {
          if (active) setSearchResults(data.cocktails)
        })
        .catch(() => {
          if (active) setError('Search failed.')
        })
        .finally(() => {
          if (active) setLoadingSearch(false)
        })
    }, 300)

    return () => {
      active = false
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    }
  }, [query, authFetch])

  const isSearching = query.trim().length > 0

  const canMakeNow = canMake.filter((c) => c.missingIngredients.length === 0)
  const missing1 = canMake.filter((c) => c.missingIngredients.length === 1)
  const missing2 = canMake.filter((c) => c.missingIngredients.length === 2)
  const tabResults = tab === 'all' ? canMakeNow : tab === 'missing1' ? missing1 : missing2

  const displayed = isSearching ? searchResults : tabResults
  const loading = isSearching ? loadingSearch : loadingCanMake

  function handleLog(cocktail: { cocktailId: number; name: string; imageUrl: string | null }) {
    navigate('/log', { state: { cocktail } })
  }

  function renderCards(list: CanMakeResult[]) {
    return (
      <div className="flex flex-col gap-4">
        {list.map((c) => (
          <CocktailCard
            key={c.cocktailId}
            cocktailId={c.cocktailId}
            name={c.name}
            imageUrl={c.imageUrl}
            category={c.category}
            glass={c.glass}
            alcoholic={c.alcoholic}
            instructions={c.instructions}
            ingredients={c.ingredients}
            ownedIngredients={c.ownedIngredients}
            totalIngredients={c.totalIngredients}
            onLog={handleLog}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col px-4 pt-8 pb-20">
      <h1 className="text-2xl font-semibold mb-4">Discover</h1>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cocktails…"
          className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Tabs — only shown when not searching */}
      {!isSearching && (
        <div className="flex gap-2 mb-6 text-sm flex-wrap">
          {(
            [
              { key: 'all', label: `Can make (${canMakeNow.length})` },
              { key: 'missing1', label: `Missing 1 (${missing1.length})` },
              { key: 'missing2', label: `Missing 2 (${missing2.length})` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-full px-3 py-1 font-medium transition-colors duration-150 ${
                tab === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-base font-medium">
            {isSearching ? 'No cocktails found' : 'Nothing here yet'}
          </p>
          <p className="text-sm text-muted-foreground">
            {isSearching
              ? 'Try a different search term.'
              : tab === 'all'
              ? 'Add ingredients to your cabinet to see what you can make.'
              : 'No cocktails in this category.'}
          </p>
        </div>
      ) : (
        renderCards(displayed)
      )}
    </div>
  )
}
