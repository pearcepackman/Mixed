import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  hint?: string
  action?: ReactNode
}

export default function EmptyState({ icon: Icon, title, description, hint, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 px-6">
      <div className="w-16 h-16 rounded-full border border-dashed border-border bg-muted flex items-center justify-center text-primary">
        <Icon size={30} strokeWidth={1.5} />
      </div>
      <p className="text-base font-medium">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[250px]">{description}</p>
      {hint && <p className="text-xs text-muted-foreground/60 mt-1">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
