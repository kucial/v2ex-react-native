import { ReactElement } from 'react'
import { View } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { TopicReply } from '@/utils/v2ex-client/types'

import ReplyRow from './ReplyRow'
import { UserInfoContext } from './types'

type ReplyListProps = {
  data: TopicReply[]
  pivot?: TopicReply
  header?: ReactElement
  showAvatar?: boolean
  navigation: NativeStackNavigationProp<AppStackParamList>
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
  navigation,
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
          navigation={navigation}></ReplyRow>
      ))}
    </View>
  )
}
