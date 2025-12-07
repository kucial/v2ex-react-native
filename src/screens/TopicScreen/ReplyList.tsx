import { ReactElement } from 'react'
import { FlashList } from '@shopify/flash-list'

import { TopicReply } from '@/utils/v2ex-client/types'

import ReplyRow from './ReplyRow'
import { UserInfoContext } from './types'

type ReplyListProps = {
  data: TopicReply[]
  pivot?: TopicReply
  header?: ReactElement
  showAvatar?: boolean
  onReply: (reply: TopicReply) => void
  onThank: (reply: TopicReply) => void
  onShowUserInfo?: (context: UserInfoContext) => void
  className?: string
  contentContainerClassName?: string
}

export default function ReplyList({
  data,
  pivot,
  onReply,
  onThank,
  onShowUserInfo,
  showAvatar,
  header,
  className,
  contentContainerClassName,
}: ReplyListProps) {
  return (
    <FlashList
      data={data}
      className={className}
      contentContainerClassName={contentContainerClassName}
      extraData={{
        pivot,
      }}
      nestedScrollEnabled
      ListHeaderComponent={header}
      renderItem={({ item: reply, extraData }) => (
        <ReplyRow
          showAvatar={showAvatar}
          key={reply.id}
          isPivot={reply.id === extraData.pivot?.id}
          data={reply}
          onReply={onReply}
          onThank={onThank}
          onShowUserInfo={onShowUserInfo}
        />
      )}
    />
  )
}
