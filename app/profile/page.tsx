import { redirect } from 'next/navigation'
import { getCurrentProfileRow } from '@/lib/data/profiles'

export default async function ProfileRedirectPage() {
  const row = await getCurrentProfileRow()
  if (!row) redirect('/auth/login')
  redirect(`/profile/${row.username}`)
}
