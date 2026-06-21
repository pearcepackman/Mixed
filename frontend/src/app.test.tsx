import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import AppRoutes from './AppRoutes'

vi.mock('@clerk/react', () => ({
  Show: ({ children, when }: { children: React.ReactNode; when: string }) =>
    when === 'signed-out' ? <>{children}</> : null,
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserButton: () => <div>UserButton</div>,
  useAuth: vi.fn(() => ({ isLoaded: true, isSignedIn: false, getToken: vi.fn() })),
}))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  it('renders home page at /', () => {
    renderAt('/')
    expect(screen.getByText('Mixed')).toBeInTheDocument()
  })

  it('redirects /profile to / when signed out', () => {
    renderAt('/profile')
    expect(screen.getByText('Mixed')).toBeInTheDocument()
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })

  it('redirects /cabinet to / when signed out', () => {
    renderAt('/cabinet')
    expect(screen.getByText('Mixed')).toBeInTheDocument()
  })

  it('redirects /discover to / when signed out', () => {
    renderAt('/discover')
    expect(screen.getByText('Mixed')).toBeInTheDocument()
  })

  it('redirects /log to / when signed out', () => {
    renderAt('/log')
    expect(screen.getByText('Mixed')).toBeInTheDocument()
  })

  it('does not show bottom nav on the home page', () => {
    renderAt('/')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
