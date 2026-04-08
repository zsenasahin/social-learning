import { CreatePostPageClient } from '@/components/create/create-post-page'
import { fetchMySeriesTitles } from '@/lib/data/series'

export default async function CreatePage({ 
  searchParams, 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const mySeries = await fetchMySeriesTitles(40)
  const resolvedSearchParams = await searchParams
  const initialSeriesId = typeof resolvedSearchParams.seriesId === 'string' ? resolvedSearchParams.seriesId : 'none'

  return <CreatePostPageClient mySeries={mySeries} initialSeriesId={initialSeriesId} />
}
