import { View, Text } from 'react-native'
import React from 'react'
import { InlineText, BlockText, InlineBox } from './Elements'
import classNames from 'classnames'

export default function NodeTopicRowSkeleton() {
  return (
    <View
      className={classNames(
        'flex flex-row items-center border-b  active:opacity-60 p-2',
        'border-neutral-200 bg-white',
        'dark:border-neutral-600 dark:bg-neutral-900'
      )}
      onPress={() => {
        navigation.push('topic', {
          id: props.data.id,
          brief: props.data
        })
      }}>
      <View className="mr-2 self-start">
        <InlineBox className="w-[24px] h-[24px] rounded" />
      </View>
      <View className="flex-1 relative top-[-2px]">
        <BlockText
          className="text-base font-medium mb-2 leading-none"
          lines={[1, 3]}
        />
        <View className="flex flex-row space-x-1">
          <InlineText className="text-xs" width={[58, 80]} />
        </View>
      </View>

      <View className="w-[80px] flex flex-row items-center justify-end pr-2">
        <InlineText
          className="rounded-full text-xs px-2 bg-neutral-400"
          width={[18, 32]}
        />
      </View>
    </View>
  )
}
