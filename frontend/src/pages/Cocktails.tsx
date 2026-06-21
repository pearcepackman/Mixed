import { useState } from 'react'
import { useAuth } from '@clerk/react'
import { useNavigate } from 'react-router'

interface Cocktail {
  id: number
  name: string
  category: string | null
  alcoholic: boolean
  glass: string | null
  imageUrl: string | null
}

export default function Cocktails() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Cocktail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      if (!token) throw new Error('No active session')
      const params = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cocktails${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setResults(data.cocktails)
      setSearched(true)
    } catch {
      setError('Failed to fetch cocktails.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold">Cocktails</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cocktails..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground">No cocktails found.</p>
      )}

      <ul className="flex flex-col gap-3">
        {results.map((c) => (
          <li key={c.id} className="flex items-center gap-4 rounded-md border border-border bg-card p-3">
            {c.imageUrl && (
              <img src={c.imageUrl} alt={c.name} className="h-12 w-12 rounded object-cover" />
            )}
            <div className="flex flex-col">
              <span className="font-medium">{c.name}</span>
              <span className="text-sm text-muted-foreground">
                {[c.category, c.glass].filter(Boolean).join(' · ')}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
