'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { User } from '@/lib/types'
import { toggleFollowAction } from '@/app/actions/social'
import { useSessionUser } from '@/components/session-context'

interface UserCardProps {
  user: User
  variant?: 'default' | 'compact'
}

export function UserCard({ user, variant = 'default' }: UserCardProps) {
  const router = useRouter()
  const sessionUser = useSessionUser()
  const [isFollowing, setIsFollowing] = useState(user.isFollowing)
  const [pending, startTransition] = useTransition()

  function onFollowClick(e: React.MouseEvent) {
    e.preventDefault()
    if (!sessionUser) {
      router.push('/auth/login')
      return
    }
    if (sessionUser.id === user.id) return
    startTransition(async () => {
      const res = await toggleFollowAction(user.id)
      if (res.error) return
      setIsFollowing(Boolean(res.following))
      router.refresh()
    })
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between py-2">
        <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
          </div>
        </Link>
        {sessionUser?.id !== user.id && (
          <Button
            type="button"
            onClick={onFollowClick}
            variant={isFollowing ? 'secondary' : 'default'}
            size="sm"
            className="ml-2"
            disabled={pending}
          >
            {isFollowing ? 'Takipte' : 'Takip et'}
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link href={`/profile/${user.username}`}>
            <Avatar className="h-14 w-14 ring-2 ring-transparent transition-all hover:ring-primary">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/profile/${user.username}`} className="hover:underline">
                  <h4 className="font-semibold text-foreground">{user.name}</h4>
                </Link>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
              {sessionUser?.id !== user.id && (
                <Button
                  type="button"
                  onClick={onFollowClick}
                  variant={isFollowing ? 'secondary' : 'default'}
                  size="sm"
                  disabled={pending}
                >
                  {isFollowing ? 'Takipte' : 'Takip et'}
                </Button>
              )}
            </div>

            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{user.bio}</p>

            {(user.university || user.department) && (
              <p className="mt-1 text-xs text-muted-foreground">
                {user.department && `${user.department}`}
                {user.department && user.university && ' · '}
                {user.university && user.university}
              </p>
            )}

            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                <strong className="text-foreground">{user.followers.toLocaleString()}</strong> takipçi
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{user.following.toLocaleString()}</strong> takip
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
