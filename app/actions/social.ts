'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleFollowAction(targetUserId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş yapmalısınız' }
  if (user.id === targetUserId) return { error: 'Kendinizi takip edemezsiniz' }

  const { data: existing } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId)
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
  }

  revalidatePath('/')
  revalidatePath('/following')
  revalidatePath('/explore')
  revalidatePath(`/profile/${targetUserId}`)
  return { ok: true, following: !existing }
}
