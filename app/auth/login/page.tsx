'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GraduationCap } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      setError('.env.local içinde Supabase anahtarlarını tanımlayın.')
      return
    }
    setLoading(true)
    const supabase = createBrowserClient(url, key)
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signErr) {
      setError(signErr.message)
      return
    }
    router.push(next)
    router.refresh()
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-foreground">Giriş yap</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Hesabın yok mu?{' '}
        <Link href="/auth/signup" className="text-primary hover:underline">
          Kayıt ol
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {searchParams.get('error') && (
          <p className="text-sm text-destructive">Oturum açılamadı. Tekrar deneyin.</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Giriş…' : 'Giriş yap'}
        </Button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <GraduationCap className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold text-foreground">StudyFlow</span>
      </Link>

      <Suspense fallback={
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm animate-pulse">
          <div className="h-6 w-24 bg-muted rounded mb-4" />
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-primary/30 rounded" />
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
