'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { postFromMarkdownBody } from '@/lib/parse-post'
import { getCurrentProfileRow } from '@/lib/data/profiles'
import type { Post } from '@/lib/types'

export async function createPostAction(input: {
  body: string
  tags: string[]
  visibility: 'public' | 'followers' | 'private'
  seriesId?: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş yapmalısınız' }

  // Profil satırının mevcut olduğundan emin ol (yoksa otomatik oluşturulur)
  const profile = await getCurrentProfileRow()
  if (!profile) return { error: 'Profil oluşturulamadı. Lütfen tekrar giriş yapın.' }

  const parsed = postFromMarkdownBody(input.body, 'mixed')
  const contentType: Post['contentType'] = parsed.contentType

  let seriesId: string | null = input.seriesId?.trim() || null
  if (seriesId) {
    const { data: ownSeries } = await supabase
      .from('series')
      .select('id')
      .eq('id', seriesId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!ownSeries) seriesId = null
  }

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    body: input.body.trim(),
    content_type: contentType,
    visibility: input.visibility,
    tags: input.tags.slice(0, 5),
    series_id: seriesId,
  })

  if (error) return { error: error.message }
  revalidatePath('/')
  revalidatePath('/explore')
  revalidatePath('/following')
  return { ok: true }
}

export async function togglePostLikeAction(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş yapmalısınız' }

  const { data: existing } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
  }

  revalidatePath('/')
  revalidatePath('/explore')
  revalidatePath('/following')
  revalidatePath(`/post/${postId}`)
  return { ok: true }
}

export async function togglePostRepostAction(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş yapmalısınız' }

  const { data: existing } = await supabase
    .from('post_reposts')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('post_reposts').delete().eq('post_id', postId).eq('user_id', user.id)
  } else {
    await supabase.from('post_reposts').insert({ post_id: postId, user_id: user.id })
  }

  revalidatePath('/')
  revalidatePath('/explore')
  revalidatePath(`/post/${postId}`)
  return { ok: true }
}

export async function togglePostSaveAction(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş yapmalısınız' }

  const { data: existing } = await supabase
    .from('post_saves')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('post_saves').delete().eq('post_id', postId).eq('user_id', user.id)
  } else {
    await supabase.from('post_saves').insert({ post_id: postId, user_id: user.id })
  }

  revalidatePath('/saved')
  revalidatePath(`/post/${postId}`)
  return { ok: true }
}

export async function addCommentAction(postId: string, body: string) {
  const text = body.trim()
  if (!text) return { error: 'Yorum boş olamaz' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş yapmalısınız' }

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    body: text,
  })

  if (error) return { error: error.message }
  revalidatePath(`/post/${postId}`)
  return { ok: true }
}
