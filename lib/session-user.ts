import { getCurrentProfileRow } from '@/lib/data/profiles'
import { mapProfileToUser } from '@/lib/mappers'
import type { User } from '@/lib/types'
import { getSupabaseOptional } from '@/lib/supabase/server'

/** Layout / provider için; sayaçlar gerekmez. */
export async function getSessionUserForLayout(): Promise<User | null> {
  const row = await getCurrentProfileRow()
  
  if (!row) {
    // Profil satırı yoksa ama auth user varsa, çıkış yapabilmesi için sahte bir user dön
    const supabase = await getSupabaseOptional()
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        return {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'kullanici',
          name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Kullanıcı',
          avatar: user.user_metadata?.avatar_url || '/placeholder.svg',
          bio: '',
          followers: 0,
          following: 0
        }
      }
    }
    return null
  }
  
  return mapProfileToUser(row, { followers: 0, following: 0 })
}
