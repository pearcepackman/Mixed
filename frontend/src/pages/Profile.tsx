import { useState } from 'react'
import { useAuth, UserButton } from '@clerk/react'
import { useNavigate } from 'react-router'

export default function Profile() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [userId, setUserId] = useState<string | null>(null)

  async function fetchUser() {
    const token = await getToken()
    const res = await fetch('http://localhost:3000/api/user', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setUserId(data.userId)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <UserButton />
      </div>

      <button
        onClick={fetchUser}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Fetch user from API
      </button>

      {userId && (
        <div className="rounded-md bg-muted px-6 py-4 text-sm">
          <span className="text-muted-foreground">Clerk user ID: </span>
          <span className="font-mono">{userId}</span>
        </div>
      )}

      <button
        onClick={() => navigate('/')}
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Back to home
      </button>
    </div>
  )
}
