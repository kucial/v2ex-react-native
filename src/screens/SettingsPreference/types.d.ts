import { HomeTopicFeed } from '@/utils/v2ex-client/types'

export type DemoRowProps = {
  data: HomeTopicFeed
  showAvatar: boolean
  showLastReplyMember: boolean
  viewedStatus?: 'viewed' | 'has_update' | undefined | ''
  titleStyle: 'normal' | 'emphasized'
}
