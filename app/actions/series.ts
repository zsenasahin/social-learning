'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createSeriesAction(input: {
  title: string
  description: string
  category: string
  thumbnailUrl: string
  tags: string[]
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş yapmalısınız' }

  const { error } = await supabase.from('series').insert({
    user_id: user.id,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category.trim() || 'Genel',
    thumbnail_url: input.thumbnailUrl.trim() || null,
    tags: input.tags.filter(Boolean).slice(0, 8),
  })

  if (error) return { error: error.message }
  revalidatePath('/events')
  revalidatePath('/explore')
  return { ok: true }
}

export async function toggleSeriesFollowAction(seriesId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş yapmalısınız' }

  const { data: existing } = await supabase
    .from('series_followers')
    .select('series_id')
    .eq('series_id', seriesId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('series_followers').delete().eq('series_id', seriesId).eq('user_id', user.id)
  } else {
    await supabase.from('series_followers').insert({ series_id: seriesId, user_id: user.id })
  }

  revalidatePath('/events')
  revalidatePath(`/events/${seriesId}`)
  return { ok: true, following: !existing }
}
