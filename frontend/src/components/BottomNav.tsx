import { NavLink } from 'react-router'
import { FlaskConical, Compass, BookOpen, User } from 'lucide-react'

const tabs = [
  { to: '/cabinet', icon: FlaskConical, label: 'Cabinet' },
  { to: '/discover', icon: Compass, label: 'Discover' },
  { to: '/log', icon: BookOpen, label: 'Log' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t border-border bg-background">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150 min-h-[44px] ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`
          }
        >
          <Icon size={20} />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
