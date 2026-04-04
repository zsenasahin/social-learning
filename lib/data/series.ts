import { getSupabaseOptional } from '@/lib/supabase/server'
import { mapSeriesToEvent, type SeriesRow } from '@/lib/mappers'
import type { Event } from '@/lib/types'

async function countSeriesFollowers(seriesId: string): Promise<number> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return 0
  const { count, error } = await supabase
    .from('series_followers')
    .select('*', { count: 'exact', head: true })
    .eq('series_id', seriesId)
  if (error) throw error
  return count || 0
}

async function countPostsInSeries(seriesId: string): Promise<number> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return 0
  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('series_id', seriesId)
  if (error) throw error
  return count || 0
}

export async function enrichSeriesRows(
  rows: SeriesRow[],
  viewerId: string | null
): Promise<Event[]> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const followingSet = new Set<string>()
  if (viewerId && rows.length) {
    const ids = rows.map((r) => r.id)
    const { data: subs } = await supabase
      .from('series_followers')
      .select('series_id')
      .eq('user_id', viewerId)
      .in('series_id', ids)
    for (const s of subs || []) followingSet.add(s.series_id)
  }

  const out: Event[] = []
  for (const row of rows) {
    const [followers, totalPosts] = await Promise.all([
      countSeriesFollowers(row.id),
      countPostsInSeries(row.id),
    ])
    out.push(
      mapSeriesToEvent(row, totalPosts, followers, followingSet.has(row.id))
    )
  }
  return out
}

export async function fetchAllSeries(limit = 60) {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('series')
    .select(
      `
      id,
      title,
      description,
      thumbnail_url,
      category,
      tags,
      created_at,
      author:profiles!series_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        university,
        department
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return enrichSeriesRows((data || []) as unknown as SeriesRow[], user?.id ?? null)
}

export async function fetchSeriesById(id: string): Promise<Event | null> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('series')
    .select(
      `
      id,
      title,
      description,
      thumbnail_url,
      category,
      tags,
      created_at,
      author:profiles!series_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        university,
        department
      )
    `
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  const list = await enrichSeriesRows([data as unknown as SeriesRow], user?.id ?? null)
  return list[0] ?? null
}

export async function fetchMySeriesTitles(limit = 40): Promise<{ id: string; title: string }[]> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('series')
    .select('id, title')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []) as { id: string; title: string }[]
}

export async function fetchSeriesByAuthor(authorId: string, limit = 40) {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('series')
    .select(
      `
      id,
      title,
      description,
      thumbnail_url,
      category,
      tags,
      created_at,
      author:profiles!series_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        university,
        department
      )
    `
    )
    .eq('user_id', authorId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return enrichSeriesRows((data || []) as unknown as SeriesRow[], user?.id ?? null)
}
