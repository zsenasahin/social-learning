'use client'

import { useState, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Code, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Table as TableIcon, 
  GitBranch,
  Link2,
  Quote,
  Heading1,
  Heading2,
  FileCode,
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  PlusCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [uploading, setUploading] = useState(false)

  const [tableDialogOpen, setTableDialogOpen] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)

  const [roadmapDialogOpen, setRoadmapDialogOpen] = useState(false)
  const [roadmapSteps, setRoadmapSteps] = useState([{ id: crypto.randomUUID(), title: '', desc: '', status: 'upcoming' }])

  const insertText = (before: string, after: string = '', defaultText: string = '') => {
    if (!textareaRef.current) {
      onChange(value + before + defaultText + after)
      return
    }
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    const selectedText = value.substring(start, end) || defaultText
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const insertMultilineText = (prefix: string, isOrdered: boolean = false) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    if (!selectedText) {
      insertText(`\n${isOrdered ? '1. ' : prefix}`, '\n', 'Madde')
      return
    }

    const newText = selectedText
      .split('\n')
      .map((line, i) => `${isOrdered ? `${i + 1}. ` : prefix}${line}`)
      .join('\n')

    const before = value.substring(0, start)
    const after = value.substring(end)
    onChange(before + newText + after)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + newText.length)
    }, 0)
  }

  const handleToolClick = (action: string) => {
    switch(action) {
      case 'bold': insertText('**', '**', 'kalın metin'); break;
      case 'italic': insertText('*', '*', 'eğik metin'); break;
      case 'h1': insertText('\n# ', '\n', 'Başlık 1'); break;
      case 'h2': insertText('\n## ', '\n', 'Başlık 2'); break;
      case 'inlineCode': insertText('`', '`', 'kod'); break;
      case 'codeBlock': insertText('\n```\n', '\n```\n', ''); break;
      case 'quote': insertText('\n> ', '\n', 'Alıntı'); break;
      case 'bulletList': insertMultilineText('- ', false); break;
      case 'orderedList': insertMultilineText('1. ', true); break;
      case 'roadmap': setRoadmapDialogOpen(true); break;
      case 'link': insertText('[', '](https://)', 'Link Metni'); break;
      case 'image': setImageDialogOpen(true); break;
      case 'table': setTableDialogOpen(true); break;
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Bilinmeyen hata')
      const data = await res.json()
      if (data.url) {
        insertText(`\n![${file.name}](${data.url})\n`, '')
      }
    } catch (err) {
      console.error(err)
      alert('Resim yüklerken bir hata oluştu.')
    } finally {
      setUploading(false)
      setImageDialogOpen(false)
    }
  }

  const insertImageUrl = () => {
    if (!imageUrl) return
    insertText(`\n![${imageAlt || 'Resim'}](${imageUrl})\n`, '')
    setImageUrl('')
    setImageAlt('')
    setImageDialogOpen(false)
  }

  const insertTable = () => {
    let table = '\n'
    // Header
    for(let i=1; i<=tableCols; i++) table += `| Başlık ${i} `
    table += '|\n'
    // Separator
    for(let i=1; i<=tableCols; i++) table += '|---'
    table += '|\n'
    // Rows
    for(let r=1; r<=tableRows; r++) {
      for(let i=1; i<=tableCols; i++) table += `| Veri `
      table += '|\n'
    }
    insertText(table, '')
    setTableDialogOpen(false)
  }

  const insertRoadmap = () => {
    const validSteps = roadmapSteps.filter((s) => s.title.trim())
    if (validSteps.length === 0) {
      setRoadmapDialogOpen(false)
      return
    }
    const md = `\n[ROADMAP]\n${JSON.stringify(validSteps, null, 2)}\n[/ROADMAP]\n`
    insertText(md, '')
    setRoadmapDialogOpen(false)
    setRoadmapSteps([{ id: crypto.randomUUID(), title: '', desc: '', status: 'upcoming' }])
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      {/* Orijinal input'u gizleyip dosyayı tetikliyoruz */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/20 p-2">
        <ToolButton icon={Bold} label="Kalın" onClick={() => handleToolClick('bold')} />
        <ToolButton icon={Italic} label="İtalik" onClick={() => handleToolClick('italic')} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolButton icon={Heading1} label="Başlık 1" onClick={() => handleToolClick('h1')} />
        <ToolButton icon={Heading2} label="Başlık 2" onClick={() => handleToolClick('h2')} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolButton icon={Code} label="Satır İçi Kod" onClick={() => handleToolClick('inlineCode')} />
        <ToolButton icon={FileCode} label="Kod Bloğu" onClick={() => handleToolClick('codeBlock')} />
        <ToolButton icon={Quote} label="Alıntı" onClick={() => handleToolClick('quote')} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolButton icon={List} label="Madde İmi" onClick={() => handleToolClick('bulletList')} />
        <ToolButton icon={ListOrdered} label="Numaralı Liste" onClick={() => handleToolClick('orderedList')} />
        <ToolButton icon={GitBranch} label="Yol Haritası" onClick={() => handleToolClick('roadmap')} />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolButton icon={Link2} label="Bağlantı" onClick={() => handleToolClick('link')} />
        <ToolButton icon={ImageIcon} label="Resim Ekle" onClick={() => handleToolClick('image')} />
        <ToolButton icon={TableIcon} label="Tablo Oluştur" onClick={() => handleToolClick('table')} />
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[350px] w-full resize-y bg-transparent p-4 text-foreground placeholder:text-muted-foreground focus:outline-none font-sans text-[15px] leading-relaxed"
      />

      {/* Resim Ekleme Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resim Ekle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors">
              <Button 
                variant="secondary" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
                Bilgisayardan Yükle
              </Button>
              <p className="text-xs text-muted-foreground mt-2">PNG, JPG veya GIF</p>
            </div>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">veya URL ile yönlendir</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Resim Linki (URL)</Label>
                <div className="relative flex items-center">
                  <LinkIcon className="h-4 w-4 text-muted-foreground absolute left-3" />
                  <Input 
                    placeholder="https://..." 
                    value={imageUrl} 
                    onChange={e => setImageUrl(e.target.value)} 
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Açıklama (Opsiyonel)</Label>
                <Input placeholder="Görsel açıklaması..." value={imageAlt} onChange={e => setImageAlt(e.target.value)} />
              </div>
              <Button onClick={insertImageUrl} disabled={!imageUrl} className="w-full">
                URL'den Ekle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tablo Ekleme Dialog */}
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tablo Oluştur</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Satır</Label>
              <Input type="number" min={1} max={20} value={tableRows} onChange={e => setTableRows(parseInt(e.target.value)||1)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Sütun</Label>
              <Input type="number" min={1} max={10} value={tableCols} onChange={e => setTableCols(parseInt(e.target.value)||1)} className="col-span-3" />
            </div>
            <Button onClick={insertTable} className="mt-2">
              Tabloyu Ekle
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Yol Haritası Ekleme Dialog */}
      <Dialog open={roadmapDialogOpen} onOpenChange={setRoadmapDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yol Haritası (Roadmap) Oluştur</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {roadmapSteps.map((step, index) => (
              <div key={step.id} className="relative border border-border p-4 rounded-lg bg-secondary/10 flex flex-col gap-3">
                <div className="absolute top-2 right-2">
                  <button 
                    onClick={() => {
                      if(roadmapSteps.length > 1) {
                         setRoadmapSteps(ps => ps.filter(s => s.id !== step.id))
                      }
                    }}
                    className="p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-primary/20 text-primary rounded-full text-xs font-bold">{index + 1}</span>
                  <div className="flex-1">
                    <Input 
                      placeholder="Adım başlığı (Örn: React Temelleri)" 
                      value={step.title} 
                      onChange={e => {
                        const newArr = [...roadmapSteps]
                        newArr[index].title = e.target.value
                        setRoadmapSteps(newArr)
                      }} 
                    />
                  </div>
                </div>
                <div className="pl-8 flex gap-2 w-full">
                  <Input 
                    placeholder="Adım açıklaması (opsiyonel)" 
                    value={step.desc} 
                    onChange={e => {
                      const newArr = [...roadmapSteps]
                      newArr[index].desc = e.target.value
                      setRoadmapSteps(newArr)
                    }} 
                    className="flex-1"
                  />
                </div>
                <div className="pl-8 flex gap-2 w-full">
                  <Input 
                    placeholder="Süre (Örn: 2 Hafta)" 
                    value={(step as any).duration || ''} 
                    onChange={e => {
                      const newArr = [...roadmapSteps]
                      ;(newArr[index] as any).duration = e.target.value
                      setRoadmapSteps(newArr)
                    }} 
                    className="w-[140px]"
                  />
                  <Select 
                    value={(step as any).difficulty || 'beginner'} 
                    onValueChange={(val: any) => {
                      const newArr = [...roadmapSteps]
                      ;(newArr[index] as any).difficulty = val
                      setRoadmapSteps(newArr)
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Zorluk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Başlangıç</SelectItem>
                      <SelectItem value="intermediate">Orta Seviye</SelectItem>
                      <SelectItem value="advanced">İleri Seviye</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              onClick={() => setRoadmapSteps([...roadmapSteps, { id: crypto.randomUUID(), title: '', desc: '', status: 'upcoming' }])}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Yeni Adım Ekle
            </Button>
            <Button onClick={insertRoadmap} className="mt-2">
              Yol Haritasını Ekle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ToolButton({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
