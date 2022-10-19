import React, { memo, useMemo } from 'react'
import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import FastImage from 'react-native-fast-image'

import HtmlRender from '@/components/HtmlRender'
import { Box } from '@/components/Skeleton/Elements'

function TopicInfo(props) {
  const { data: topic, navigation } = props
  const { member, node } = topic
  const { width } = useWindowDimensions()

  const htmlRenderProps = useMemo(() => {
    if (!topic) {
      return {}
    }
    return {
      baseStyle: {
        fontSize: 16
      },
      source: {
        html: topic.content_rendered,
        baseUrl: 'https://v2ex.com'
      }
    }
  }, [topic.content_rendered])

  return (
    <>
      <View className="flex flex-row mb-2">
        <View className="flex flex-row flex-1">
          <Pressable
            hitSlop={4}
            onPress={() => {
              navigation.push('member', {
                username: member.username
              })
            }}>
            {member.avatar_large ? (
              <FastImage
                source={{ uri: member.avatar_large }}
                className="w-[32px] h-[32px] rounded"
              />
            ) : (
              <Box className="w-[32px] h-[32px] rounded" />
            )}
          </Pressable>
          <View className="pl-2 flex flex-row items-center">
            <View className="py-[2px]">
              <Pressable
                hitSlop={4}
                onPress={() => {
                  navigation.push('member', {
                    username: member.username
                  })
                }}>
                <Text className="font-medium dark:text-neutral-300">
                  {member.username}
                </Text>
              </Pressable>
            </View>
            <View className="ml-2">
              <Text className="text-neutral-400 text-xs dark:text-neutral-300">
                {topic.created_time}
              </Text>
            </View>
          </View>
        </View>
        <View>
          {node && (
            <Pressable
              className="py-1 px-[6px] rounded bg-neutral-100 active:opacity-50 dark:bg-neutral-750"
              hitSlop={6}
              onPress={() => {
                navigation.push('node', {
                  name: node.name,
                  brief: node
                })
              }}>
              <Text className="text-neutral-500 dark:text-neutral-300">
                {node.title}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
      <View className="pb-2 border-b border-b-neutral-300 border-solid mb-2 dark:border-b-neutral-600">
        <Text
          selectable
          className="text-lg font-semibold dark:text-neutral-300">
          {topic.title}
        </Text>
      </View>
      {!!topic.content_rendered && (
        <HtmlRender contentWidth={width - 32} {...htmlRenderProps} />
      )}
      {!!topic.subtles?.length && (
        <View className="mt-2">
          {topic.subtles.map((subtle, index) => (
            <View
              className="-mx-2 pl-4 pr-2 py-2 border-t border-neutral-300 dark:border-neutral-700 bg-[#ffff0008] dark:bg-[#ffff8808]"
              key={index}>
              <View className="mb-1">
                <Text className="text-xs text-neutral-500">{subtle.meta}</Text>
              </View>
              <HtmlRender
                contentWidth={width - 32}
                {...htmlRenderProps}
                source={{
                  html: subtle.content_rendered
                }}
              />
            </View>
          ))}
        </View>
      )}
    </>
  )
}

export default memo(TopicInfo)
