import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@clerk/react'
import { X, FlaskConical, Loader2, Plus } from 'lucide-react'
import { Button } from '../components/ui/button'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

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
        className="absolute right-1.5 top-1.5 flex items-center justify-center w-6 h-6 rounded-full text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
      >
        <X size={12} />
      </button>
      {imgFailed ? (
        <div className="h-14 w-14 rounded-full bg-muted" />
      ) : (
        <img
          src={ingredientImageUrl(name)}
          alt={name}
          onError={() => setImgFailed(true)}
          className="h-14 w-14 object-contain"
        />
      )}
      <span className="text-center text-xs font-medium leading-tight capitalize line-clamp-2">{name}</span>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-[110px] animate-pulse rounded-xl bg-muted" />
      ))}
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
  const [formOpen, setFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (formOpen) {
      // Wait for the grid transition to open before focusing
      const t = setTimeout(() => textareaRef.current?.focus(), 300)
      return () => clearTimeout(t)
    }
  }, [formOpen])

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

  useEffect(() => {
    authFetch('/api/cabinet')
      .then((data: { cabinet: CabinetEntry[] }) => setCabinet(data.cabinet))
      .catch(() => setError('Failed to load cabinet.'))
      .finally(() => setLoading(false))
  }, [authFetch])

  function closeForm() {
    setFormOpen(false)
    setInput('')
  }

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
      closeForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add ingredients.')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(id: number) {
    setCabinet((prev) => prev.filter((e) => e.id !== id))
    try {
      await authFetch(`/api/cabinet/${id}`, { method: 'DELETE' })
    } catch {
      setError('Failed to remove ingredient.')
      authFetch('/api/cabinet')
        .then((data: { cabinet: CabinetEntry[] }) => setCabinet(data.cabinet))
        .catch(() => null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-4 pt-8 pb-20">
      <PageHeader title="My Cabinet" />

      {/* Toggle button */}
      <button
        onClick={() => (formOpen ? closeForm() : setFormOpen(true))}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card py-3 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:border-primary/50 hover:text-primary min-h-[44px]"
      >
        <Plus
          size={16}
          className={`transition-transform duration-300 ${formOpen ? 'rotate-45' : ''}`}
        />
        {formOpen ? 'Cancel' : 'Add ingredients'}
      </button>

      {/* Animated form */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          formOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <form onSubmit={handleAdd} className="flex flex-col gap-3 pb-4 pt-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. vodka, lime juice, triple sec, some rum…"
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground/60"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={adding || !input.trim()}
                className="min-h-[44px] px-5 text-sm font-medium"
              >
                {adding ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Adding…
                  </span>
                ) : (
                  'Add to cabinet'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <GridSkeleton />
      ) : cabinet.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="Your cabinet's looking thirsty"
          description="Tell us what you've got on the shelf and we'll show you what you can pour."
          hint="↑ tap the button above to add your first bottles"
        />
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted-foreground">
            {cabinet.length} {cabinet.length === 1 ? 'ingredient' : 'ingredients'}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {cabinet.map((entry) => (
              <IngredientCard
                key={entry.id}
                name={entry.name}
                onRemove={() => handleRemove(entry.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
