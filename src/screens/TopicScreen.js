import {
  Text,
  View,
  Image,
  useWindowDimensions,
  Pressable,
  FlatList,
  SafeAreaView
} from 'react-native'
import React, { useLayoutEffect, useMemo } from 'react'
// import { TagIcon } from 'react-native-heroicons/outline'

import TimeAgo from '@/Components/TimeAgo'
import RenderHtml from '@/Components/RenderHtml'
import ReplyRow from '@/Components/ReplyRow'
import useSWR from 'swr'

const maxLen = (str = '', limit = 0) => {
  if (limit && str.length > limit) {
    return str.slice(0, limit) + ' ...'
  }
  return str
}

const htmlBaseStyle = {
  fontSize: 16
}

// ·
export default function TopicScreen({ navigation, route }) {
  const {
    params: { brief, id }
  } = route
  const topicSwr = useSWR([
    '/api/topics/show.json',
    {
      params: {
        id
      }
    }
  ])

  const repliesSwr = useSWR([
    '/api/replies/show.json',
    {
      params: {
        topic_id: id
      }
    }
  ])

  const { width } = useWindowDimensions()

  const topic = topicSwr.data?.[0] || brief || {}
  const isFallback = topic === brief

  useLayoutEffect(() => {
    if (topic.title) {
      const title = maxLen(topic.title, 16)
      navigation.setOptions({
        title
      })
    }
  }, [topic?.title])

  const { renderReply, keyExtractor } = useMemo(() => {
    return {
      renderReply({ item, index }) {
        return <ReplyRow data={item} num={index + 1} />
      },
      keyExtractor(item) {
        return item.id
      }
    }
  }, [])

  if (!topic) {
    return (
      <View>
        <Text>LOADING</Text>
      </View>
    )
  }

  const { member, node } = topic

  console.log('topic.content', topic)

  // return null

  const baseContent = (
    <>
      <View className="bg-white py-3 px-4 mb-2 shadow-sm">
        <View className="flex flex-row mb-2">
          <View className="flex flex-row flex-1">
            <Image
              source={{ uri: member.avatar_normal }}
              className="w-[32px] h-[32px] rounded"
            />
            <View className="pl-2 flex flex-row items-center">
              <View className="py-[2px]">
                <Text className="font-medium">{member.username}</Text>
              </View>
              <View className="ml-2">
                {topic.created && (
                  <Text className="text-gray-400 text-xs">
                    <TimeAgo date={topic.created * 1000} />
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View>
            <Pressable
              className="py-1 px-[6px] rounded bg-gray-100 active:opacity-50"
              hitSlop={6}
              onPress={() => {
                navigation.navigate('node', {
                  id: node.id,
                  brief: node
                })
              }}>
              <Text className="text-gray-500">{node.title}</Text>
            </Pressable>
          </View>
        </View>
        <View className="pb-2 border-b border-b-gray-300 border-solid mb-2">
          <Text className="text-lg font-semibold">{topic.title}</Text>
        </View>
        {!!topic.content_rendered && (
          <RenderHtml
            contentWidth={width - 32}
            source={{
              html: topic.content_rendered,
              baseUrl: 'https://v2ex.com'
            }}
            baseStyle={htmlBaseStyle}
          />
        )}
        {isFallback && (
          <View className="mt-1">
            <Text className="text-gray-400">LOADING....</Text>
          </View>
        )}
      </View>
      {/* <View className="bg-white p-4 mb-2">
        <TagIcon size={18} color={'#444'} />
      </View> */}
    </>
  )

  return (
    <View className="flex-1">
      <FlatList
        className="flex-1"
        data={repliesSwr.data || []}
        ListHeaderComponent={() => baseContent}
        ListFooterComponent={() => (
          <SafeAreaView>
            <View className="flex flex-row justify-center py-4">
              <Text className="text-gray-400">
                {topic.replies && repliesSwr.data && repliesSwr.data.length > 0
                  ? '到底底部啦'
                  : ''}
              </Text>
            </View>
          </SafeAreaView>
        )}
        renderItem={renderReply}
        keyExtractor={keyExtractor}
      />
    </View>
  )
}
