import React, { memo } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'

import FixedPressable from '@/components/FixedPressable'
import NodeTopicRowSkeleton from '@/components/Skeleton/NodeTopicRowSkeleton'

function NodeTopicRow(props) {
  const navigation = useNavigation()
  const { data } = props

  if (!data) {
    return <NodeTopicRowSkeleton />
  }

  const { member } = data

  return (
    <FixedPressable
      className="flex flex-row items-center border-b border-neutral-200 bg-white active:opacity-60 p-2 dark:bg-neutral-900 dark:border-neutral-600"
      onPress={() => {
        navigation.push('topic', {
          id: props.data.id,
          brief: props.data
        })
      }}>
      <View className="mr-2 self-start">
        <FixedPressable
          onPress={() => {
            navigation.navigate('member', {
              username: member.username,
              brief: member
            })
          }}>
          <FastImage
            className="w-[24px] h-[24px] rounded"
            source={{
              uri: member.avatar_normal,
              priority: FastImage.priority.low
            }}
          />
        </FixedPressable>
      </View>
      <View
        className={classNames(
          'flex-1 relative top-[-2px]',
          props.viewed && 'opacity-80'
        )}>
        <Text className="text-base font-medium text-neutral-700 mb-2 leading-none dark:text-neutral-300">
          {data.title}
        </Text>
        <View className="flex flex-row">
          <Text className="text-xs font-semibold text-neutral-400">
            {member.username}
          </Text>
          {!!data.characters && (
            <>
              <Text className="text-xs text-neutral-400 px-1">·</Text>
              <Text className="text-xs text-neutral-400">
                {data.characters} 字符
              </Text>
            </>
          )}
          {!!data.clicks && (
            <>
              <Text className="text-xs text-neutral-400 px-1">·</Text>
              <Text className="text-xs text-neutral-400">
                {data.clicks} 次点击
              </Text>
            </>
          )}
        </View>
      </View>

      <View className="w-[80px] flex flex-row items-center justify-end pr-2">
        {!!data.replies && (
          <View className="rounded-full text-xs px-2 bg-neutral-400 dark:bg-neutral-750">
            <Text className="text-white dark:text-neutral-300">
              {data.replies}
            </Text>
          </View>
        )}
      </View>
    </FixedPressable>
  )
}
export default memo(NodeTopicRow)
