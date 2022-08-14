import { View, Text } from 'react-native'
import React from 'react'

export default function ErrorNotice(props) {
  return (
    <View className="min-h-[60px] flex flex-row items-center justify-center bg-slate-50">
      <Text className="my-md text-center">{props.error.message}</Text>
    </View>
  )
}
