import React, { memo } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'

import FixedPressable from '@/components/FixedPressable'
import {
  BlockText,
  Box,
  InlineBox,
  InlineText
} from '@/components/Skeleton/Elements'

function NodeTopicRow(props) {
  const navigation = useNavigation()
  const { data, showAvatar } = props

  if (!data) {
    return (
      <View
        className={classNames(
          'border-b flex flex-row items-center',
          'border-neutral-200 bg-white',
          'dark:border-neutral-700 dark:bg-neutral-900'
        )}>
        {showAvatar ? (
          <View className="px-2 py-2 self-start">
            <Box className="w-[24px] h-[24px] rounded" />
          </View>
        ) : (
          <View className="pl-3"></View>
        )}
        <View className="flex-1 pt-1 pb-2">
          <BlockText
            randomWidth
            lines={[1, 2]}
            className="text-[16px] leading-[22px]"></BlockText>
          <View className="mt-1">
            <InlineText width={[80, 120]} className="text-xs"></InlineText>
          </View>
        </View>
        <View className="flex flex-row justify-end pl-1 pr-2">
          <Box className="rounded-full px-2">
            <InlineText width={8} className="text-xs" />
          </Box>
        </View>
      </View>
    )
  }

  const { member, replies } = data

  return (
    <FixedPressable
      className="flex flex-row items-center border-b border-neutral-200 bg-white active:opacity-60 dark:bg-neutral-900 dark:border-neutral-600"
      onPress={() => {
        navigation.push('topic', {
          id: props.data.id,
          brief: props.data
        })
      }}>
      {showAvatar ? (
        <View className="px-2 py-2 self-start">
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
      ) : (
        <View className="pl-3"></View>
      )}

      <View
        className={classNames(
          'flex-1 pt-1 pb-2',
          props.viewed && 'opacity-70'
        )}>
        <Text className="text-[16px] leading-[22px] text-neutral-700 dark:text-neutral-300">
          {data.title}
        </Text>
        <View className="mt-1 flex flex-row">
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

      <View className="flex flex-row justify-end pl-1 pr-2">
        {!!replies && (
          <View className="rounded-full px-1 bg-neutral-400 dark:bg-neutral-600">
            <Text className="text-white text-xs dark:text-neutral-300">
              {replies}
            </Text>
          </View>
        )}
      </View>
    </FixedPressable>
  )
}
export default memo(NodeTopicRow)
