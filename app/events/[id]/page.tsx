import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { fetchSeriesById } from '@/lib/data/series'
import { fetchPostsBySeriesId } from '@/lib/data/posts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { EventFollowClient } from '@/components/feed/event-follow-client'
import { PostCard } from '@/components/feed/post-card'

type Props = { params: Promise<{ id: string }> }

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  const event = await fetchSeriesById(id)
  if (!event) notFound()

  const postsInSeries = await fetchPostsBySeriesId(id, 80)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="mx-auto max-w-3xl px-4 pb-20 lg:pb-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border">
            <Image src={event.thumbnail} alt={event.title} fill className="object-cover" />
          </div>
          <div className="mt-6">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {event.category}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-foreground">{event.title}</h1>
            <p className="mt-2 text-muted-foreground">{event.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Link href={`/profile/${event.author.username}`} className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={event.author.avatar} alt={event.author.name} />
                  <AvatarFallback>{event.author.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{event.author.name}</span>
              </Link>
              <span className="text-sm text-muted-foreground">{event.totalPosts} ders</span>
              <span className="text-sm text-muted-foreground">{event.followers} takipçi</span>
            </div>
            <EventFollowClient seriesId={event.id} initialFollowing={event.isFollowing ?? false} />
          </div>

          <h2 className="mt-10 text-lg font-semibold text-foreground">Serideki gönderiler</h2>
          <div className="mt-4 space-y-4">
            {postsInSeries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Bu seriye bağlı gönderi yok. Gönderi oluştururken seri bağlantısı yakında eklenebilir; şimdilik
                gönderileri seriye SQL veya Supabase panelinden `series_id` ile ilişkilendirebilirsin.
              </p>
            ) : (
              postsInSeries.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>

          <div className="mt-8">
            <Button variant="outline" asChild>
              <Link href="/events">Tüm seriler</Link>
            </Button>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
