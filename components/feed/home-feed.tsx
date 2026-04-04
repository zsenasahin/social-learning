'use client'

import { useState } from 'react'
import { PostCard } from '@/components/feed/post-card'
import type { Post } from '@/lib/types'
import { cn } from '@/lib/utils'

const feedTabs = [
  { id: 'foryou', label: 'Senin İçin' },
  { id: 'following', label: 'Takip Edilenler' },
  { id: 'trending', label: 'Trendler' },
] as const

export function HomeFeed({
  forYou,
  following,
  trending,
}: {
  forYou: Post[]
  following: Post[]
  trending: Post[]
}) {
  const [activeTab, setActiveTab] = useState<(typeof feedTabs)[number]['id']>('foryou')

  const posts =
    activeTab === 'foryou' ? forYou : activeTab === 'following' ? following : trending

  return (
    <>
      <div className="sticky top-16 z-20 -mx-4 border-b border-border bg-background/95 backdrop-blur px-4 lg:top-16">
        <div className="flex">
          {feedTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-4 text-sm font-medium transition-colors relative',
                activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">
            {activeTab === 'following'
              ? 'Takip ettiğin kişilerden henüz gönderi yok veya giriş yapmadın.'
              : 'Henüz gönderi yok. İlk paylaşan sen ol!'}
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </>
  )
}
