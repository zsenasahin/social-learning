'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { PostCard } from '@/components/feed/post-card'
import { EventCard } from '@/components/feed/event-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Post, Event } from '@/lib/types'
import { cn } from '@/lib/utils'

type TabId = 'posts' | 'events' | 'likes'

export function ProfileTabs({
  isOwn,
  posts,
  events,
  likedPosts,
  tabIcons,
}: {
  isOwn: boolean
  posts: Post[]
  events: Event[]
  likedPosts: Post[]
  tabIcons: Record<TabId, LucideIcon>
}) {
  const [activeTab, setActiveTab] = useState<TabId>('posts')

  const tabs: { id: TabId; label: string }[] = [
    { id: 'posts', label: 'Paylaşımlar' },
    { id: 'events', label: 'Etkinlikler' },
    ...(isOwn ? [{ id: 'likes' as const, label: 'Beğeniler' }] : []),
  ]

  return (
    <>
      <div className="mt-4 border-b border-border">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tabIcons[tab.id]
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative',
                  activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length ? (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <EmptyCard message="Henüz paylaşım yok" />
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.length ? (
              events.map((event) => <EventCard key={event.id} event={event} />)
            ) : (
              <Card className="col-span-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">Henüz eğitim serisi yok</p>
                  <Button className="mt-4" asChild>
                    <Link href="/events/create">Seri oluştur</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'likes' && isOwn && (
          <div className="space-y-4">
            {likedPosts.length ? (
              likedPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <EmptyCard message="Beğenilen gönderi yok" />
            )}
          </div>
        )}
      </div>
    </>
  )
}

function EmptyCard({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">{message}</CardContent>
    </Card>
  )
}
