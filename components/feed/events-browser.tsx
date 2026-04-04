'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { EventCard } from '@/components/feed/event-card'
import { Button } from '@/components/ui/button'
import type { Event } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Plus,
  Filter,
  Code,
  Palette,
  Smartphone,
  Database,
  Brain,
  Briefcase,
  TrendingUp,
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

const sortOptions = [
  { id: 'popular', label: 'En popüler' },
  { id: 'recent', label: 'En yeni' },
  { id: 'followers', label: 'En çok takipçi' },
] as const

function norm(s: string) {
  return s.toLowerCase()
}

function eventInCategory(cat: string, e: Event): boolean {
  if (cat === 'all') return true
  const t = `${e.title} ${e.description} ${e.category} ${e.tags.join(' ')}`.toLowerCase()
  const map: Record<string, string[]> = {
    frontend: ['frontend', 'react', 'javascript', 'web'],
    mobile: ['mobile', 'flutter', 'dart', 'ios', 'android'],
    backend: ['backend', 'java', 'node', 'api', 'spring'],
    design: ['tasarım', 'design', 'ui', 'ux', 'figma'],
    ai: ['yapay', 'ai', 'ml', 'data', 'python', 'veri'],
    career: ['kariyer', 'career', 'iş'],
  }
  return (map[cat] || []).some((k) => t.includes(k))
}

export function EventsBrowser({ events }: { events: Event[] }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]['id']>('popular')

  const filtered = useMemo(() => {
    let list = events.filter((e) => eventInCategory(activeCategory, e))
    if (sortBy === 'recent') {
      list = [...list].sort((a, b) => norm(b.createdAt).localeCompare(norm(a.createdAt)))
    } else if (sortBy === 'followers') {
      list = [...list].sort((a, b) => b.followers - a.followers)
    } else {
      list = [...list].sort((a, b) => b.totalPosts + b.followers - (a.totalPosts + a.followers))
    }
    return list
  }, [events, activeCategory, sortBy])

  return (
    <>
      <div className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Eğitim serileri</h1>
          <p className="text-muted-foreground mt-1">Adım adım öğrenme yolculukları oluştur ve takip et</p>
        </div>
        <Link href="/events/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Seri oluştur
          </Button>
        </Link>
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

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sıralama:</span>
          <div className="flex gap-1">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSortBy(option.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-sm transition-colors',
                  sortBy === option.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} seri</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        <Link href="/events/create" className="group">
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-6 transition-all hover:border-primary hover:bg-secondary/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-foreground">Yeni seri oluştur</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Bilgini paylaşarak başkalarının öğrenmesine katkı sağla
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-foreground mb-4">Öne çıkanlar</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {filtered.slice(0, 2).map((event) => (
            <div key={event.id} className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80" />
              <div className="relative p-6 text-primary-foreground">
                <span className="inline-block rounded-full bg-background/20 px-3 py-1 text-xs font-medium mb-3">
                  {event.category}
                </span>
                <h3 className="text-xl font-bold">{event.title}</h3>
                <p className="mt-2 text-primary-foreground/80 line-clamp-2">{event.description}</p>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span>{event.totalPosts} ders</span>
                  <span>{event.followers.toLocaleString('tr-TR')} takipçi</span>
                </div>
                <Button variant="secondary" className="mt-4" asChild>
                  <Link href={`/events/${event.id}`}>Seriye başla</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
