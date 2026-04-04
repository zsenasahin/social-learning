import { NextResponse } from 'next/server'
import { createClient, getSupabaseOptional } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const optional = await getSupabaseOptional()
  if (!optional) {
    return NextResponse.redirect(`${origin}/auth/login?error=config`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/'}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth`)
}
