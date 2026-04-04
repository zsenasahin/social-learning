'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toggleFollowAction } from '@/app/actions/social'

export function FollowButton({
  targetUserId,
  initialFollowing,
}: {
  targetUserId: string
  initialFollowing: boolean
}) {
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [pending, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      const res = await toggleFollowAction(targetUserId)
      if (res.error) return
      setFollowing(Boolean(res.following))
      router.refresh()
    })
  }

  return (
    <Button variant={following ? 'secondary' : 'default'} disabled={pending} onClick={onClick}>
      {following ? 'Takipte' : 'Takip et'}
    </Button>
  )
}
