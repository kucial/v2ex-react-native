import { memo } from 'react'
import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Image } from 'expo-image'

import HtmlRender from '@/components/HtmlRender'
import { BlockText, Box } from '@/components/Skeleton/Elements'
import { useAppSettings } from '@/containers/AppSettingsService'
import { usePadLayout } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { TopicDetail } from '@/utils/v2ex-client/types'

function TopicInfo(props: {
  data: TopicDetail
  navigation: NativeStackNavigationProp<AppStackParamList>
}) {
  const { data: topic, navigation } = props
  const { member, node } = topic
  const { width } = useWindowDimensions()
  const {
    data: { maxContainerWidth },
  } = useAppSettings()
  const { styles, colorScheme } = useTheme()

  const padLayout = usePadLayout()

  const CONTAINER_WIDTH = Math.min(width, maxContainerWidth)

  return (
    <>
      <View className="flex flex-row mb-2">
        {member && (
          <View className="flex flex-row flex-1">
            <Pressable
              hitSlop={4}
              onPress={() => {
                navigation.push('member', {
                  username: member.username,
                })
              }}>
              {member.avatar_large ? (
                <Image
                  source={{
                    uri: member.avatar_large,
                  }}
                  priority="low"
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
                  <Text
                    className="font-medium"
                    style={[styles.text_meta, styles.text_xs]}>
                    {member.username}
                  </Text>
                </Pressable>
              </View>
              <View className="ml-2">
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {topic.created_time}
                </Text>
              </View>
            </View>
          </View>
        )}
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
        <Text
          selectable
          className="font-semibold"
          style={[styles.text, styles.text_lg]}>
          {topic.title}
        </Text>
      </View>
      {!!topic.content_rendered && (
        <HtmlRender
          key={topic.content_rendered + colorScheme}
          navigation={navigation}
          contentWidth={
            padLayout.active ? CONTAINER_WIDTH : CONTAINER_WIDTH - 32
          }
          baseStyle={{
            fontSize: styles.text_base.fontSize,
          }}
          source={{
            html: topic.content_rendered,
            baseUrl: 'https://v2ex.com',
          }}
        />
      )}
      {topic.content_rendered === undefined && <BlockText lines={5} />}
      {!!topic.subtles?.length && (
        <View className="mt-2">
          {topic.subtles.map((subtle, index) => (
            <View
              className="-mx-2 pl-4 pr-2 py-2"
              style={[styles.border_t_light, styles.highlight]}
              key={index}>
              <View className="mb-1">
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {subtle.meta}
                </Text>
              </View>
              <HtmlRender
                key={subtle.content_rendered + colorScheme}
                navigation={navigation}
                contentWidth={CONTAINER_WIDTH - 32}
                baseStyle={{
                  fontSize: styles.text_base.fontSize,
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
