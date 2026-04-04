'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  Compass,
  Calendar,
  Bookmark,
  Bell,
  Settings,
  PenSquare,
  GraduationCap,
  LogIn,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useSessionUser } from '@/components/session-context'

const navigation = [
  { name: 'Ana Sayfa', href: '/', icon: Home },
  { name: 'Takip Edilenler', href: '/following', icon: Users },
  { name: 'Keşfet', href: '/explore', icon: Compass },
  { name: 'Etkinlikler', href: '/events', icon: Calendar },
  { name: 'Kaydedilenler', href: '/saved', icon: Bookmark },
  { name: 'Bildirimler', href: '/notifications', icon: Bell },
]

export function Sidebar() {
  const pathname = usePathname()
  const user = useSessionUser()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card hidden lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">StudyFlow</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4">
          <Link href="/create">
            <Button className="w-full gap-2" size="lg">
              <PenSquare className="h-5 w-5" />
              Paylaşım Yap
            </Button>
          </Link>
        </div>

        <div className="border-t border-border p-4">
          {user ? (
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
              </div>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <LogIn className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Giriş yap</p>
                <p className="text-xs text-muted-foreground">Hesabınla devam et</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}
