'use client'

import { useState, useMemo } from 'react'
import { PostCard } from '@/components/feed/post-card'
import { UserCard } from '@/components/feed/user-card'
import { EventCard } from '@/components/feed/event-card'
import type { Post, User, Event } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Search,
  TrendingUp,
  Code,
  Palette,
  Smartphone,
  Database,
  Brain,
  Briefcase,
} from 'lucide-react'

const categories = [
  { id: 'all', label: 'Tümü', icon: TrendingUp },
  { id: 'frontend', label: 'Frontend', icon: Code },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'backend', label: 'Backend', icon: Database },
  { id: 'design', label: 'Tasarım', icon: Palette },
  { id: 'ai', label: 'Yapay zeka', icon: Brain },
  { id: 'career', label: 'Kariyer', icon: Briefcase },
]

const tabs = [
  { id: 'posts', label: 'Paylaşımlar' },
  { id: 'users', label: 'Kişiler' },
  { id: 'events', label: 'Etkinlikler' },
  { id: 'tags', label: 'Etiketler' },
] as const

function postMatchesCategory(cat: string, post: Post): boolean {
  if (cat === 'all') return true
  const text = `${post.content} ${post.tags?.join(' ') || ''}`.toLowerCase()
  const labels: Record<string, string[]> = {
    frontend: ['frontend', 'react', 'javascript', 'web'],
    mobile: ['mobile', 'flutter', 'swift', 'android', 'ios'],
    backend: ['backend', 'java', 'node', 'api', 'spring'],
    design: ['tasarım', 'design', 'ui', 'ux', 'figma'],
    ai: ['yapay', 'ai', 'ml', 'data', 'python'],
    career: ['kariyer', 'career', 'iş'],
  }
  const keys = labels[cat] || []
  return keys.some((k) => text.includes(k))
}

function eventMatchesCategory(cat: string, event: Event): boolean {
  if (cat === 'all') return true
  const text = `${event.title} ${event.description} ${event.category} ${event.tags.join(' ')}`.toLowerCase()
  const labels: Record<string, string[]> = {
    frontend: ['frontend', 'react', 'javascript', 'web'],
    mobile: ['mobile', 'flutter', 'swift', 'android', 'ios'],
    backend: ['backend', 'java', 'node', 'api', 'spring'],
    design: ['tasarım', 'design', 'ui', 'ux', 'figma'],
    ai: ['yapay', 'ai', 'ml', 'data', 'python'],
    career: ['kariyer', 'career', 'iş'],
  }
  const keys = labels[cat] || []
  return keys.some((k) => text.includes(k))
}

export function ExploreView({
  initialTab,
  posts,
  users,
  events,
  initialQuery,
  tagFilter,
}: {
  initialTab: (typeof tabs)[number]['id']
  posts: Post[]
  users: User[]
  events: Event[]
  initialQuery: string
  tagFilter: string
}) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState(initialQuery || tagFilter)

  const tagNorm = tagFilter.trim().toLowerCase()

  const filteredPosts = useMemo(() => {
    let list = posts
    if (tagNorm) {
      list = list.filter(
        (p) =>
          p.tags?.some((t) => t.toLowerCase().includes(tagNorm)) ||
          p.content.toLowerCase().includes(tagNorm)
      )
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.author.username.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (activeCategory !== 'all') {
      list = list.filter((p) => postMatchesCategory(activeCategory, p))
    }
    return list
  }, [posts, searchQuery, tagNorm, activeCategory])

  const filteredEvents = useMemo(() => {
    let list = events
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (tagNorm) {
      list = list.filter((e) => e.tags.some((t) => t.toLowerCase().includes(tagNorm)))
    }
    if (activeCategory !== 'all') {
      list = list.filter((e) => eventMatchesCategory(activeCategory, e))
    }
    return list
  }, [events, searchQuery, tagNorm, activeCategory])

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.bio && u.bio.toLowerCase().includes(q))
    )
  }, [users, searchQuery])

  const tagCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of posts) {
      for (const t of p.tags || []) {
        m.set(t, (m.get(t) || 0) + 1)
      }
    }
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
  }, [posts])

  return (
    <>
      <div className="py-6">
        <h1 className="text-2xl font-bold text-foreground">Keşfet</h1>
        <p className="text-muted-foreground mt-1">Yeni içerikler, kişiler ve etkinlikler</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Konu, kişi veya etiket ara..."
          className="w-full rounded-xl border border-border bg-card py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </button>
          )
        })}
      </div>

      <div className="border-b border-border mb-6">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors relative',
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

      <div>
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {filteredPosts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Sonuç bulunamadı.</p>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
            {filteredUsers.length === 0 && (
              <p className="col-span-2 text-center text-muted-foreground py-8">Kullanıcı yok.</p>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            {filteredEvents.length === 0 && (
              <p className="col-span-2 text-center text-muted-foreground py-8">Etkinlik yok.</p>
            )}
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tagCounts.map(([tag, count], index) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag)}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:bg-secondary/30 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">#{tag}</p>
                    <p className="text-sm text-muted-foreground">{count.toLocaleString('tr-TR')} paylaşım</p>
                  </div>
                </div>
              </button>
            ))}
            {tagCounts.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-8">Henüz etiket yok.</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
