'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toggleSeriesFollowAction } from '@/app/actions/series'
import { useSessionUser } from '@/components/session-context'

export function EventFollowClient({
  seriesId,
  initialFollowing,
}: {
  seriesId: string
  initialFollowing: boolean
}) {
  const router = useRouter()
  const sessionUser = useSessionUser()
  const [following, setFollowing] = useState(initialFollowing)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setFollowing(initialFollowing)
  }, [initialFollowing])

  return (
    <Button
      type="button"
      className="mt-4"
      variant={following ? 'secondary' : 'default'}
      disabled={pending}
      onClick={() => {
        if (!sessionUser) {
          router.push('/auth/login')
          return
        }
        startTransition(async () => {
          const res = await toggleSeriesFollowAction(seriesId)
          if (res.error) return
          setFollowing(Boolean(res.following))
          router.refresh()
        })
      }}
    >
      {following ? 'Takip ediliyor' : 'Seriyi takip et'}
    </Button>
  )
}
