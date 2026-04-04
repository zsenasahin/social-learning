import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { PostCard } from '@/components/feed/post-card'
import { fetchPostById } from '@/lib/data/posts'
import { fetchCommentsForPost } from '@/lib/data/comments'
import { CommentForm } from '@/components/post/comment-form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type Props = { params: Promise<{ id: string }> }

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params
  const post = await fetchPostById(id)
  if (!post) notFound()

  const comments = await fetchCommentsForPost(id)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="mx-auto max-w-2xl px-4 pb-20 lg:pb-8">
          <div className="py-4">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Ana sayfa
              </Link>
            </Button>
          </div>
          <PostCard post={post} />

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Yorumlar ({comments.length})</h2>
            <CommentForm postId={id} />
            <div className="mt-6 space-y-4">
              {comments.map((c) => (
                <Card key={c.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Link href={`/profile/${c.author.username}`}>
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={c.author.avatar} alt={c.author.name} />
                          <AvatarFallback>{c.author.name[0]}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{c.author.name}</span>
                          <span className="text-xs text-muted-foreground">{c.createdAt}</span>
                        </div>
                        <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{c.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
