import { Show, SignInButton, SignUpButton } from '@clerk/react'
import { useNavigate } from 'react-router'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Show when="signed-out">
        <h1 className="text-2xl font-semibold">Mixed</h1>
        <p className="text-muted-foreground">Track your cocktails.</p>
        <div className="flex gap-3">
          <SignInButton mode="modal">
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
              Sign up
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <h1 className="text-2xl font-semibold">Mixed</h1>
        <p className="text-muted-foreground">You're signed in.</p>
        <button
          onClick={() => navigate('/profile')}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Go to profile
        </button>
      </Show>
    </div>
  )
}
