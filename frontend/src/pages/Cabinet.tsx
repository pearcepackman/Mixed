import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/react'
import { X } from 'lucide-react'

function ingredientImageUrl(name: string) {
  const capitalized = name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(capitalized)}-Small.png`
}

function IngredientCard({ name, onRemove }: { name: string; onRemove: () => void }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="relative flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3">
      <button
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="absolute right-1.5 top-1.5 rounded-full p-0.5 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
      >
        <X size={14} />
      </button>
      {!imgFailed && (
        <img
          src={ingredientImageUrl(name)}
          alt={name}
          onError={() => setImgFailed(true)}
          className="h-14 w-14 object-contain"
        />
      )}
      {imgFailed && <div className="h-14 w-14 rounded-full bg-muted" />}
      <span className="text-center text-xs font-medium leading-tight capitalize">{name}</span>
    </div>
  )
}

interface CabinetEntry {
  id: number
  name: string
  addedAt: string
}

export default function Cabinet() {
  const { getToken } = useAuth()
  const [cabinet, setCabinet] = useState<CabinetEntry[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const token = await getToken()
      if (!token) throw new Error('No active session')
      const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? `${res.status}`)
      }
      return res.json()
    },
    [getToken],
  )

  useEffect(() => {
    authFetch('/api/cabinet')
      .then((data: { cabinet: CabinetEntry[] }) => setCabinet(data.cabinet))
      .catch(() => setError('Failed to load cabinet.'))
      .finally(() => setLoading(false))
  }, [authFetch])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    setAdding(true)
    setError(null)
    try {
      const data: { cabinet: CabinetEntry[] } = await authFetch('/api/cabinet', {
        method: 'POST',
        body: JSON.stringify({ input: input.trim() }),
      })
      setCabinet(data.cabinet)
      setInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add ingredients.')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(id: number) {
    try {
      await authFetch(`/api/cabinet/${id}`, { method: 'DELETE' })
      setCabinet((prev) => prev.filter((e) => e.id !== id))
    } catch {
      setError('Failed to remove ingredient.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-4 pt-8 pb-20">
      <h1 className="text-2xl font-semibold mb-6">My Cabinet</h1>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-8">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you have? e.g. vodka, lime juice, triple sec, some rum…"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <button
          type="submit"
          disabled={adding || !input.trim()}
          className="self-end rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/80 disabled:opacity-50 min-h-[44px]"
        >
          {adding ? 'Adding…' : 'Add to cabinet'}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-32 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
      ) : cabinet.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-base font-medium text-foreground">Your cabinet is empty</p>
          <p className="text-sm text-muted-foreground">Tell us what you have and we'll show you what you can make.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {cabinet.map((entry) => (
            <IngredientCard
              key={entry.id}
              name={entry.name}
              onRemove={() => handleRemove(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
