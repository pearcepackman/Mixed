import { type ReactNode, useEffect, useState } from 'react'

interface Props {
  title: string
  right?: ReactNode
}

export default function StickyHeader({ title, right }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/90 backdrop-blur-md px-4 py-3 transition-all duration-200 ${
        scrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold">{title}</span>
        {right && <div className="text-xs text-muted-foreground">{right}</div>}
      </div>
    </div>
  )
}
