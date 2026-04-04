import { getSupabaseOptional } from '@/lib/supabase/server'
import { mapPostRows, type ProfileRow } from '@/lib/mappers'

type PostRow = {
  id: string
  body: string
  content_type: string
  tags: string[] | null
  created_at: string
  user_id: string
  author: ProfileRow
}

const POST_LIST_SELECT = `
  id,
  body,
  content_type,
  tags,
  created_at,
  user_id,
  visibility,
  author:profiles!posts_user_id_fkey (
    id,
    username,
    display_name,
    avatar_url,
    bio,
    university,
    department
  )
`

async function enrichPosts(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseOptional>>>,
  rows: PostRow[] | null,
  viewerId: string | null
) {
  if (!rows?.length) return []
  const ids = rows.map((r) => r.id)
  const [likesRes, commentsRes, repostsRes, myLikesRes, myRepostsRes, mySavesRes] =
    await Promise.all([
      supabase.from('post_likes').select('post_id').in('post_id', ids),
      supabase.from('comments').select('post_id').in('post_id', ids),
      supabase.from('post_reposts').select('post_id').in('post_id', ids),
      viewerId
        ? supabase.from('post_likes').select('post_id').eq('user_id', viewerId).in('post_id', ids)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
      viewerId
        ? supabase.from('post_reposts').select('post_id').eq('user_id', viewerId).in('post_id', ids)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
      viewerId
        ? supabase.from('post_saves').select('post_id').eq('user_id', viewerId).in('post_id', ids)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
    ])

  const myLikes = new Set((myLikesRes.data || []).map((r) => r.post_id))
  const myReposts = new Set((myRepostsRes.data || []).map((r) => r.post_id))
  const mySaves = new Set((mySavesRes.data || []).map((r) => r.post_id))

  return mapPostRows(
    rows,
    likesRes.data,
    commentsRes.data,
    repostsRes.data,
    myLikes,
    myReposts,
    mySaves
  )
}

export async function fetchPublicPosts(limit = 50) {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: publicPosts, error: pubErr } = await supabase
    .from('posts')
    .select(POST_LIST_SELECT)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (pubErr) throw pubErr

  type Row = PostRow & { visibility?: string }
  let merged: Row[] = [...((publicPosts || []) as Row[])]

  if (user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
    const followingIds = (follows || []).map((f) => f.following_id)

    if (followingIds.length) {
      const { data: followerOnly, error: foErr } = await supabase
        .from('posts')
        .select(POST_LIST_SELECT)
        .eq('visibility', 'followers')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (foErr) throw foErr
      merged = merged.concat((followerOnly || []) as Row[])
    }

    const { data: ownPrivate, error: prErr } = await supabase
      .from('posts')
      .select(POST_LIST_SELECT)
      .eq('visibility', 'private')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (prErr) throw prErr
    merged = merged.concat((ownPrivate || []) as Row[])
  }

  const byId = new Map<string, Row>()
  for (const r of merged) {
    byId.set(r.id, r)
  }
  const sorted = Array.from(byId.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const trimmed = sorted.slice(0, limit)

  return enrichPosts(supabase, trimmed as unknown as PostRow[], user?.id ?? null)
}

export async function fetchFollowingPosts(limit = 50) {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: follows, error: fe } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)
  if (fe) throw fe
  const followingIds = (follows || []).map((f) => f.following_id)
  if (!followingIds.length) return []

  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_SELECT)
    .in('user_id', followingIds)
    .in('visibility', ['public', 'followers'])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return enrichPosts(supabase, data as unknown as PostRow[], user.id)
}

export async function fetchTrendingPosts(limit = 50) {
  const posts = await fetchPublicPosts(120)
  return [...posts].sort((a, b) => b.likes + b.reposts - (a.likes + a.reposts)).slice(0, limit)
}

export async function fetchPostsByAuthor(authorId: string, limit = 80) {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_SELECT)
    .eq('user_id', authorId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  const rows = (data || []).filter(
    (r: { visibility?: string }) => r.visibility !== 'private' || user?.id === authorId
  ) as unknown as PostRow[]
  return enrichPosts(supabase, rows, user?.id ?? null)
}

export async function fetchPostById(postId: string) {
  const supabase = await getSupabaseOptional()
  if (!supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_SELECT)
    .eq('id', postId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  const row = data as unknown as PostRow & { visibility: string }
  if (row.visibility === 'private' && user?.id !== row.user_id) return null
  if (row.visibility === 'followers' && user?.id !== row.user_id) {
    if (!user) return null
    const { data: fol } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', row.user_id)
      .maybeSingle()
    if (!fol) return null
  }

  const list = await enrichPosts(supabase, [row], user?.id ?? null)
  return list[0] ?? null
}

export async function fetchLikedPostsForUser(userId: string, limit = 50) {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const {
    data: { user: viewer },
  } = await supabase.auth.getUser()
  if (!viewer || viewer.id !== userId) return []

  const { data: likes, error: le } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (le) throw le
  const ids = (likes || []).map((l) => l.post_id)
  if (!ids.length) return []

  const { data, error } = await supabase.from('posts').select(POST_LIST_SELECT).in('id', ids)

  if (error) throw error
  const byId = new Map((data as unknown as PostRow[]).map((p) => [p.id, p]))
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as PostRow[]
  return enrichPosts(supabase, ordered, viewer.id)
}

export async function fetchPostsBySeriesId(seriesId: string, limit = 50) {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_SELECT)
    .eq('series_id', seriesId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  const rows = (data || []).filter(
    (r: { visibility?: string; user_id: string }) =>
      r.visibility !== 'private' || user?.id === r.user_id
  ) as unknown as PostRow[]
  return enrichPosts(supabase, rows, user?.id ?? null)
}

export async function fetchSavedPosts(limit = 50) {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: saves, error: se } = await supabase
    .from('post_saves')
    .select('post_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (se) throw se
  const ids = (saves || []).map((s) => s.post_id)
  if (!ids.length) return []

  const { data, error } = await supabase.from('posts').select(POST_LIST_SELECT).in('id', ids)

  if (error) throw error
  const byId = new Map((data as unknown as PostRow[]).map((p) => [p.id, p]))
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as PostRow[]
  return enrichPosts(supabase, ordered, user.id)
}
