import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import TimeAgo from '@/Components/TimeAgo'

export default function TopicRow(props) {
  const { node, member, title, replies, last_touched, formatted_time_ago } =
    props.data
  const navigation = useNavigation()
  return (
    <TouchableOpacity
      className="border-b border-gray-200 bg-white flex flex-row items-center"
      onPress={() => {
        navigation.push('topic', {
          id: props.data.id,
          brief: props.data
        })
      }}>
      <View className="flex-1 py-2 pl-1">
        <View className="flex flex-row items-center space-x-2 pl-1 mb-1">
          <Pressable
            onPress={() => {
              navigation.navigate('member', {
                username: member.username,
                brief: member
              })
            }}>
            <Image
              source={{
                uri: member.avatar_mini
              }}
              className="w-[24px] h-[24px] rounded"
            />
          </Pressable>
          <View>
            <Pressable
              hitSlop={4}
              className="py-[2px] px-[6px] rounded bg-gray-100 active:opacity-60"
              onPress={() => {
                navigation.navigate('node', {
                  name: node.name,
                  brief: node
                })
              }}>
              <Text className="text-gray-500 text-xs">{node.title}</Text>
            </Pressable>
          </View>
          <Text className="text-gray-400">·</Text>
          <View className="relative top-[1px]">
            <Pressable
              className="active:opacity-60"
              onPress={() => {
                navigation.navigate('member', {
                  username: member.username,
                  brief: member
                })
              }}>
              <Text className="font-bold text-xs text-gray-700">
                {member.username}
              </Text>
            </Pressable>
          </View>
        </View>
        <View className="pl-[34px]">
          <Text className="text-base text-gray-700">{title}</Text>
          <View className="mt-2">
            <Text className="text-xs text-gray-400">
              {last_touched ? (
                <TimeAgo date={last_touched * 1000} />
              ) : (
                formatted_time_ago
              )}
            </Text>
          </View>
        </View>
      </View>
      <View className="w-[80px] flex flex-row justify-end pr-4">
        {!!replies && (
          <View className="rounded-full text-xs px-2 bg-gray-400">
            <Text className="text-white">{replies}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
