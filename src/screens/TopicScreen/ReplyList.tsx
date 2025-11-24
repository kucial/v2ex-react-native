import { ReactElement } from 'react'
import { View } from 'react-native'

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
}

export default function ReplyList({
  data,
  pivot,
  onReply,
  onThank,
  onShowUserInfo,
  showAvatar,
  header,
}: ReplyListProps) {
  return (
    <View>
      {header || null}
      {data.map((reply) => (
        <ReplyRow
          showAvatar={showAvatar}
          key={reply.id}
          isPivot={reply.id === pivot?.id}
          data={reply}
          onReply={onReply}
          onThank={onThank}
          onShowUserInfo={onShowUserInfo}
        />
      ))}
    </View>
  )
}
