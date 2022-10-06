import React from 'react'
import { Text, View } from 'react-native'

import { BlockText, InlineBox, InlineText } from './Elements'

export default function TopicSkeleton() {
  return (
    <View className="bg-white py-3 px-4 mb-2 shadow-sm dark:bg-neutral-900">
      <View className="flex flex-row mb-2">
        <View className="flex flex-row flex-1">
          <InlineBox className="w-[32px] h-[32px] rounded" />
          <View className="pl-2 flex flex-row items-center">
            <View className="py-[2px]">
              <InlineText className="font-medium" width={[60, 80]} />
            </View>
            <View className="ml-2">
              <InlineText className="text-xs" width={[40, 60]} />
            </View>
          </View>
        </View>
        <View>
          <InlineBox
            className="py-1 px-[6px] rounded"
            width={[48, 72]}></InlineBox>
        </View>
      </View>
      <View className="pb-2 border-b border-b-neutral-300 border-solid mb-2">
        <BlockText className="text-lg font-semibold" lines={[1, 3]} />
      </View>
      <View className="mt-1">
        <BlockText lines={[5, 10]} />
      </View>
    </View>
  )
}
