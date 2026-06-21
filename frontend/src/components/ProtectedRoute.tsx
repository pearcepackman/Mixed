import { useAuth } from '@clerk/react'
import { Navigate } from 'react-router'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return null

  if (!isSignedIn) return <Navigate to="/" replace />

  return <>{children}</>
}
