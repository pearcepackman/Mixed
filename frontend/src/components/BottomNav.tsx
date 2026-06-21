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
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-border bg-background">
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
          {({ isActive }) => (
            <>
              <div
                className={`flex items-center justify-center w-11 h-6 rounded-lg transition-colors duration-150 ${
                  isActive ? 'bg-primary/15' : 'bg-transparent'
                }`}
              >
                <Icon size={20} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
