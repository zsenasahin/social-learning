'use client'

import { useState } from 'react'
import { 
  Bold, 
  Italic, 
  Code, 
  List, 
  ListOrdered, 
  Image, 
  Table, 
  GitBranch,
  Link2,
  Quote,
  Heading1,
  Heading2,
  FileCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const toolbarItems = [
  { icon: Bold, label: 'Kalin', action: 'bold' },
  { icon: Italic, label: 'Italik', action: 'italic' },
  { icon: Heading1, label: 'Baslik 1', action: 'h1' },
  { icon: Heading2, label: 'Baslik 2', action: 'h2' },
  { type: 'separator' },
  { icon: Code, label: 'Satir Ici Kod', action: 'inlineCode' },
  { icon: FileCode, label: 'Kod Blogu', action: 'codeBlock' },
  { icon: Quote, label: 'Alinti', action: 'quote' },
  { type: 'separator' },
  { icon: List, label: 'Madde Listesi', action: 'bulletList' },
  { icon: ListOrdered, label: 'Numarali Liste', action: 'orderedList' },
  { type: 'separator' },
  { icon: Table, label: 'Tablo', action: 'table' },
  { icon: GitBranch, label: 'Yol Haritasi', action: 'roadmap' },
  { icon: Image, label: 'Resim', action: 'image' },
  { icon: Link2, label: 'Link', action: 'link' },
]

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const [activeFormats, setActiveFormats] = useState<string[]>([])

  const handleToolClick = (action: string) => {
    // Toggle format state for visual feedback
    if (activeFormats.includes(action)) {
      setActiveFormats(activeFormats.filter(f => f !== action))
    } else {
      setActiveFormats([...activeFormats, action])
    }

    // Insert markdown syntax
    const insertions: Record<string, string> = {
      bold: '**metin**',
      italic: '*metin*',
      h1: '\n# Baslik\n',
      h2: '\n## Alt Baslik\n',
      inlineCode: '`kod`',
      codeBlock: '\n```javascript\n// kodunuz buraya\n```\n',
      quote: '\n> Alinti metni\n',
      bulletList: '\n- Madde 1\n- Madde 2\n- Madde 3\n',
      orderedList: '\n1. Madde 1\n2. Madde 2\n3. Madde 3\n',
      table: '\n| Baslik 1 | Baslik 2 | Baslik 3 |\n|----------|----------|----------|\n| Deger 1  | Deger 2  | Deger 3  |\n',
      roadmap: '\n[ROADMAP]\n1. Adim 1 - Aciklama | completed\n2. Adim 2 - Aciklama | in-progress\n3. Adim 3 - Aciklama | upcoming\n[/ROADMAP]\n',
      image: '\n![Resim aciklamasi](url)\n',
      link: '[Link metni](url)',
    }

    const insertion = insertions[action]
    if (insertion) {
      onChange(value + insertion)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/30 p-2">
        {toolbarItems.map((item, index) => {
          if (item.type === 'separator') {
            return <div key={index} className="h-6 w-px bg-border mx-1" />
          }
          
          const Icon = item.icon!
          const isActive = activeFormats.includes(item.action!)
          
          return (
            <button
              key={item.action}
              onClick={() => handleToolClick(item.action!)}
              title={item.label}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded transition-colors',
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>

      {/* Editor */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[300px] w-full resize-none bg-transparent p-4 text-foreground placeholder:text-muted-foreground focus:outline-none font-mono text-sm leading-relaxed"
      />
    </div>
  )
}
