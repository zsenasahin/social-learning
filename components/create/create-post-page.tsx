'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { RichEditor } from '@/components/create/rich-editor'
import { PostCard } from '@/components/feed/post-card'
import { postFromMarkdownBody } from '@/lib/parse-post'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  X,
  Image,
  FileCode,
  Table,
  GitBranch,
  Globe,
  Lock,
  Users,
  ChevronDown,
  Sparkles,
  Eye,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPostAction } from '@/app/actions/posts'
import { useSessionUser } from '@/components/session-context'
import { Label } from '@/components/ui/label'

const visibilityOptions = [
  { id: 'public', label: 'Herkes', icon: Globe, description: 'Herkes görebilir' },
  { id: 'followers', label: 'Takipçiler', icon: Users, description: 'Sadece takipçiler' },
  { id: 'private', label: 'Özel', icon: Lock, description: 'Sadece sen' },
] as const

export function CreatePostPageClient({
  mySeries,
  initialSeriesId = 'none',
}: {
  mySeries: { id: string; title: string }[]
  initialSeriesId?: string
}) {
  const router = useRouter()
  const sessionUser = useSessionUser()
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [visibility, setVisibility] = useState<(typeof visibilityOptions)[number]['id']>('public')
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [seriesId, setSeriesId] = useState<string>(initialSeriesId)
  const [error, setError] = useState<string | null>(null)

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && tags.length < 5) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setError(null)
    setIsSubmitting(true)
    const res = await createPostAction({
      body: content,
      tags,
      visibility,
      seriesId: seriesId === 'none' ? null : seriesId,
    })
    setIsSubmitting(false)
    if (res.error) {
      setError(res.error)
      return
    }
    router.push('/')
    router.refresh()
  }

  const selectedVisibility = visibilityOptions.find((v) => v.id === visibility)!

  const contentTypes = [
    { id: 'text', label: 'Metin', icon: null as null, description: 'Düz metin ve markdown' },
    { id: 'code', label: 'Kod', icon: FileCode, description: 'Kod parçası' },
    { id: 'table', label: 'Tablo', icon: Table, description: 'Karşılaştırma tablosu' },
    { id: 'roadmap', label: 'Yol haritası', icon: GitBranch, description: 'Adım adım rehber' },
    { id: 'image', label: 'Resim', icon: Image, description: 'Görsel ekle' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />

        <main className="mx-auto max-w-3xl px-4 pb-20 lg:pb-8">
          <div className="flex items-center justify-between py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-lg font-semibold text-foreground">Yeni paylaşım</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsPreview(!isPreview)} className="gap-2">
                <Eye className="h-4 w-4" />
                {isPreview ? 'Düzenle' : 'Önizle'}
              </Button>
              <Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Paylaş
              </Button>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <div className="py-6 space-y-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={sessionUser?.avatar} alt={sessionUser?.name || ''} />
                <AvatarFallback>{sessionUser?.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{sessionUser?.name || 'Kullanıcı'}</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <selectedVisibility.icon className="h-3.5 w-3.5" />
                    {selectedVisibility.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {showVisibilityMenu && (
                    <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-border bg-card shadow-lg z-10">
                      {visibilityOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setVisibility(option.id)
                            setShowVisibilityMenu(false)
                          }}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-secondary transition-colors',
                            visibility === option.id && 'bg-secondary'
                          )}
                        >
                          <option.icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{option.label}</p>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {mySeries.length > 0 && (
              <div className="space-y-2">
                <Label>Eğitim serisi (isteğe bağlı)</Label>
                <Select value={seriesId} onValueChange={setSeriesId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seri seç…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Seriye bağlama</SelectItem>
                    {mySeries.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}



            {!isPreview ? (
              <RichEditor
                value={content}
                onChange={setContent}
                placeholder="Düşüncelerini, öğrendiklerini veya notlarını paylaş…"
              />
            ) : (
              <div className="pointer-events-none opacity-95 mt-4">
                {(() => {
                  const parsed = postFromMarkdownBody(content, 'mixed');
                  const previewPost = {
                    id: 'preview',
                    author: {
                      id: sessionUser?.id || 'demo',
                      name: sessionUser?.name || 'Kullanıcı',
                      username: sessionUser?.username || 'kullanici',
                      avatar: sessionUser?.avatar || '',
                      bio: '',
                      university: '',
                      department: '',
                      followers: 0,
                      following: 0,
                      posts: 0
                    },
                    ...parsed,
                    likes: 0,
                    comments: 0,
                    reposts: 0,
                    isLiked: false,
                    isReposted: false,
                    isSaved: false,
                    createdAt: 'Şimdi',
                    tags: tags
                  };
                  return <PostCard post={previewPost} />;
                })()}
              </div>
            )}

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
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length < 5 ? "Etiket ekle ve Enter'a bas…" : 'En fazla 5 etiket'}
                  disabled={tags.length >= 5}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Etiketler keşfedilmeyi kolaylaştırır ({tags.length}/5)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <h4 className="font-medium text-foreground mb-2">İpuçları</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Kod için araç çubuğundan kod bloğu ekleyin veya ``` kullanın</li>
                  <li>• Yol haritası için [ROADMAP]…[/ROADMAP] sözdizimi</li>
                  <li>• Tablolar için | sütun | markdown</li>
                  <li>• Görsel için ![açıklama](url)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
