import { MutableRefObject } from 'react'

import { TopicReply } from '@/utils/v2ex-client/types'

import { ScrollControlApi } from './ScrollControl'

export type BarProps = {
  onInitReply(): void
  repliesCount: number
  onNavTo(target: number): void
  scrollControlRef: MutableRefObject<ScrollControlApi>
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
