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
import replies from '@/mock/replies'
import { useTailwind } from 'tailwindcss-react-native'

const maxLen = (str, limit = 0) => {
  if (limit && str.length > limit) {
    return str.slice(0, limit) + ' ...'
  }
  return str
}

// ·
export default function TopicScreen({ navigation, route }) {
  const { width } = useWindowDimensions()
  const tw = useTailwind()
  const {
    params: { data: topic }
  } = route
  const { member, node } = topic

  useLayoutEffect(() => {
    const title = maxLen(topic.title, 16)
    navigation.setOptions({
      title
    })
  }, [])

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

  const baseContent = (
    <>
      <View className="bg-white p-4 mb-2 shadow-sm">
        <View className="flex flex-row">
          <View className="flex flex-row flex-1">
            <Image
              source={{ uri: member.avatar_normal }}
              className="w-[40px] h-[40px] rounded"
            />
            <View className="pl-2 mb-3">
              <View className="flex flex-row space-x-2">
                <View className="py-[2px]">
                  <Text className="font-medium">{member.username}</Text>
                </View>
              </View>
              <View className="mt-[1px]">
                <Text className="text-gray-400 text-xs">
                  <TimeAgo date={topic.created * 1000} />
                </Text>
              </View>
            </View>
          </View>
          <View>
            <Pressable
              className="py-1 px-[6px] rounded bg-gray-100 active:opacity-50"
              hitSlop={6}
              onPress={() => {
                navigation.push('node', {
                  id: node.id,
                  data: node
                })
              }}>
              <Text className="text-gray-500">{node.title}</Text>
            </Pressable>
          </View>
        </View>
        <View className="pb-2 border-b border-b-gray-300 border-solid">
          <Text className="text-lg font-semibold">{topic.title}</Text>
        </View>

        <RenderHtml
          contentWidth={width - 32}
          source={{ html: topic.content_rendered }}
          baseStyle={tw('text-base')}
        />
      </View>
      {/* <View className="bg-white p-4 mb-2">
        <TagIcon size={18} color={'#444'} />
      </View> */}
    </>
  )

  return (
    <SafeAreaView className="bg-white">
      <View className="bg-gray-100">
        <FlatList
          data={replies}
          ListHeaderComponent={() => baseContent}
          renderItem={renderReply}
          keyExtractor={keyExtractor}
        />
      </View>
    </SafeAreaView>
  )
}
