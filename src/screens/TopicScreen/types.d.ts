import { MutableRefObject } from 'react'

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
}
