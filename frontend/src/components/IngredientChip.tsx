import { X } from 'lucide-react'

interface Props {
  name: string
  variant?: 'owned' | 'missing'
  onRemove?: () => void
}

export default function IngredientChip({ name, variant = 'owned', onRemove }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors duration-150 ${
        variant === 'owned'
          ? 'bg-primary/15 text-primary'
          : 'border border-border text-muted-foreground'
      }`}
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors duration-150"
          aria-label={`Remove ${name}`}
        >
          <X size={12} />
        </button>
      )}
    </span>
  )
}
