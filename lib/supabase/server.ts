import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function missingEnvMessage() {
  return 'Supabase için .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlayın.'
}

async function makeServerClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          /* Server Component'te set edilemez; middleware günceller */
        }
      },
    },
  })
}

/** Okuma için: env yoksa null (boş liste gösterilir). */
export async function getSupabaseOptional() {
  return makeServerClient()
}

/** Mutasyon ve zorunlu okuma: env yoksa hata fırlatır. */
export async function createClient() {
  const client = await makeServerClient()
  if (!client) throw new Error(missingEnvMessage())
  return client
}

export async function getSessionUserId(): Promise<string | null> {
  const supabase = await getSupabaseOptional()
  if (!supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}
