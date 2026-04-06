import { getSupabaseOptional } from '@/lib/supabase/server'
import { mapProfileToUser, type ProfileRow } from '@/lib/mappers'
import type { Comment } from '@/lib/types'
import { formatRelativeTime } from '@/lib/format'

export async function fetchCommentsForPost(postId: string): Promise<Comment[]> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      id,
      body,
      created_at,
      author:profiles!comments_user_id_fkey (
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
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data || []).map((row) => {
    const author = (Array.isArray(row.author) ? row.author[0] : row.author) as unknown as ProfileRow
    return {
      id: row.id,
      author: mapProfileToUser(author),
      content: row.body,
      createdAt: formatRelativeTime(row.created_at),
      likes: 0,
    }
  })
}
