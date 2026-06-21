import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router'
import ProtectedRoute from './ProtectedRoute'

vi.mock('@clerk/react', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '@clerk/react'
const mockUseAuth = vi.mocked(useAuth)

function renderProtectedRoute(path = '/protected') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders nothing while Clerk is loading', () => {
    mockUseAuth.mockReturnValue({ isLoaded: false, isSignedIn: false } as never)
    const { container } = renderProtectedRoute()
    expect(container).toBeEmptyDOMElement()
  })

  it('redirects to / when signed out', () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false } as never)
    renderProtectedRoute()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders children when signed in', () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true } as never)
    renderProtectedRoute()
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})
