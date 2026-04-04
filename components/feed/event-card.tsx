'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Users, BookOpen } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Event } from '@/lib/types'
import { toggleSeriesFollowAction } from '@/app/actions/series'
import { useSessionUser } from '@/components/session-context'

interface EventCardProps {
  event: Event
  variant?: 'default' | 'compact'
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const router = useRouter()
  const sessionUser = useSessionUser()
  const [isFollowing, setIsFollowing] = useState(event.isFollowing ?? false)
  const [pending, startTransition] = useTransition()
  const followers = event.followers

  useEffect(() => {
    setIsFollowing(event.isFollowing ?? false)
  }, [event.isFollowing])

  function onFollow(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!sessionUser) {
      router.push('/auth/login')
      return
    }
    startTransition(async () => {
      const res = await toggleSeriesFollowAction(event.id)
      if (res.error) return
      setIsFollowing(Boolean(res.following))
      router.refresh()
    })
  }

  if (variant === 'compact') {
    return (
      <Link href={`/events/${event.id}`}>
        <Card className="border-border bg-card transition-all hover:border-primary/50 hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex gap-3">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                <Image src={event.thumbnail} alt={event.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm truncate">{event.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">@{event.author.username}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {event.totalPosts}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {followers}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg">
      <Link href={`/events/${event.id}`}>
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={event.thumbnail}
            alt={event.title}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              {event.category}
            </span>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/events/${event.id}`}>
          <h3 className="font-bold text-foreground text-lg hover:text-primary transition-colors">{event.title}</h3>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <Link
            href={`/profile/${event.author.username}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={event.author.avatar} alt={event.author.name} />
              <AvatarFallback>{event.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{event.author.name}</p>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {event.totalPosts} ders
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {followers}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        <Button
          type="button"
          onClick={onFollow}
          variant={isFollowing ? 'secondary' : 'default'}
          className="mt-4 w-full"
          disabled={pending}
        >
          {isFollowing ? 'Takip ediliyor' : 'Takip et'}
        </Button>
      </CardContent>
    </Card>
  )
}
