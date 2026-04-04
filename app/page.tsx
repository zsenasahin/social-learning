import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { RightSidebar } from '@/components/layout/right-sidebar'
import { HomeFeed } from '@/components/feed/home-feed'
import { fetchPublicPosts, fetchFollowingPosts, fetchTrendingPosts } from '@/lib/data/posts'

export default async function HomePage() {
  const [forYou, following, trending] = await Promise.all([
    fetchPublicPosts(50),
    fetchFollowingPosts(50),
    fetchTrendingPosts(50),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />

        <main className="mx-auto max-w-7xl px-4 pb-20 lg:pb-8">
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <HomeFeed forYou={forYou} following={following} trending={trending} />
            </div>
            <RightSidebar />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
