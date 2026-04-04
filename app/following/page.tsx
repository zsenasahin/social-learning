import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { RightSidebar } from '@/components/layout/right-sidebar'
import { FollowingFeed } from '@/components/feed/following-feed'
import { fetchFollowingPosts } from '@/lib/data/posts'
import { fetchFollowingList } from '@/lib/data/profiles'

export default async function FollowingPage() {
  const [followingPosts, followingUsers] = await Promise.all([
    fetchFollowingPosts(80),
    fetchFollowingList(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />

        <main className="mx-auto max-w-7xl px-4 pb-20 lg:pb-8">
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <FollowingFeed initialPosts={followingPosts} followingUsers={followingUsers} />
            </div>
            <RightSidebar />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
