import { View } from 'react-native'

import ReplyRow from './ReplyRow'

export default function Conversation({
  data,
  pivot,
  onReply,
  onThank,
  navigation,
  showAvatar,
}) {
  return (
    <View>
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
