import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

export function formatRelativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: tr })
}
