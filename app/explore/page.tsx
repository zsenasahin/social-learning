import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { ExploreView } from '@/components/feed/explore-view'
import { fetchPublicPosts } from '@/lib/data/posts'
import { listSuggestedProfiles, searchProfiles } from '@/lib/data/profiles'
import { fetchAllSeries } from '@/lib/data/series'

type SearchParams = { tab?: string; q?: string; tag?: string }

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const q = (sp.q || '').trim()
  const tag = (sp.tag || '').trim()
  const tabRaw = sp.tab || 'posts'
  const initialTab =
    tabRaw === 'users' || tabRaw === 'events' || tabRaw === 'tags' ? tabRaw : 'posts'

  const [posts, users, events] = await Promise.all([
    fetchPublicPosts(100),
    q ? searchProfiles(q, 40) : listSuggestedProfiles(24),
    fetchAllSeries(60),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="mx-auto max-w-4xl px-4 pb-20 lg:pb-8">
          <ExploreView
            initialTab={initialTab}
            posts={posts}
            users={users}
            events={events}
            initialQuery={q}
            tagFilter={tag}
          />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
