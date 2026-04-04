import { getCurrentProfileRow } from '@/lib/data/profiles'
import { mapProfileToUser } from '@/lib/mappers'
import type { User } from '@/lib/types'

/** Layout / provider için; sayaçlar gerekmez. */
export async function getSessionUserForLayout(): Promise<User | null> {
  const row = await getCurrentProfileRow()
  if (!row) return null
  return mapProfileToUser(row, { followers: 0, following: 0 })
}
