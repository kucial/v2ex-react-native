import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import NodeTag from '@/Components/NodeTag'
import TimeAgo from '@/Components/TimeAgo'

export default function TopicRow(props) {
  const { node, member, title, replies, last_touched } = props.data
  const navigation = useNavigation()
  return (
    <TouchableOpacity
      className="border-b border-gray-200 bg-white flex flex-row items-center"
      onPress={() => {
        navigation.navigate('topic', {
          data: props.data,
          id: props.data.id
        })
      }}>
      <View className="flex-1 py-2 pl-1">
        <View className="flex flex-row items-center space-x-2 pl-1 mb-1">
          <Image
            source={{
              uri: member.avatar_mini
            }}
            className="w-[24px] h-[24px] rounded"
          />
          <View>
            <NodeTag data={node} />
          </View>
          <Text className="text-gray-400">·</Text>
          <View className="relative top-[1px]">
            <Text className="font-bold text-xs text-gray-700">
              {member.username}
            </Text>
          </View>
        </View>
        <View className="pl-[34px]">
          <Text className="text-base text-gray-700">{title}</Text>
          <View className="mt-2">
            <Text className="text-xs text-gray-400">
              <TimeAgo date={last_touched * 1000} />
            </Text>
          </View>
        </View>
      </View>
      <View className="w-[72px] flex flex-row justify-end pr-4">
        {!!replies && (
          <View className="rounded-full text-xs px-2 bg-gray-400">
            <Text className="text-white">{replies}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
