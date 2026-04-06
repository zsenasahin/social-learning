import { getSupabaseOptional } from '@/lib/supabase/server'
import { mapProfileToUser, type ProfileRow } from '@/lib/mappers'
import type { User } from '@/lib/types'

export async function getCurrentProfileRow(): Promise<ProfileRow | null> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (error) throw error
  if (data) return data as ProfileRow

  // Fallback: If auth user exists but profile row missing, create one
  const emailPrefix = user.email ? user.email.split('@')[0] : `user_${Math.floor(Math.random() * 10000)}`
  const baseUsername = emailPrefix.replace(/[^a-zA-Z0-9_]/g, '')
  const fallbackProfile = {
    id: user.id,
    display_name: user.user_metadata?.display_name || emailPrefix,
    username: `${baseUsername}_${Math.floor(Math.random() * 1000)}`,
    avatar_url: user.user_metadata?.avatar_url || '/placeholder.svg'
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('profiles')
    .insert([fallbackProfile])
    .select('*')
    .maybeSingle()

  if (insertErr || !inserted) {
    console.error("DEBUG SUPABASE PROFILE INSERT:", insertErr, "Inserted:", inserted)
    return null
  }
  return inserted as ProfileRow
}

export async function getProfileByUsername(username: string): Promise<ProfileRow | null> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle()
  if (error) throw error
  return data as ProfileRow | null
}

async function countFollowers(profileId: string): Promise<number> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return 0
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profileId)
  if (error) throw error
  return count || 0
}

async function countFollowing(profileId: string): Promise<number> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return 0
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profileId)
  if (error) throw error
  return count || 0
}

export async function isFollowing(viewerId: string, targetId: string): Promise<boolean> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return false
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', viewerId)
    .eq('following_id', targetId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function mapProfileRowToUserWithCounts(
  row: ProfileRow,
  viewerId: string | null
): Promise<User> {
  const [followers, following] = await Promise.all([
    countFollowers(row.id),
    countFollowing(row.id),
  ])
  let isFollowingUser: boolean | undefined
  if (viewerId && viewerId !== row.id) {
    isFollowingUser = await isFollowing(viewerId, row.id)
  }
  return mapProfileToUser(row, {
    followers,
    following,
    isFollowing: isFollowingUser,
  })
}

/** Oturum açmış kullanıcının takip ettikleri (profil kartları için). */
export async function fetchFollowingList(): Promise<User[]> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('follows')
    .select(
      `
      following:profiles!follows_following_id_fkey (
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
    .eq('follower_id', user.id)

  if (error) throw error
  const rows = (data || [])
    .map((r) => (Array.isArray(r.following) ? r.following[0] : r.following) as unknown as ProfileRow | null)
    .filter(Boolean) as ProfileRow[]

  const out: User[] = []
  for (const row of rows) {
    out.push(await mapProfileRowToUserWithCounts(row, user.id))
  }
  return out
}

export async function listSuggestedProfiles(limit = 8): Promise<User[]> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit + 2)
  if (error) throw error
  const rows = (data || []).filter((p) => p.id !== user?.id).slice(0, limit) as ProfileRow[]
  const out: User[] = []
  for (const row of rows) {
    out.push(await mapProfileRowToUserWithCounts(row, user?.id ?? null))
  }
  return out
}

export async function searchProfiles(q: string, limit = 20): Promise<User[]> {
  if (!q.trim()) return listSuggestedProfiles(limit)
  const supabase = await getSupabaseOptional()
  if (!supabase) return []
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const safe = q.trim().replace(/%/g, '')
  const pattern = `%${safe}%`
  const [byName, byUsername] = await Promise.all([
    supabase.from('profiles').select('*').ilike('display_name', pattern).limit(limit),
    supabase.from('profiles').select('*').ilike('username', pattern).limit(limit),
  ])
  if (byName.error) throw byName.error
  if (byUsername.error) throw byUsername.error
  const seen = new Set<string>()
  const rows: ProfileRow[] = []
  for (const r of [...(byName.data || []), ...(byUsername.data || [])] as ProfileRow[]) {
    if (seen.has(r.id)) continue
    seen.add(r.id)
    rows.push(r)
    if (rows.length >= limit) break
  }
  const out: User[] = []
  for (const row of rows) {
    out.push(await mapProfileRowToUserWithCounts(row, user?.id ?? null))
  }
  return out
}
