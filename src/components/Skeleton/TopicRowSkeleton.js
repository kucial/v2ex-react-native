import { View, Text } from 'react-native'
import React from 'react'
import { InlineText, BlockText } from './Elements'

export default function TopicRowSkeleton() {
  return (
    <View className="border-b border-gray-200 bg-white flex flex-row items-center">
      <View className="flex-1 py-2 pl-1">
        <View className="flex flex-row items-center space-x-2 pl-1 mb-1">
          <View className="w-[24px] h-[24px] rounded bg-gray-100" />
          <View>
            <View className="py-[2px] rounded w-[50px]">
              <InlineText className="text-xs"></InlineText>
            </View>
          </View>
          <Text className="text-gray-200">·</Text>
          <View className="relative">
            <InlineText width={[56, 80]} className="text-xs"></InlineText>
          </View>
        </View>
        <View className="pl-[34px]">
          <BlockText
            randomWidth
            lines={[1, 3]}
            className="text-base"></BlockText>
          <View className="mt-2">
            <InlineText width={[80, 120]} className="text-xs"></InlineText>
          </View>
        </View>
      </View>
      <View className="w-[80px] flex flex-row justify-end pr-4">
        <View className="rounded-full px-2 bg-gray-100">
          <InlineText width={8} className="text-xs" />
        </View>
      </View>
    </View>
  )
}
