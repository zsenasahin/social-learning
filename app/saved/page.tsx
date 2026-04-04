import Link from 'next/link'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { PostCard } from '@/components/feed/post-card'
import { fetchSavedPosts } from '@/lib/data/posts'
import { Button } from '@/components/ui/button'
import { Bookmark } from 'lucide-react'

export default async function SavedPage() {
  const posts = await fetchSavedPosts(80)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="mx-auto max-w-2xl px-4 pb-20 lg:pb-8">
          <div className="py-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bookmark className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Kaydedilenler</h1>
              <p className="text-sm text-muted-foreground">Son kaydettiğin gönderiler</p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>Henüz kayıtlı gönderi yok.</p>
              <p className="text-sm mt-2">Gönderi kartındaki yer imi ikonuna tıklayarak kaydedebilirsin.</p>
              <Button className="mt-4" asChild>
                <Link href="/auth/login">Giriş yap</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
