import { HomeTopicFeed } from "@/types/v2ex"

export type DemoRowProps = {
  data: HomeTopicFeed,
  showAvatar: boolean,
  showLastReplyMember: boolean,
  viewedStatus?: 'viewed' | 'has_update' | undefined | ''
}