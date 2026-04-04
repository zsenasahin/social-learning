'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Sparkles } from 'lucide-react'
import { createSeriesAction } from '@/app/actions/series'
import { useSessionUser } from '@/components/session-context'

export default function CreateSeriesPage() {
  const router = useRouter()
  const user = useSessionUser()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Genel')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && tagInput.trim() && tags.length < 8) {
      e.preventDefault()
      const t = tagInput.trim()
      if (!tags.includes(t)) setTags([...tags, t])
      setTagInput('')
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title.trim()) return
    setLoading(true)
    const res = await createSeriesAction({
      title,
      description,
      category,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
      tags,
    })
    setLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    router.push('/events')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="mx-auto max-w-2xl px-4 pb-20 lg:pb-8">
          <div className="flex items-center justify-between py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Link href="/events">
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-lg font-semibold text-foreground">Yeni eğitim serisi</h1>
            </div>
            <Button onClick={submit} disabled={loading || !title.trim()}>
              {loading ? 'Kaydediliyor…' : 'Yayınla'}
            </Button>
          </div>

          {!user && (
            <p className="text-sm text-destructive mt-4">Seri oluşturmak için giriş yapmalısın.</p>
          )}

          <form onSubmit={submit} className="py-6 space-y-6">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn. Sıfırdan mobil geliştirme"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Açıklama</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Seride neler öğrenilecek?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat">Kategori</Label>
              <Input
                id="cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Frontend, Mobile…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumb">Kapak görseli URL (isteğe bağlı)</Label>
              <Input
                id="thumb"
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Etiketler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== tag))}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      #{tag} ×
                    </button>
                  ))}
                </div>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Etiket yazıp Enter"
                  disabled={tags.length >= 8}
                />
              </CardContent>
            </Card>
          </form>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
