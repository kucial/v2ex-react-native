import { ViewedTopicSummary } from '@/stores/viewedTopics'
import {
  CollectedTopicFeed,
  HomeTopicFeed,
  MemberTopicFeed,
  NodeTopicFeed,
  PlanetFeedItem,
  RepliedTopicFeed,
  XnaFeed,
} from '@/utils/v2ex-client/types'

declare global {
  type FeedRowProps<T> = {
    data?: T
    isLast?: boolean
    showAvatar: boolean
    showLastReplyMember: boolean
    titleStyle: 'normal' | 'emphasized'
  }
  type HomeFeedRowProps = FeedRowProps<HomeTopicFeed>
  type NodeFeedRowProps = FeedRowProps<NodeTopicFeed>
  type MemberFeedRowProps = FeedRowProps<MemberTopicFeed>
  type RepliedFeedRowProps = { data: RepliedTopicFeed; isLast?: boolean }
  type CollectedTopicRowProps = {
    data: CollectedTopicFeed
    titleStyle: 'normal' | 'emphasized'
    isLast?: boolean
  }
  type ViewedTopicRowProps = {
    data: ViewedTopicSummary
    showAvatar: boolean
    titleStyle: 'normal' | 'emphasized'
    isLast?: boolean
  }
  type XnaFeedRowProps = {
    data: XnaFeed
    isLast?: boolean
    showAvatar: boolean
    titleStyle: 'normal' | 'emphasized'
    viewedStatus?: 'viewed' | 'has_update' | undefined
    onView?: (url: string) => void
  }
  type PlanetFeedRowProps = {
    data: PlanetFeedItem
    isLast?: boolean
    showAvatar: boolean
    titleStyle: 'normal' | 'emphasized'
    viewedStatus?: 'viewed' | 'has_update' | undefined
    onView?: (url: string) => void
    variant?: 'feed' | 'site'
  }
}

export {}
