import React from 'react'
import { Text, View } from 'react-native'

export default function ErrorNotice(props) {
  return (
    <View
      className="min-h-[60px] py-5 bg-neutral-50 dark:bg-neutral-800"
      style={props.style}>
      <View className="flex flex-row items-center justify-center">
        <Text className="my-md text-center dark:text-neutral-300">
          {props.error.message}
        </Text>
      </View>
      {props.extra}
    </View>
  )
}
