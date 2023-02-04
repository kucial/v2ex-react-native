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
    showAvatar: boolean
    showLastReplyMember: boolean
    viewedStatus?: 'viewed' | 'has_update' | undefined
  }
  type HomeFeedRowProps = FeedRowProps<HomeTopicFeed>
  type NodeFeedRowProps = FeedRowProps<NodeTopicFeed>
  type MemberFeedRowProps = FeedRowProps<MemberTopicFeed>
  type RepliedFeedRowProps = { data: RepliedTopicFeed }
  type CollectedTopicRowProps = { data: CollectedTopicFeed }
  type ViewedTopicRowProps = {
    data: ViewedTopic
    showAvatar: boolean
  }
}

export {}
