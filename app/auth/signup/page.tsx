'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GraduationCap } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      setError('.env.local içinde Supabase anahtarlarını tanımlayın.')
      return
    }
    setLoading(true)
    const supabase = createBrowserClient(url, key)
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const { data, error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          display_name: displayName.trim() || undefined,
        },
      },
    })
    setLoading(false)
    if (signErr) {
      setError(signErr.message)
      return
    }
    if (data.user?.identities?.length === 0) {
      setError('Bu e-posta zaten kayıtlı.')
      return
    }
    setMessage(
      'Doğrulama bağlantısı e-postanıza gönderildiyse kutunuzu kontrol edin. E-posta onayı kapalıysa doğrudan giriş yapabilirsiniz.'
    )
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <GraduationCap className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold text-foreground">StudyFlow</span>
      </Link>

      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Hesap oluştur</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Zaten üye misin?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Giriş yap
          </Link>
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          <div className="space-y-2">
            <Label htmlFor="name">Görünen ad (isteğe bağlı)</Label>
            <Input
              id="name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Adınız"
            />
          </div>
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
            <Label htmlFor="password">Şifre (en az 6 karakter)</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Kayıt…' : 'Kayıt ol'}
          </Button>
        </form>
      </div>
    </div>
  )
}
