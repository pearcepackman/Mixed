import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import RatingStars from './RatingStars'

describe('RatingStars', () => {
  describe('read-only mode (no onChange)', () => {
    it('renders 5 star SVGs', () => {
      const { container } = render(<RatingStars value={3} />)
      expect(container.querySelectorAll('svg')).toHaveLength(5)
    })

    it('renders no interactive buttons', () => {
      render(<RatingStars value={3} />)
      expect(screen.queryAllByRole('button')).toHaveLength(0)
    })

    it('renders with value 0 without crashing', () => {
      const { container } = render(<RatingStars value={0} />)
      expect(container.querySelectorAll('svg')).toHaveLength(5)
    })

    it('renders with max value 5 without crashing', () => {
      const { container } = render(<RatingStars value={5} />)
      expect(container.querySelectorAll('svg')).toHaveLength(5)
    })
  })

  describe('interactive mode (with onChange)', () => {
    it('renders 5 buttons', () => {
      render(<RatingStars value={0} onChange={vi.fn()} />)
      expect(screen.getAllByRole('button')).toHaveLength(5)
    })

    it('each button has an accessible label', () => {
      render(<RatingStars value={0} onChange={vi.fn()} />)
      expect(screen.getByRole('button', { name: 'Rate 1 star' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Rate 2 stars' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Rate 5 stars' })).toBeInTheDocument()
    })

    it('calls onChange with the clicked star value', async () => {
      const onChange = vi.fn()
      render(<RatingStars value={0} onChange={onChange} />)
      await userEvent.click(screen.getByRole('button', { name: 'Rate 4 stars' }))
      expect(onChange).toHaveBeenCalledWith(4)
    })

    it('calls onChange with 1 when first star is clicked', async () => {
      const onChange = vi.fn()
      render(<RatingStars value={0} onChange={onChange} />)
      await userEvent.click(screen.getByRole('button', { name: 'Rate 1 star' }))
      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('calls onChange with 5 when last star is clicked', async () => {
      const onChange = vi.fn()
      render(<RatingStars value={0} onChange={onChange} />)
      await userEvent.click(screen.getByRole('button', { name: 'Rate 5 stars' }))
      expect(onChange).toHaveBeenCalledWith(5)
    })

    it('still renders all 5 buttons when a value is already set', () => {
      render(<RatingStars value={3} onChange={vi.fn()} />)
      expect(screen.getAllByRole('button')).toHaveLength(5)
    })
  })
})
