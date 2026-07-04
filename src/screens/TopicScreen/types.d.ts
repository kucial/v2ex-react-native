import { RefObject } from 'react'

import { TopicReply } from '@/utils/v2ex-client/types'

import { ScrollControlApi } from './ScrollControl'

export type BarProps = {
  onInitReply(): void
  repliesCount: number
  onNavTo(target: number): void
  scrollControlRef: RefObject<ScrollControlApi | null>
  collected: boolean
  onToggleCollect(): void
  thanked: boolean
  onThankTopic(): void
  onShare(): void
  isFocused?: boolean
}

export type ConversationContext = {
  type: 'reply'
  data: TopicReply
}

export type UserInfoContext = {
  type: 'member'
  data: string
}

export type ReplyContext = {
  type: 'reply' | 'append'
  target?: TopicReply
}
