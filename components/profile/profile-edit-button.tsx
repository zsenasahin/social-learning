'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProfileAction } from '@/app/actions/profile'

export function ProfileEditButton({
  initial,
}: {
  initial: {
    displayName: string
    bio: string
    university: string
    department: string
    website: string
  }
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await updateProfileAction(form)
      if (res.error) {
        setError(res.error)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Profili düzenle</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profil</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-1">
            <Label htmlFor="dn">Görünen ad</Label>
            <Input
              id="dn"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bio">Biyografi</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="uni">Üniversite</Label>
            <Input
              id="uni"
              value={form.university}
              onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dep">Bölüm</Label>
            <Input
              id="dep"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="web">Web sitesi</Label>
            <Input
              id="web"
              type="url"
              placeholder="https://"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
