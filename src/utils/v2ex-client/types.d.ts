import ApiError from './ApiError'

type HTMLString = string
type UrlString = string

// ENTITY
export type HomeTabOption = {
  value: string
  label: string
  type?: 'node' | 'user' | 'home'
  disabled?: boolean
}

export type NodeBasic = {
  name: string
  title: string
}

export type NodeExtra = NodeBasic & {
  avatar_large: UrlString
  topics: number
}

export type NodeDetail = NodeBasic & {
  id?: number
  name: string
  header: HTMLString
  avatar_large: UrlString
  topics: number
  collected: boolean
  theme?: {
    bg_color?: string
    color?: string
  }
}

export type MemberBasic = {
  username: string
  avatar_mini: UrlString
  avatar_normal: UrlString
  avatar_large: UrlString
}

export type MemberProfile = {
  username: string
  website: string
  company: string
  company_title: string
  location: string
  tagline: string
  bio: string
}

export type MemberDetail = MemberBasic & {
  id: number
  bio: string | null
  btc: string | null
  github: string | null
  location: string | null
  psn: string | null
  status: 'found' | 'not_found'
  tagline: string | null
  twitter: string | null
  url: string
  website: string | null
  created: number
  last_modified: number
  meta?: {
    blocked: boolean
    watched: boolean
  }
}

export type Subtle = {
  meta: string
  content_rendered: HTMLString
}

export type TopicBasic = {
  id: number
  title: string
  replies: number
}

export type HomeTopicFeed = TopicBasic & {
  member: MemberBasic
  last_reply_time?: string
  last_reply_by?: string
  node: NodeBasic
}

export type NodeTopicFeed = TopicBasic & {
  characters: number
  clicks: number
  member: MemberBasic
}

export type MemberTopicFeed = TopicBasic & {
  node: NodeBasic
  last_reply_time?: string
  last_reply_by?: string
}

export type RepliedTopicFeed = TopicBasic & {
  member: MemberBasic
  reply_content_rendered: string
  reply_time: string
}

export type CollectedTopicFeed = TopicBasic & {
  votes?: number
  member: MemberBasic
  node: NodeBasic
  last_reply_time: string
  last_reply_by: string
}

export type TopicDetail = TopicBasic & {
  member: MemberBasic
  content_rendered: string
  created_time: string
  node: NodeBasic
  subtles: Array<Subtle>
  collected?: boolean
  thanked?: boolean
  blocked?: boolean
  reported?: boolean
  clicks?: number
  canAppend?: boolean
}

export type ViewedTopic = TopicDetail & {
  viewed_at: number
}

export type TopicReply = {
  id: number
  num: number
  content: string
  content_rendered: string
  reply_time: string
  reply_device?: string
  thanks_count: number
  member: MemberBasic
  member_is_op: boolean
  member_is_mod: boolean
  members_mentioned: string[] // array of member name
  thanked: boolean
}

export type NodeGroup = {
  title: string
  name: string
  nodes: NodeBasic[]
}
export type NodeGroups = NodeGroup[]

export type Notification = {
  id: string
  member: MemberBasic
  topic: TopicBasic
  action: 'reply' | 'collect' | 'thank' | 'thank_reply'
  content_rendered: string
  time: string
}

export type BalanceBrief = {
  gold: number
  silver: number
  bronze: number
}

// API RESPONSE
type EntityResponse<T, M = null> = {
  data: T
  meta?: M
  fetchedAt?: number
}

type PaginatedResponse<T, Meta = null> = {
  data: T[]
  pagination: {
    current: number
    total: number
  }
  meta?: Meta
  fetchedAt?: number
}

type CollectionResponse<T> = {
  data: T[]
  fetchedAt?: number
}

type StatusResponse<T = null, M = null> = {
  success: boolean
  message: string
  data?: T
  meta?: M
}

type TopicId = string | number
type ReplyId = string | number

interface TFA_Error extends ApiError {
  code: '2FA_ENABLED'
  data: {
    problems?: string[]
    once: string
  }
}
