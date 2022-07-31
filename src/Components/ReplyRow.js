import { View, Text, Image, Pressable, useWindowDimensions } from 'react-native'
import React from 'react'
import TimeAgo from '@/Components/TimeAgo'
import RenderHtml from '@/Components/RenderHtml'
import { useNavigation } from '@react-navigation/native'

export default function ReplyRow(props) {
  const { width } = useWindowDimensions()
  const { data, num } = props
  const { member } = data
  const navigation = useNavigation()
  return (
    <View className="bg-white border-b border-gray-200">
      <View className="flex-1 py-2 pl-1">
        <View className="flex flex-row mb-1">
          <View className="flex flex-row items-center flex-1 space-x-2 pl-1 ">
            <Image
              source={{
                uri: member.avatar_mini
              }}
              className="w-[24px] h-[24px] rounded"
            />
            <View className="">
              <Pressable
                hitSlop={4}
                className="active:opacity-60"
                onPress={() => {
                  navigation.push('member', {
                    username: member.username
                  })
                }}>
                <Text className="font-bold text-xs text-gray-700">
                  {member.username}
                </Text>
              </Pressable>
            </View>
            <View className="relative top-[1px]">
              <Text className="text-gray-400">·</Text>
            </View>
            <Text className="text-xs text-gray-400">
              <TimeAgo date={data.created * 1000} />
            </Text>
          </View>
          <View className="pr-2 space-x-2 justify-center">
            <View className="px-[3px] rounded-full">
              <Text className="text-xs text-gray-400">#{num}</Text>
            </View>
          </View>
        </View>
        <View className="pl-[34px] pr-4 py-2">
          <RenderHtml
            contentWidth={width - 50}
            source={{
              html: data.content_rendered,
              baseUrl: 'https://v2ex.com'
            }}
          />
        </View>
      </View>
    </View>
  )
}
