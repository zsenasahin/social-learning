'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PostCard } from '@/components/feed/post-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Post, User } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Users, UserPlus, Compass } from 'lucide-react'

const filters = [
  { id: 'all', label: 'Tüm paylaşımlar' },
  { id: 'code', label: 'Kod' },
  { id: 'roadmap', label: 'Yol haritası' },
  { id: 'table', label: 'Tablo' },
] as const

export function FollowingFeed({
  initialPosts,
  followingUsers,
}: {
  initialPosts: Post[]
  followingUsers: User[]
}) {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]['id']>('all')

  const filteredPosts =
    activeFilter === 'all'
      ? initialPosts
      : initialPosts.filter((post) => post.contentType === activeFilter)

  return (
    <>
      <div className="py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Takip edilenler</h1>
            <p className="text-sm text-muted-foreground">{followingUsers.length} kişi takip ediyorsun</p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Takip ettiklerin</h3>
            <Link href="/explore?tab=users" className="text-sm text-primary hover:underline">
              Tümünü gör
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {followingUsers.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex flex-col items-center gap-2 group"
              >
                <Avatar className="h-14 w-14 ring-2 ring-transparent group-hover:ring-primary transition-all">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
            ))}
            <Link href="/explore?tab=users" className="flex flex-col items-center gap-2 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border group-hover:border-primary transition-colors">
                <UserPlus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Bul</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              activeFilter === filter.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <Compass className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Henüz paylaşım yok</h3>
            <p className="text-muted-foreground text-center mt-2 max-w-sm">
              Takip ettiğin kişiler henüz paylaşmamış veya giriş yapmadın. Keşfet bölümüne göz at.
            </p>
            <Link href="/explore">
              <Button className="mt-4 gap-2">
                <Compass className="h-4 w-4" />
                Keşfet
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </>
  )
}
