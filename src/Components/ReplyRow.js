import { View, Text, Image, useWindowDimensions } from 'react-native'
import React from 'react'
import TimeAgo from '@/Components/TimeAgo'
import RenderHtml from '@/Components/RenderHtml'

export default function ReplyRow(props) {
  const { width } = useWindowDimensions()
  const { data, num } = props
  const { member } = data
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
              <Text className="font-bold text-xs text-gray-700">
                {member.username}
              </Text>
            </View>
            <View className="relative top-[1px]">
              <Text className="text-gray-400">·</Text>
            </View>
            <Text className="text-xs text-gray-400">
              <TimeAgo date={data.created * 1000} />
            </Text>
          </View>
          <View className="pr-2 space-x-2 justify-center">
            <View className="bg-gray-300 px-[3px] rounded-full">
              <Text className="text-xs text-white">{num}</Text>
            </View>
          </View>
        </View>
        <View className="pl-[34px] pr-4 pb-2">
          <RenderHtml
            contentWidth={width - 50}
            source={{ html: `<div>${data.content_rendered}</div>` }}
          />
        </View>
      </View>
    </View>
  )
}
