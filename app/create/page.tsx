import { CreatePostPageClient } from '@/components/create/create-post-page'
import { fetchMySeriesTitles } from '@/lib/data/series'

export default async function CreatePage() {
  const mySeries = await fetchMySeriesTitles(40)
  return <CreatePostPageClient mySeries={mySeries} />
}
