'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { mockUsers } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Repeat2, 
  Bell,
  Settings,
  Check
} from 'lucide-react'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'repost' | 'mention'
  user: typeof mockUsers[0]
  content?: string
  postPreview?: string
  createdAt: string
  isRead: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: mockUsers[0],
    postPreview: 'React 19 ile gelen yeni hook\'lari inceledim...',
    createdAt: '5 dk once',
    isRead: false
  },
  {
    id: '2',
    type: 'follow',
    user: mockUsers[1],
    createdAt: '1 saat once',
    isRead: false
  },
  {
    id: '3',
    type: 'comment',
    user: mockUsers[2],
    content: 'Cok faydali bir paylasim, tesekkurler!',
    postPreview: 'Flutter ile state management karsilastirmasi...',
    createdAt: '2 saat once',
    isRead: true
  },
  {
    id: '4',
    type: 'repost',
    user: mockUsers[3],
    postPreview: 'Machine Learning icin Python kutuphaneleri...',
    createdAt: '3 saat once',
    isRead: true
  },
  {
    id: '5',
    type: 'mention',
    user: mockUsers[4],
    content: '@kullanici bu konuda ne dusunuyorsun?',
    createdAt: '5 saat once',
    isRead: true
  },
  {
    id: '6',
    type: 'like',
    user: mockUsers[1],
    postPreview: 'Yeni baslayanlar icin hazirladigim UI/UX tasarim yol haritasi...',
    createdAt: '1 gun once',
    isRead: true
  },
]

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  repost: Repeat2,
  mention: Bell,
}

const notificationColors = {
  like: 'text-red-500 bg-red-500/10',
  comment: 'text-primary bg-primary/10',
  follow: 'text-accent bg-accent/10',
  repost: 'text-green-500 bg-green-500/10',
  mention: 'text-amber-500 bg-amber-500/10',
}

const notificationTexts = {
  like: 'paylasimini begendi',
  comment: 'yorum yapti',
  follow: 'seni takip etmeye basladi',
  repost: 'paylasimini tekrar paylasti',
  mention: 'senden bahsetti',
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [notifications, setNotifications] = useState(mockNotifications)

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header />
        
        <main className="mx-auto max-w-2xl px-4 pb-20 lg:pb-8">
          {/* Page Header */}
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Bildirimler</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} okunmamis bildirim
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Check className="h-4 w-4" />
                  Tumunu Okundu Isaretle
                </button>
              )}
              <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary transition-colors">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              Tumu
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                filter === 'unread'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              Okunmamis {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-2">
            {filteredNotifications.map((notification) => {
              const Icon = notificationIcons[notification.type]
              const colorClass = notificationColors[notification.type]
              const text = notificationTexts[notification.type]

              return (
                <Card 
                  key={notification.id} 
                  className={cn(
                    'transition-colors hover:bg-secondary/30',
                    !notification.isRead && 'bg-primary/5 border-primary/20'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                          <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          'absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full',
                          colorClass
                        )}>
                          <Icon className="h-3 w-3" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground">
                          <Link 
                            href={`/profile/${notification.user.username}`}
                            className="font-semibold hover:underline"
                          >
                            {notification.user.name}
                          </Link>
                          {' '}{text}
                        </p>
                        
                        {notification.content && (
                          <p className="text-muted-foreground mt-1">
                            {'"'}{notification.content}{'"'}
                          </p>
                        )}
                        
                        {notification.postPreview && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {notification.postPreview}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.createdAt}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <div className="flex h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {filteredNotifications.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">Bildirim Yok</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    {filter === 'unread' 
                      ? 'Tum bildirimlerini okudun!'
                      : 'Henuz bildirim almadin.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
