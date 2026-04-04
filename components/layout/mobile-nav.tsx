'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Users, Compass, PenSquare, User } from 'lucide-react'
import { useSessionUser } from '@/components/session-context'

const navigation = [
  { name: 'Ana Sayfa', href: '/', icon: Home },
  { name: 'Takip', href: '/following', icon: Users },
  { name: 'Oluştur', href: '/create', icon: PenSquare },
  { name: 'Keşfet', href: '/explore', icon: Compass },
]

export function MobileNav() {
  const pathname = usePathname()
  const user = useSessionUser()
  const profileHref = user ? `/profile/${user.username}` : '/auth/login'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const isCreate = item.name === 'Oluştur'

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 transition-colors',
                isCreate ? 'relative' : isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {isCreate ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg -mt-4">
                  <item.icon className="h-6 w-6" />
                </div>
              ) : (
                <>
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs">{item.name}</span>
                </>
              )}
            </Link>
          )
        })}
        <Link
          href={profileHref}
          className={cn(
            'flex flex-col items-center gap-1 p-2 transition-colors',
            pathname.startsWith('/profile') ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <User className="h-6 w-6" />
          <span className="text-xs">Profil</span>
        </Link>
      </div>
    </nav>
  )
}
