import { memo, useMemo } from 'react'
import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import FastImage from 'react-native-fast-image'

import HtmlRender from '@/components/HtmlRender'
import { Box } from '@/components/Skeleton/Elements'
import { useTheme } from '@/containers/ThemeService'

function TopicInfo(props) {
  const { data: topic, navigation } = props
  const { member, node } = topic
  const { width } = useWindowDimensions()
  const { styles } = useTheme()

  return (
    <>
      <View className="flex flex-row mb-2">
        <View className="flex flex-row flex-1">
          <Pressable
            hitSlop={4}
            onPress={() => {
              navigation.push('member', {
                username: member.username,
              })
            }}>
            {member.avatar_large || member.avatar_normal ? (
              <FastImage
                source={{
                  uri: member.avatar_large || member.avatar_normal,
                  priority: 'low',
                }}
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
                    username: member.username,
                  })
                }}>
                <Text className="font-medium" style={styles.text_meta}>
                  {member.username}
                </Text>
              </Pressable>
            </View>
            <View className="ml-2">
              <Text className="text-xs" style={styles.text_meta}>
                {topic.created_time}
              </Text>
            </View>
          </View>
        </View>
        <View>
          {node && (
            <Pressable
              className="py-1 px-[6px] rounded active:opacity-50"
              style={styles.layer2}
              hitSlop={6}
              onPress={() => {
                navigation.push('node', {
                  name: node.name,
                  brief: node,
                })
              }}>
              <Text style={styles.text_meta}>{node.title}</Text>
            </Pressable>
          )}
        </View>
      </View>
      <View className="pb-2 border-solid mb-2" style={[styles.border_b]}>
        <Text selectable className="text-lg font-semibold" style={styles.text}>
          {topic.title}
        </Text>
      </View>
      {!!topic.content_rendered && (
        <HtmlRender
          contentWidth={width - 32}
          baseStyle={{
            fontSize: 16,
          }}
          source={{
            html: topic.content_rendered,
            baseUrl: 'https://v2ex.com',
          }}
        />
      )}
      {!!topic.subtles?.length && (
        <View className="mt-2">
          {topic.subtles.map((subtle, index) => (
            <View
              className="-mx-2 pl-4 pr-2 py-2"
              style={[styles.border_t, styles.border_light, styles.highlight]}
              key={index}>
              <View className="mb-1">
                <Text className="text-xs text-neutral-500">{subtle.meta}</Text>
              </View>
              <HtmlRender
                contentWidth={width - 32}
                baseStyle={{
                  fontSize: 16,
                }}
                source={{
                  html: subtle.content_rendered,
                  baseUrl: 'https://v2ex.com',
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
