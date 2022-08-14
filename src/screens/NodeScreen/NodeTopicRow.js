import React from 'react'
import { View, Text, Pressable, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import NodeTopicRowSkeleton from '@/components/Skeleton/NodeTopicRowSkeleton'

export default function NodeTopicRow(props) {
  const navigation = useNavigation()
  const { data } = props

  if (!data) {
    return <NodeTopicRowSkeleton />
  }

  const { member } = data

  return (
    <Pressable
      className="flex flex-row items-center border-b border-gray-200 bg-white active:opacity-60 p-2"
      onPress={() => {
        navigation.push('topic', {
          id: props.data.id,
          brief: props.data
        })
      }}>
      <View className="mr-2 self-start">
        <Image
          className="w-[24px] h-[24px] rounded"
          source={{
            uri: member.avatar_normal
          }}
        />
      </View>
      <View className="flex-1 relative top-[-2px]">
        <Text className="text-base font-medium text-gray-700 mb-2 leading-none">
          {data.title}
        </Text>
        <View className="flex flex-row">
          <Text className="text-xs font-semibold text-gray-400">
            {member.username}
          </Text>
          {!!data.characters && (
            <>
              <Text className="text-xs text-gray-400 px-1">·</Text>
              <Text className="text-xs text-gray-400">
                {data.characters} 字符
              </Text>
            </>
          )}
          {!!data.clicks && (
            <>
              <Text className="text-xs text-gray-400 px-1">·</Text>
              <Text className="text-xs text-gray-400">
                {data.clicks} 次点击
              </Text>
            </>
          )}
        </View>
      </View>

      <View className="w-[80px] flex flex-row items-center justify-end pr-2">
        {!!data.replies && (
          <View className="rounded-full text-xs px-2 bg-gray-400">
            <Text className="text-white">{data.replies}</Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}
