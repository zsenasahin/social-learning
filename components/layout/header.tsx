'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Bell, GraduationCap } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSessionUser } from '@/components/session-context'

export function Header() {
  const user = useSessionUser()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">StudyFlow</span>
        </Link>

        <div className="hidden lg:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Konu, kişi veya etiket ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={searchQuery.trim() ? `/explore?q=${encodeURIComponent(searchQuery.trim())}` : '/explore'}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary lg:hidden"
          >
            <Search className="h-5 w-5" />
          </Link>

          <Link
            href="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          </Link>

          {user ? (
            <Link href={`/profile/${user.username}`} className="hidden lg:block">
              <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="hidden lg:inline-flex text-sm font-medium text-primary hover:underline px-2"
            >
              Giriş
            </Link>
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 lg:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>
    </header>
  )
}
