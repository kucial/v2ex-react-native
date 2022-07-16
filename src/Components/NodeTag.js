import { View, Text } from 'react-native'
import React from 'react'

export default function NodeTag(props) {
  const { data } = props
  return (
    <View className="py-[2px] px-[6px] rounded bg-gray-100">
      <Text className="text-gray-500 text-xs">{data.name}</Text>
    </View>
  )
}
