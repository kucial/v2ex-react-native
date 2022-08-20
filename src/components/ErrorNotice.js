import { View, Text } from 'react-native'
import React from 'react'

export default function ErrorNotice(props) {
  return (
    <View className="min-h-[60px] py-5 bg-slate-50" style={props.style}>
      <View className="flex flex-row items-center justify-center">
        <Text className="my-md text-center">{props.error.message}</Text>
      </View>
      {props.extra}
    </View>
  )
}
