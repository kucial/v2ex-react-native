import { View, Text } from 'react-native'
import React from 'react'

import TopicRowSkeleton from './TopicRowSkeleton'
import { InlineText } from './Elements'

export default function HomeSkeleton() {
  return (
    <View>
      <View className="h-[46px] flex flex-row bg-white overflow-hidden dark:bg-neutral-800">
        <View className="px-[12px] flex flex-row items-center justify-center">
          <InlineText className="text-base" width={[48, 64]} />
        </View>
        <View className="px-[12px] flex flex-row items-center justify-center">
          <InlineText className="text-base" width={[48, 64]} />
        </View>
        <View className="px-[12px] flex flex-row items-center justify-center">
          <InlineText className="text-base" width={[48, 64]} />
        </View>
        <View className="px-[12px] flex flex-row items-center justify-center">
          <InlineText className="text-base" width={[48, 64]} />
        </View>
        <View className="px-[12px] flex flex-row items-center justify-center">
          <InlineText className="text-base" width={[48, 64]} />
        </View>
      </View>
      <View className="border-t border-neutral-200 dark:border-neutral-800">
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
      </View>
    </View>
  )
}
