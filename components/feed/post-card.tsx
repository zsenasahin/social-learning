'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Heart, MessageCircle, Repeat2, Bookmark, Share, MoreHorizontal, Check, Clock, Circle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Post } from '@/lib/types'
import {
  togglePostLikeAction,
  togglePostRepostAction,
  togglePostSaveAction,
} from '@/app/actions/posts'
import { useSessionUser } from '@/components/session-context'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter()
  const sessionUser = useSessionUser()
  const [pending, startTransition] = useTransition()
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [isReposted, setIsReposted] = useState(post.isReposted)
  const [repostsCount, setRepostsCount] = useState(post.reposts)
  const [isSaved, setIsSaved] = useState(post.isSaved)

  function requireLogin(): boolean {
    if (!sessionUser) {
      router.push('/auth/login')
      return false
    }
    return true
  }

  function handleLike() {
    if (!requireLogin()) return
    const next = !isLiked
    setIsLiked(next)
    setLikesCount((c) => (next ? c + 1 : Math.max(0, c - 1)))
    startTransition(async () => {
      await togglePostLikeAction(post.id)
      router.refresh()
    })
  }

  function handleRepost() {
    if (!requireLogin()) return
    const next = !isReposted
    setIsReposted(next)
    setRepostsCount((c) => (next ? c + 1 : Math.max(0, c - 1)))
    startTransition(async () => {
      await togglePostRepostAction(post.id)
      router.refresh()
    })
  }

  function handleSave() {
    if (!requireLogin()) return
    setIsSaved(!isSaved)
    startTransition(async () => {
      await togglePostSaveAction(post.id)
      router.refresh()
    })
  }

  return (
    <Card className="border-border bg-card transition-colors hover:bg-secondary/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar className="h-10 w-10 ring-2 ring-transparent transition-all hover:ring-primary">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/profile/${post.author.username}`} className="hover:underline">
                <span className="font-semibold text-foreground">{post.author.name}</span>
              </Link>
              <span className="text-muted-foreground">@{post.author.username}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{post.createdAt}</span>
            </div>

            <div className="mt-2 text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4 prose-a:text-primary hover:prose-a:underline prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-li:my-0.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>

            {post.images && post.images.length > 0 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {post.images.map((src) => (
                  <div key={src} className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                    <Image src={src} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
                  </div>
                ))}
              </div>
            )}


            {post.contentType === 'roadmap' && post.roadmapSteps && (
              <div className="mt-4 space-y-3">
                {post.roadmapSteps.map((step, index) => (
                  <div key={step.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full',
                          step.status === 'completed' && 'bg-accent text-accent-foreground',
                          step.status === 'in-progress' && 'bg-primary text-primary-foreground',
                          step.status === 'upcoming' && 'border-2 border-border bg-secondary text-muted-foreground'
                        )}
                      >
                        {step.status === 'completed' && <Check className="h-4 w-4" />}
                        {step.status === 'in-progress' && <Clock className="h-4 w-4" />}
                        {step.status === 'upcoming' && <Circle className="h-4 w-4" />}
                      </div>
                      {index < post.roadmapSteps!.length - 1 && (
                        <div
                          className={cn(
                            'w-0.5 flex-1 my-1',
                            step.status === 'completed' ? 'bg-accent' : 'bg-border'
                          )}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <h4 className="font-medium text-foreground">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}


            {post.tags && post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/explore?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleLike}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                    isLiked
                      ? 'text-red-500 hover:bg-red-500/10'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
                  <span>{likesCount}</span>
                </button>

                <Link
                  href={`/post/${post.id}`}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments}</span>
                </Link>

                <button
                  type="button"
                  disabled={pending}
                  onClick={handleRepost}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                    isReposted
                      ? 'text-accent hover:bg-accent/10'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Repeat2 className="h-4 w-4" />
                  <span>{repostsCount}</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleSave}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                    isSaved
                      ? 'text-primary hover:bg-primary/10'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current')} />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Share className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
