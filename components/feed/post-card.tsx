'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Heart, MessageCircle, Repeat2, Bookmark, Share, MoreHorizontal, Check, Clock, Circle, Trash2, Edit3 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RichEditor } from '@/components/create/rich-editor'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Post } from '@/lib/types'
import {
  togglePostLikeAction,
  togglePostRepostAction,
  togglePostSaveAction,
  deletePostAction,
  editPostAction,
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
  
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.rawBody || post.content)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  function requireLogin(): boolean {
    if (!sessionUser) {
      router.push('/auth/login')
      return false
    }
    return true
  }

  function handleDelete() {
    if (!confirm('Bu paylaşımı silmek istediğinize emin misiniz?')) return
    startTransition(async () => {
      await deletePostAction(post.id)
    })
  }

  async function handleSaveEdit() {
    setIsSavingEdit(true)
    const res = await editPostAction(post.id, editContent)
    setIsSavingEdit(false)
    if (res?.error) {
      alert(res.error)
    } else {
      setIsEditing(false)
    }
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

            {isEditing ? (
              <div className="mt-4">
                <RichEditor value={editContent} onChange={setEditContent} />
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSavingEdit}>İptal</Button>
                  <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
                    {isSavingEdit ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
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
                  <div className="mt-8 mb-4 relative max-w-2xl mx-auto">
                    <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-gradient-to-b from-primary/80 via-primary/40 to-transparent rounded-full" />
                    <div className="space-y-6">
                      {post.roadmapSteps.map((step, index) => (
                        <div key={step.id} className="relative flex items-start gap-6 group">
                          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-card border-4 border-background shadow-sm ring-2 ring-primary/20 text-primary font-bold text-lg transition-transform group-hover:scale-110">
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 bg-secondary/30 border border-border/50 rounded-2xl p-5 hover:bg-secondary/50 transition-colors shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <h4 className="font-bold text-foreground text-lg">{step.title}</h4>
                              <div className="flex items-center gap-2">
                                {step.difficulty && step.difficulty !== 'beginner' && (
                                  <span className={cn(
                                    "px-2.5 py-1 text-xs font-semibold rounded-full",
                                    step.difficulty === 'intermediate' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                                  )}>
                                    {step.difficulty === 'intermediate' ? 'Orta' : 'İleri'}
                                  </span>
                                )}
                                {step.duration && (
                                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {step.duration}
                                  </span>
                                )}
                              </div>
                            </div>
                            {step.description && (
                              <p className="text-muted-foreground leading-relaxed text-sm">
                                {step.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sessionUser?.id === post.author.id && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                    <Edit3 className="mr-2 h-4 w-4" />
                    <span>Gönderiyi Düzenle</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Gönderiyi Sil</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
