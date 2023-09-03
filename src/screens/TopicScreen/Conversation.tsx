import { View } from 'react-native'

import { TopicReply } from '@/utils/v2ex-client/types'

import ReplyRow from './ReplyRow'

type ConversationProps = {
  data: TopicReply[]
  pivot: TopicReply | string
}

export default function Conversation({
  data,
  pivot,
  onReply,
  onThank,
  navigation,
  showAvatar,
  header,
}) {
  return (
    <View>
      {header}
      {data.map((reply) => (
        <ReplyRow
          showAvatar={showAvatar}
          key={reply.id}
          isPivot={reply.id === pivot.id}
          data={reply}
          onReply={onReply}
          onThank={onThank}
          navigation={navigation}></ReplyRow>
      ))}
    </View>
  )
}
