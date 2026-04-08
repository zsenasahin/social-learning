import { postFromMarkdownBody } from '@/lib/parse-post'
import type { Event, Post, User } from '@/lib/types'
import { formatRelativeTime } from '@/lib/format'

export type ProfileRow = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  university: string | null
  department: string | null
  website?: string | null
  created_at?: string
}

export function mapProfileToUser(
  row: ProfileRow,
  opts?: { followers?: number; following?: number; isFollowing?: boolean }
): User {
  return {
    id: row.id,
    name: row.display_name,
    username: row.username,
    avatar: row.avatar_url || '/placeholder.svg',
    bio: row.bio || '',
    university: row.university ?? undefined,
    department: row.department ?? undefined,
    followers: opts?.followers ?? 0,
    following: opts?.following ?? 0,
    isFollowing: opts?.isFollowing,
  }
}

function countByPostId(rows: { post_id: string }[] | null): Map<string, number> {
  const m = new Map<string, number>()
  for (const r of rows || []) {
    m.set(r.post_id, (m.get(r.post_id) || 0) + 1)
  }
  return m
}

function setFromPostIds(rows: { post_id: string }[] | null): Set<string> {
  return new Set((rows || []).map((r) => r.post_id))
}

export function mapPostRows(
  rows: {
    id: string
    body: string
    content_type: string
    tags: string[] | null
    created_at: string
    author: ProfileRow
  }[],
  likesRows: { post_id: string }[] | null,
  commentsRows: { post_id: string }[] | null,
  repostsRows: { post_id: string }[] | null,
  myLikes: Set<string>,
  myReposts: Set<string>,
  mySaves: Set<string>
): Post[] {
  const likeMap = countByPostId(likesRows)
  const commentMap = countByPostId(commentsRows)
  const repostMap = countByPostId(repostsRows)

  return rows.map((row) => {
    const parsed = postFromMarkdownBody(row.body, row.content_type as Post['contentType'])
    return {
      id: row.id,
      author: mapProfileToUser(row.author),
      ...parsed,
      rawBody: row.body,
      likes: likeMap.get(row.id) || 0,
      comments: commentMap.get(row.id) || 0,
      reposts: repostMap.get(row.id) || 0,
      isLiked: myLikes.has(row.id),
      isReposted: myReposts.has(row.id),
      isSaved: mySaves.has(row.id),
      createdAt: formatRelativeTime(row.created_at),
      tags: row.tags?.length ? row.tags : undefined,
    }
  })
}

export type SeriesRow = {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  category: string
  tags: string[] | null
  created_at: string
  author: ProfileRow
}

export function mapSeriesToEvent(
  row: SeriesRow,
  totalPosts: number,
  followerCount: number,
  isFollowing?: boolean
): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    author: mapProfileToUser(row.author),
    thumbnail: row.thumbnail_url || '/placeholder.svg',
    category: row.category,
    totalPosts,
    followers: followerCount,
    createdAt: formatRelativeTime(row.created_at),
    tags: row.tags || [],
    isFollowing,
  }
}
