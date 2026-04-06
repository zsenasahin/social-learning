import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getProfileByUsername, mapProfileRowToUserWithCounts, getCurrentProfileRow } from '@/lib/data/profiles'
import { fetchPostsByAuthor, fetchLikedPostsForUser } from '@/lib/data/posts'
import { fetchSeriesByAuthor } from '@/lib/data/series'
import { MapPin, Calendar, Link as LinkIconLucide } from 'lucide-react'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { FollowButton } from '@/components/profile/follow-button'
import { ProfileEditButton } from '@/components/profile/profile-edit-button'

type Props = { params: Promise<{ username: string }> }

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params
  const row = await getProfileByUsername(username)
  if (!row) notFound()

  const current = await getCurrentProfileRow()
  const user = await mapProfileRowToUserWithCounts(row, current?.id ?? null)
  const isOwn = current?.id === row.id

  const [userPosts, userEvents, likedPosts] = await Promise.all([
    fetchPostsByAuthor(row.id),
    fetchSeriesByAuthor(row.id),
    isOwn ? fetchLikedPostsForUser(row.id) : Promise.resolve([]),
  ])

  const stats = [
    { label: 'Takipçi', value: user.followers },
    { label: 'Takip', value: user.following },
    { label: 'Paylaşım', value: userPosts.length },
  ]

  const joined = row.created_at
    ? new Intl.DateTimeFormat('tr', { month: 'long', year: 'numeric' }).format(new Date(row.created_at))
    : '—'

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />

        <main className="mx-auto max-w-3xl px-4 pb-20 lg:pb-8">
          <div className="relative">
            <div className="h-32 sm:h-48 rounded-b-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />

            <div className="relative px-4 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 -mt-12 sm:-mt-16 ring-4 ring-background">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                </Avatar>

                <div className="mt-4 sm:mt-0 flex gap-2">
                  {isOwn ? (
                    <ProfileEditButton
                      initial={{
                        displayName: user.name,
                        bio: user.bio,
                        university: user.university ?? '',
                        department: user.department ?? '',
                        website: row.website ?? '',
                      }}
                    />
                  ) : (
                    <FollowButton targetUserId={row.id} initialFollowing={Boolean(user.isFollowing)} />
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>

              <p className="mt-3 text-foreground leading-relaxed">{user.bio}</p>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {user.university && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.university}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {joined === '—' ? '—' : `${joined} tarihinde katıldı`}
                </span>
                {row.website && (
                  <a
                    href={row.website.startsWith('http') ? row.website : `https://${row.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <LinkIconLucide className="h-4 w-4" />
                    {row.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {isOwn && (
                  <Link href="/create" className="text-primary hover:underline text-sm">
                    Yeni paylaşım
                  </Link>
                )}
              </div>

              <div className="mt-4 flex gap-6">
                {stats.map((stat) => (
                  <span key={stat.label}>
                    <span className="font-bold text-foreground">{stat.value.toLocaleString('tr-TR')}</span>
                    <span className="ml-1 text-muted-foreground">{stat.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <ProfileTabs
            isOwn={isOwn}
            posts={userPosts}
            events={userEvents}
            likedPosts={likedPosts}
          />
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
