export interface User {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  university?: string
  department?: string
  followers: number
  following: number
  isFollowing?: boolean
}

export interface RoadmapStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'upcoming'
  order: number
}

export interface TableData {
  headers: string[]
  rows: string[][]
}

export interface Post {
  id: string
  author: User
  content: string
  contentType: 'text' | 'code' | 'roadmap' | 'table' | 'mixed'
  codeLanguage?: string
  codeContent?: string
  roadmapSteps?: RoadmapStep[]
  tableData?: TableData
  images?: string[]
  likes: number
  comments: number
  reposts: number
  isLiked?: boolean
  isReposted?: boolean
  isSaved?: boolean
  createdAt: string
  tags?: string[]
}

export interface Event {
  id: string
  title: string
  description: string
  author: User
  thumbnail: string
  category: string
  totalPosts: number
  followers: number
  createdAt: string
  tags: string[]
  isFollowing?: boolean
}

export interface Comment {
  id: string
  author: User
  content: string
  createdAt: string
  likes: number
}
