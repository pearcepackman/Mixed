import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router'
import BottomNav from './BottomNav'

function renderNav(initialPath = '/cabinet') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BottomNav />
    </MemoryRouter>,
  )
}

describe('BottomNav', () => {
  it('renders all four tabs', () => {
    renderNav()
    expect(screen.getByText('Cabinet')).toBeInTheDocument()
    expect(screen.getByText('Discover')).toBeInTheDocument()
    expect(screen.getByText('Log')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('renders four navigation links', () => {
    renderNav()
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })

  it('Cabinet link points to /cabinet', () => {
    renderNav()
    expect(screen.getByRole('link', { name: /cabinet/i })).toHaveAttribute('href', '/cabinet')
  })

  it('Discover link points to /discover', () => {
    renderNav()
    expect(screen.getByRole('link', { name: /discover/i })).toHaveAttribute('href', '/discover')
  })

  it('Log link points to /log', () => {
    renderNav()
    expect(screen.getByRole('link', { name: /^log$/i })).toHaveAttribute('href', '/log')
  })

  it('Profile link points to /profile', () => {
    renderNav()
    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile')
  })

  it('active tab has primary color class when on that route', () => {
    renderNav('/cabinet')
    const cabinetLink = screen.getByRole('link', { name: /cabinet/i })
    expect(cabinetLink.className).toContain('text-primary')
  })

  it('inactive tabs do not have primary color class', () => {
    renderNav('/cabinet')
    const discoverLink = screen.getByRole('link', { name: /discover/i })
    expect(discoverLink.className).toContain('text-muted-foreground')
  })
})
