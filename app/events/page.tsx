import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { EventsBrowser } from '@/components/feed/events-browser'
import { fetchAllSeries } from '@/lib/data/series'

export default async function EventsPage() {
  const events = await fetchAllSeries(80)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="mx-auto max-w-5xl px-4 pb-20 lg:pb-8">
          <EventsBrowser events={events} />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
