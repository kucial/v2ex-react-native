import {
  CollectedTopicFeed,
  HomeTopicFeed,
  MemberTopicFeed,
  NodeTopicFeed,
  RepliedTopicFeed,
  TopicDetail,
} from './v2ex'

declare global {
  type FeedRowProps<T> = {
    data?: T
    isLast?: boolean
    showAvatar: boolean
    showLastReplyMember: boolean
    titleStyle: 'normal' | 'emphasized'
    viewedStatus?: 'viewed' | 'has_update' | undefined
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
    data: ViewedTopic
    showAvatar: boolean
    titleStyle: 'normal' | 'emphasized'
    isLast?: boolean
  }
}

export {}
