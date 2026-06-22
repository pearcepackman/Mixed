import { useCallback, useEffect, useState } from 'react'
import { useAuth, useUser, useClerk } from '@clerk/react'
import { Link } from 'react-router'
import { LogOut } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import RatingStars from '../components/RatingStars'
import StickyHeader from '../components/StickyHeader'
import { useCountUp } from '../hooks/useCountUp'

interface LogEntry {
  id: number
  cocktailName: string
  cocktailImageUrl: string | null
  rating: number | null
  loggedAt: string
}

interface LogStats {
  total: number
  averageRating: number | null
  topCategory: string | null
}

interface CabinetEntry {
  id: number
  name: string
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
}

function memberSince(date: Date | null | undefined) {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card border border-border px-3 py-3 flex flex-col gap-1">
      <span className="text-lg font-semibold truncate">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export default function Profile() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [cabinet, setCabinet] = useState<CabinetEntry[]>([])
  const [loading, setLoading] = useState(true)

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
    let active = true
    Promise.allSettled([
      authFetch('/api/logs'),
      authFetch('/api/cabinet'),
    ])
      .then(([logsResult, cabinetResult]) => {
        if (!active) return
        if (logsResult.status === 'fulfilled') {
          setLogs((logsResult.value.logs as LogEntry[]).slice(0, 3))
          setStats(logsResult.value.stats)
        }
        if (cabinetResult.status === 'fulfilled') {
          setCabinet(cabinetResult.value.cabinet as CabinetEntry[])
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [authFetch])

  const animatedDrinks = useCountUp(stats?.total ?? 0)
  const animatedCabinet = useCountUp(cabinet.length)

  const displayName = user?.fullName ?? user?.firstName ?? 'You'
  const email = user?.primaryEmailAddress?.emailAddress
  const avatarUrl = user?.imageUrl

  return (
    <>
    <StickyHeader title="Profile" />
    <div className="flex min-h-screen flex-col px-4 pt-8 pb-20 animate-page-enter">
      <PageHeader title="Profile" />

      {/* Identity */}
      <div className="flex items-center gap-4 mb-8">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-semibold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-base font-semibold truncate">{displayName}</p>
          {email && <p className="text-sm text-muted-foreground truncate">{email}</p>}
          {user?.createdAt && (
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Member since {memberSince(user.createdAt)}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard label="Drinks" value={animatedDrinks.toString()} />
          <StatCard
            label="Avg rating"
            value={stats?.averageRating != null ? stats.averageRating.toFixed(1) : '—'}
          />
          <StatCard label="Cabinet" value={animatedCabinet.toString()} />
        </div>
      )}

      {/* Recent drinks */}
      {!loading && stats && stats.total > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Recent drinks</p>
            <Link to="/log" className="text-xs text-primary">
              See all
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                {log.cocktailImageUrl ? (
                  <img
                    src={log.cocktailImageUrl}
                    alt={log.cocktailName}
                    className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-muted flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{log.cocktailName}</p>
                  {log.rating != null ? (
                    <RatingStars value={log.rating} size={10} />
                  ) : (
                    <p className="text-xs text-muted-foreground/60">{formatDate(log.loggedAt)}</p>
                  )}
                </div>
                {log.rating != null && (
                  <p className="text-xs text-muted-foreground/60 flex-shrink-0">{formatDate(log.loggedAt)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cabinet snapshot */}
      {!loading && cabinet.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">{cabinet.length} ingredients in your cabinet</p>
            <Link to="/cabinet" className="text-xs text-primary">
              Manage
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {cabinet.slice(0, 12).map((item) => (
              <span
                key={item.id}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-muted-foreground"
              >
                {item.name}
              </span>
            ))}
            {cabinet.length > 12 && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground/60">
                +{cabinet.length - 12} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Sign out */}
      <div className="mt-auto pt-4">
        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground min-h-[44px]"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
    </>
  )
}
