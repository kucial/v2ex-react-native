import { View } from 'react-native'
import React from 'react'
import ReplyRow from './ReplyRow'

export default function Conversation({ data, pivot, onReply, onThank }) {
  return (
    <View>
      {data.map((reply) => (
        <ReplyRow
          key={reply.id}
          isPivot={reply.id === pivot.id}
          data={reply}
          onReply={onReply}
          onThank={onThank}></ReplyRow>
      ))}
    </View>
  )
}
