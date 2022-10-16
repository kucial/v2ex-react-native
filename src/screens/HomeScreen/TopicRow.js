import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'

import FixedPressable from '@/components/FixedPressable'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'

export default function TopicRow(props) {
  const { data } = props
  const navigation = useNavigation()

  if (!data) {
    return (
      <View
        className={classNames(
          'border-b flex flex-row items-center',
          'border-neutral-200 bg-white',
          'dark:border-neutral-700 dark:bg-neutral-900'
        )}>
        <View className="flex-1 py-2 pl-1">
          <View className="flex flex-row items-center space-x-2 pl-1 mb-1">
            <Box className="w-[24px] h-[24px] rounded" />
            <View>
              <View className="py-[2px] rounded w-[50px]">
                <InlineText className="text-xs"></InlineText>
              </View>
            </View>
            <Text className="text-neutral-200 dark:text-neutral-500">·</Text>
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
          <Box className="rounded-full px-2">
            <InlineText width={8} className="text-xs" />
          </Box>
        </View>
      </View>
    )
  }

  const { node, member, title, replies } = props.data

  return (
    <FixedPressable
      sentry-label="TopicRow"
      className={classNames(
        'border-b flex flex-row items-center active:opacity-50',
        'border-neutral-200 bg-white',
        'dark:border-neutral-700 dark:bg-neutral-900'
      )}
      onPress={() => {
        navigation.push('topic', {
          id: props.data.id,
          brief: props.data
        })
      }}>
      <View className="px-2 py-2 self-start">
        <FixedPressable
          onPress={() => {
            navigation.navigate('member', {
              username: member.username,
              brief: member
            })
          }}>
          <FastImage
            source={{
              uri: member.avatar_mini
            }}
            className="w-[24px] h-[24px] rounded"
          />
        </FixedPressable>
      </View>
      <View className={classNames('flex-1 py-2', props.viewed && 'opacity-80')}>
        <View className="flex flex-row items-center pt-[2px] space-x-1 mb-1">
          <View>
            <FixedPressable
              hitSlop={4}
              className="py-[2px] px-[6px] rounded bg-neutral-100 active:opacity-60 dark:bg-neutral-750"
              onPress={() => {
                navigation.navigate('node', {
                  name: node.name,
                  brief: node
                })
              }}>
              <Text className="text-xs text-neutral-500 dark:text-neutral-300">
                {node.title}
              </Text>
            </FixedPressable>
          </View>
          <Text className="text-neutral-400 dark:text-neutral-300">·</Text>
          <View className="relative top-[1px]">
            <FixedPressable
              className="active:opacity-60"
              hitSlop={5}
              onPress={() => {
                navigation.navigate('member', {
                  username: member.username,
                  brief: member
                })
              }}>
              <Text className="font-bold text-xs text-neutral-700 dark:text-neutral-300">
                {member.username}
              </Text>
            </FixedPressable>
          </View>
        </View>
        <View>
          <Text className="text-base text-neutral-700 dark:text-neutral-300">
            {title}
          </Text>
          <View className="mt-2 flex flex-row items-center">
            <Text className="text-xs text-neutral-400">
              {data?.last_reply_time}
            </Text>
            {data?.last_reply_by && (
              <>
                <Text className="text-neutral-400 text-xs px-2">•</Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs text-neutral-400 dark:text-neutral-300">
                    最后回复来自
                  </Text>
                  <FixedPressable
                    className="px-1 active:opacity-60"
                    hitSlop={4}
                    onPress={() => {
                      navigation.push('member', {
                        username: data.last_reply_by
                      })
                    }}>
                    <Text className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {data.last_reply_by}
                    </Text>
                  </FixedPressable>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      <View className="w-[80px] flex flex-row justify-end pr-4">
        {!!replies && (
          <View className="rounded-full text-xs px-2 bg-neutral-400 dark:bg-neutral-600">
            <Text className="text-white dark:text-neutral-300">{replies}</Text>
          </View>
        )}
      </View>
    </FixedPressable>
  )
}
