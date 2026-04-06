'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    try {
      setLoading(true)
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createBrowserClient(url, key)
      
      await supabase.auth.signOut()
      router.refresh()
      router.push('/auth/login')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleLogout} 
      disabled={loading}
      title="Çıkış Yap"
    >
      <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
    </Button>
  )
}
