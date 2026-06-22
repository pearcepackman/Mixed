import { useState, useEffect, useCallback, useRef } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import StickyHeader from '../components/StickyHeader'
import { useAuth } from '@clerk/react'
import { useLocation, useNavigate } from 'react-router'
import { Search, X, ArrowLeft, Trash2, Loader2, BookOpen } from 'lucide-react'
import { Button } from '../components/ui/button'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import RatingStars from '../components/RatingStars'

interface LogEntry {
  id: number
  cocktailId: number
  cocktailName: string
  cocktailImageUrl: string | null
  cocktailCategory: string | null
  rating: number | null
  notes: string | null
  loggedAt: string
}

interface LogStats {
  total: number
  averageRating: number | null
  topCategory: string | null
}

interface SearchCocktail {
  cocktailId: number
  name: string
  imageUrl: string | null
}

type Step = 'history' | 'search' | 'rate'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
}

export default function Log() {
  const { getToken } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('history')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<LogStats>({ total: 0, averageRating: null, topCategory: null })
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Search state
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchCocktail[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Rate state
  const [selectedCocktail, setSelectedCocktail] = useState<SearchCocktail | null>(null)
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const authFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const token = await getToken()
      if (!token) throw new Error('No active session')
      const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
          ...init?.headers,
        },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? `${res.status}`)
      }
      return res.json()
    },
    [getToken],
  )

  // Load history — triggered by refreshKey
  useEffect(() => {
    let active = true
    authFetch('/api/logs')
      .then((data: { logs: LogEntry[]; stats: LogStats }) => {
        if (!active) return
        setLogs(data.logs)
        setStats(data.stats)
      })
      .catch(() => { if (active) setError('Failed to load drink history.') })
      .finally(() => { if (active) setLoadingHistory(false) })
    return () => { active = false }
  }, [authFetch, refreshKey])

  // Pre-select cocktail when navigated from Discover via router state
  useEffect(() => {
    const state = location.state as { cocktail?: SearchCocktail } | null
    if (!state?.cocktail) return
    const cocktail = state.cocktail
    const t = setTimeout(() => {
      setSelectedCocktail(cocktail)
      setRating(0)
      setNotes('')
      setStep('rate')
      navigate('/log', { replace: true, state: null })
    }, 0)
    return () => clearTimeout(t)
  }, [location.state, navigate])

  // Debounced search
  useEffect(() => {
    let active = true
    if (searchTimeout.current) clearTimeout(searchTimeout.current)

    searchTimeout.current = setTimeout(() => {
      if (!active) return
      if (!query.trim()) {
        setSearchResults([])
        return
      }
      setLoadingSearch(true)
      authFetch(`/api/cocktails/search?q=${encodeURIComponent(query.trim())}`)
        .then((data: { cocktails: SearchCocktail[] }) => {
          if (active) setSearchResults(data.cocktails)
        })
        .catch(() => { if (active) setError('Search failed.') })
        .finally(() => { if (active) setLoadingSearch(false) })
    }, 300)

    return () => {
      active = false
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    }
  }, [query, authFetch])

  // Focus search input when entering search step
  useEffect(() => {
    if (step === 'search') {
      const t = setTimeout(() => searchInputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [step])

  function goToSearch() {
    setQuery('')
    setSearchResults([])
    setStep('search')
  }

  function selectCocktail(c: SearchCocktail) {
    setSelectedCocktail(c)
    setRating(0)
    setNotes('')
    setStep('rate')
  }

  function backToHistory() {
    setStep('history')
    setSelectedCocktail(null)
    setRating(0)
    setNotes('')
    setQuery('')
    setError(null)
  }

  async function handleSave() {
    if (!selectedCocktail) return
    setSaving(true)
    setError(null)
    try {
      await authFetch('/api/logs', {
        method: 'POST',
        body: JSON.stringify({
          cocktailId: selectedCocktail.cocktailId,
          rating: rating > 0 ? rating : null,
          notes: notes.trim() || null,
        }),
      })
      backToHistory()
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setLogs((prev) => prev.filter((l) => l.id !== id))
    try {
      await authFetch(`/api/logs/${id}`, { method: 'DELETE' })
      setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }))
    } catch {
      setRefreshKey((k) => k + 1)
    }
  }

  const animatedDrinkCount = useCountUp(stats.total)

  // ── History view ──────────────────────────────────────────────────────────
  if (step === 'history') {
    return (
      <>
      <StickyHeader title="My Drinks" />
      <div className="flex min-h-screen flex-col px-4 pt-8 pb-20 animate-page-enter">
        <PageHeader
          title="My Drinks"
          action={
            <Button onClick={goToSearch} className="min-h-[44px] px-4 text-sm font-medium">
              + Log drink
            </Button>
          }
        />

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        {/* Stats strip */}
        {!loadingHistory && stats.total > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Drinks', value: animatedDrinkCount.toString() },
              { label: 'Avg rating', value: stats.averageRating != null ? stats.averageRating.toFixed(1) : '—' },
              { label: 'Top style', value: stats.topCategory ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-card border border-border px-3 py-3 flex flex-col gap-1">
                <span className="text-lg font-semibold truncate">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        )}

        {loadingHistory ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No drinks logged yet"
            description="Tap '+ Log drink' to record your first cocktail."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                {log.cocktailImageUrl ? (
                  <img
                    src={log.cocktailImageUrl}
                    alt={log.cocktailName}
                    className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-muted flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{log.cocktailName}</p>
                  {log.rating != null && <RatingStars value={log.rating} size={12} />}
                  {log.notes && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{log.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{formatDate(log.loggedAt)}</p>
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  aria-label="Delete log entry"
                  className="flex-shrink-0 p-2 text-muted-foreground/40 hover:text-destructive transition-colors duration-150"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
    )
  }

  // ── Search view ───────────────────────────────────────────────────────────
  if (step === 'search') {
    return (
      <>
      <StickyHeader title="Log a drink" />
      <div className="flex min-h-screen flex-col px-4 pt-8 pb-20 animate-page-enter">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={backToHistory}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-muted text-foreground transition-colors duration-150 hover:bg-muted/80"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-semibold">What did you drink?</h1>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchInputRef}
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

        {loadingSearch && (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!loadingSearch && searchResults.length > 0 && (
          <div className="flex flex-col gap-2">
            {searchResults.map((c) => (
              <button
                key={c.cocktailId}
                onClick={() => selectCocktail(c)}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all duration-150 hover:bg-muted active:scale-95 active:bg-muted min-h-[60px]"
              >
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.name} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-muted flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{c.name}</span>
              </button>
            ))}
          </div>
        )}

        {!loadingSearch && query.trim() && searchResults.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No cocktails found.</p>
        )}

        {!query.trim() && (
          <p className="text-sm text-muted-foreground text-center py-8">Start typing to search.</p>
        )}
      </div>
      </>
    )
  }

  // ── Rate view ─────────────────────────────────────────────────────────────
  return (
    <>
    <StickyHeader title={selectedCocktail?.name ?? 'Rate drink'} />
    <div className="flex min-h-screen flex-col px-4 pt-8 pb-20 animate-page-enter">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setStep('search')}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-muted text-foreground transition-colors duration-150 hover:bg-muted/80"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-semibold truncate">{selectedCocktail?.name}</h1>
      </div>

      {selectedCocktail?.imageUrl && (
        <img
          src={selectedCocktail.imageUrl}
          alt={selectedCocktail.name}
          className="w-full h-52 object-cover rounded-2xl mb-6"
        />
      )}

      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm font-medium mb-3 text-muted-foreground">Your rating</p>
          <RatingStars value={rating} onChange={setRating} size={32} />
        </div>

        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">
            Notes <span className="font-normal">(optional)</span>
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How was it? Any tweaks you'd make?"
            rows={3}
            className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground/60"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-h-[44px] text-sm font-medium w-full"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Saving…
            </span>
          ) : (
            'Save drink'
          )}
        </Button>

        <button onClick={backToHistory} className="text-sm text-muted-foreground text-center">
          Cancel
        </button>
      </div>
    </div>
    </>
  )
}
