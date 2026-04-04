'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfileAction(input: {
  displayName: string
  bio: string
  university: string
  department: string
  website: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Giriş yapmalısınız' }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: input.displayName.trim(),
      bio: input.bio.trim(),
      university: input.university.trim() || null,
      department: input.department.trim() || null,
      website: input.website.trim() || null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  revalidatePath('/')
  return { ok: true }
}
