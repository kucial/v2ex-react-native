import { View, Text, ScrollView, useWindowDimensions } from 'react-native'
import React from 'react'
import ReplyRow from './ReplyRow'

export default function Conversation({ data, pivot, onReply, onThank }) {
  console.log(data)
  const { width, height } = useWindowDimensions()
  return (
    <ScrollView
      style={{
        width: width,
        maxHeight: height - 140
      }}
      contentContainerStyle={{ paddingTop: 8 }}>
      {data.map((reply) => (
        <ReplyRow
          key={reply.id}
          isPivot={reply.id === pivot.id}
          data={reply}
          onReply={onReply}
          onThank={onThank}></ReplyRow>
      ))}
    </ScrollView>
  )
}
