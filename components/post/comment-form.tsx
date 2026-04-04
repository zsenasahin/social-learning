'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { addCommentAction } from '@/app/actions/posts'
import { useSessionUser } from '@/components/session-context'

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter()
  const user = useSessionUser()
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!user) {
      router.push('/auth/login')
      return
    }
    startTransition(async () => {
      const res = await addCommentAction(postId, body)
      if (res.error) {
        setError(res.error)
        return
      }
      setBody('')
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={user ? 'Yorum yaz…' : 'Yorum için giriş yap'}
        rows={3}
        disabled={pending}
        className="resize-none"
      />
      <Button type="submit" size="sm" disabled={pending || !body.trim()}>
        {pending ? 'Gönderiliyor…' : 'Yorum yap'}
      </Button>
    </form>
  )
}
