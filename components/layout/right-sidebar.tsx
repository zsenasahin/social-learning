import Link from 'next/link'
import { TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCard } from '@/components/feed/user-card'
import { EventCard } from '@/components/feed/event-card'
import { listSuggestedProfiles } from '@/lib/data/profiles'
import { fetchAllSeries } from '@/lib/data/series'

const trendingTopics = [
  { tag: 'React', posts: 1234 },
  { tag: 'TypeScript', posts: 1123 },
  { tag: 'Python', posts: 1654 },
  { tag: 'Flutter', posts: 1234 },
  { tag: 'Kariyer', posts: 512 },
]

export async function RightSidebar() {
  let suggested: Awaited<ReturnType<typeof listSuggestedProfiles>> = []
  let events: Awaited<ReturnType<typeof fetchAllSeries>> = []
  try {
    ;[suggested, events] = await Promise.all([listSuggestedProfiles(4), fetchAllSeries(6)])
  } catch {
    /* Supabase kapalı veya hata */
  }

  const compactEvents = events.slice(0, 2)

  return (
    <aside className="hidden xl:block w-80 shrink-0">
      <div className="sticky top-20 space-y-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Trend konular
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <Link
                  key={topic.tag}
                  href={`/explore?tag=${encodeURIComponent(topic.tag)}`}
                  className="flex items-center justify-between group"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      #{topic.tag}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ~{topic.posts.toLocaleString('tr-TR')} paylaşım
                    </p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Önerilen kişiler</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {suggested.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">Kayıtlı kullanıcı yok.</p>
              ) : (
                suggested.slice(0, 3).map((u) => <UserCard key={u.id} user={u} variant="compact" />)
              )}
            </div>
            <Link
              href="/explore?tab=users"
              className="mt-3 flex items-center justify-center gap-1 text-sm text-primary hover:underline"
            >
              Daha fazla göster
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Popüler etkinlikler</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {compactEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz seri yok.</p>
            ) : (
              compactEvents.map((event) => <EventCard key={event.id} event={event} variant="compact" />)
            )}
            <Link
              href="/events"
              className="mt-2 flex items-center justify-center gap-1 text-sm text-primary hover:underline"
            >
              Tüm etkinlikler
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
