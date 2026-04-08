import type { Post, RoadmapStep, TableData } from '@/lib/types'

function parseRoadmapBlock(raw: string): RoadmapStep[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((s, i) => ({
        id: s.id || String(i + 1),
        title: s.title || '',
        description: s.desc || s.description || '',
        status: s.status || 'upcoming',
        order: i + 1,
        duration: s.duration,
        difficulty: s.difficulty
      }));
    }
  } catch (e) {
    // Fallback to legacy regex parsing
  }

  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  const steps: RoadmapStep[] = []
  let order = 0
  for (const line of lines) {
    const m = line.match(/^(\d+)\.\s*(.+?)\s*-\s*(.+?)\s*\|\s*(\w[\w-]*)$/i)
    if (!m) continue
    order += 1
    const statusRaw = m[4].toLowerCase().replace('_', '-')
    let status: RoadmapStep['status'] = 'upcoming'
    if (statusRaw === 'completed' || statusRaw === 'done') status = 'completed'
    else if (statusRaw === 'in-progress' || statusRaw === 'inprogress' || statusRaw === 'progress')
      status = 'in-progress'
    steps.push({
      id: String(order),
      title: m[2].trim(),
      description: m[3].trim(),
      status,
      order,
    })
  }
  return steps
}

function parseMarkdownTable(text: string): TableData | null {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.includes('|'))
  if (lines.length < 2) return null
  const splitRow = (row: string) =>
    row
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
  const headerCells = splitRow(lines[0])
  if (headerCells.length < 2) return null
  const sep = lines[1]
  if (!/^\|?[\s:-|]+\|?$/.test(sep)) return null
  const rows: string[][] = []
  for (let i = 2; i < lines.length; i++) {
    const cells = splitRow(lines[i])
    if (cells.length === headerCells.length) rows.push(cells)
  }
  if (rows.length === 0) return null
  return { headers: headerCells, rows }
}

function extractImages(markdown: string): string[] {
  const out: string[] = []
  const re = /!\[[^\]]*]\(([^)\s]+)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(markdown)) !== null) {
    out.push(m[1])
  }
  return out
}

/** Markdown gövdesinden PostCard için yapı üretir (kaynak: tek `body` metni). */
export function postFromMarkdownBody(
  body: string,
  fallbackContentType: Post['contentType'] = 'mixed'
): Omit<Post, 'id' | 'author' | 'likes' | 'comments' | 'reposts' | 'createdAt' | 'tags'> & {
  contentType: Post['contentType']
} {
  let working = body
  let roadmapSteps: RoadmapStep[] | undefined
  const roadmapMatch = working.match(/\[ROADMAP]([\s\S]*?)\[\/ROADMAP]/i)
  if (roadmapMatch) {
    roadmapSteps = parseRoadmapBlock(roadmapMatch[1])
    working = working.replace(roadmapMatch[0], '\n')
  }

  let codeLanguage: string | undefined
  let codeContent: string | undefined
  const codeMatch = working.match(/```(\w+)?\n([\s\S]*?)```/)
  if (codeMatch) {
    codeLanguage = codeMatch[1] || 'text'
    codeContent = codeMatch[2].trim()
  }

  let tableData: TableData | undefined
  const tableMatch = working.match(/\n(\|.+\|[\s\S]*?)(?=\n\n|\n```|\[ROADMAP]|$)/)
  if (tableMatch) {
    tableData = parseMarkdownTable(tableMatch[1].trim()) || undefined
  }

  const images = extractImages(working)
  working = working.replace(/!\[[^\]]*]\([^)\s]+\)/g, '')
  const content = working.replace(/\n{3,}/g, '\n\n').trim()

  let contentType: Post['contentType'] = fallbackContentType
  if (roadmapSteps?.length) contentType = 'roadmap'
  else if (codeContent) contentType = 'code'
  else if (tableData) contentType = 'table'
  else if (fallbackContentType !== 'mixed') contentType = fallbackContentType
  else contentType = 'text'

  return {
    content: content,
    contentType,
    codeLanguage,
    codeContent,
    roadmapSteps,
    tableData,
    images: images.length ? images : undefined,
  }
}
