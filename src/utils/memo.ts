export function areFeedRowPropsEqual<
  T extends {
    id?: number
    title?: string
    replies?: number
    last_reply_time?: string
    last_reply_by?: string
    member?: {
      username?: string
      avatar_normal?: string
    }
    node?: {
      name?: string
      title?: string
    }
  },
>(prevProps: FeedRowProps<T>, nextProps: FeedRowProps<T>): boolean {
  return (
    prevProps.showAvatar === nextProps.showAvatar &&
    prevProps.showLastReplyMember === nextProps.showLastReplyMember &&
    prevProps.titleStyle === nextProps.titleStyle &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.data?.id === nextProps.data?.id &&
    prevProps.data?.last_reply_time === nextProps.data?.last_reply_time &&
    prevProps.data?.replies === nextProps.data?.replies &&
    prevProps.data?.title === nextProps.data?.title &&
    prevProps.data?.last_reply_by === nextProps.data?.last_reply_by &&
    prevProps.data?.member?.username === nextProps.data?.member?.username &&
    prevProps.data?.member?.avatar_normal ===
      nextProps.data?.member?.avatar_normal &&
    prevProps.data?.node?.name === nextProps.data?.node?.name &&
    prevProps.data?.node?.title === nextProps.data?.node?.title
  )
}

export const areTopicRowPropsEqual = areFeedRowPropsEqual
