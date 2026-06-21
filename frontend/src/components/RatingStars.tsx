import { useState } from 'react'
import { Star } from 'lucide-react'

interface Props {
  value: number
  onChange?: (value: number) => void
  size?: number
}

export default function RatingStars({ value, onChange, size = 20 }: Props) {
  const [hovered, setHovered] = useState(0)
  const interactive = !!onChange
  const display = hovered || value

  if (!interactive) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= value ? 'text-primary' : 'text-muted-foreground/30'}
            fill={i <= value ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          className="p-1 transition-transform duration-100 active:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={`Rate ${i} star${i !== 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={i <= display ? 'text-primary' : 'text-muted-foreground/30'}
            fill={i <= display ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  )
}
