'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import LiveBadge from '@/components/ui/LiveBadge'

const navItems = [
  { href: '/',         label: 'Dawn',    icon: '🌅' },
  { href: '/models',   label: 'Models',  icon: '☀️' },
  { href: '/keywords', label: 'Keywords', icon: '🌇' },
  { href: '/github',   label: 'GitHub',  icon: '🌙' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        style={{
          background: 'rgba(9, 6, 15, 0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-display text-lg font-bold gradient-text-rise">
              Horizon
            </span>
            <LiveBadge />
          </Link>

          {/* 네비 */}
          <ul className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body transition-colors duration-200'
                    )}
                    style={{
                      color: isActive ? 'var(--horizon-fire)' : 'var(--text-muted)',
                      background: isActive ? 'rgba(34,211,238,0.08)' : undefined,
                    }}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* 지평선 구분선 */}
      <div className="horizon-divider" />
    </header>
  )
}
