import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import {
  BlockText,
  InlineBox,
  InlineText
} from '@/components/Skeleton/Elements'
import FixedPressable from '@/components/FixedPressable'

export default function TopicRow(props) {
  const { data } = props
  const navigation = useNavigation()

  if (!data) {
    return (
      <View className="border-b border-gray-200 bg-white flex flex-row items-center">
        <View className="flex-1 py-2 pl-1">
          <View className="flex flex-row items-center space-x-2 pl-1 mb-1">
            <View className="w-[24px] h-[24px] rounded bg-gray-100" />
            <View>
              <View className="py-[2px] rounded w-[50px]">
                <InlineText className="text-xs"></InlineText>
              </View>
            </View>
            <Text className="text-gray-200">·</Text>
            <View className="relative">
              <InlineText width={[56, 80]} className="text-xs"></InlineText>
            </View>
          </View>
          <View className="pl-[34px]">
            <BlockText
              randomWidth
              lines={[1, 3]}
              className="text-base"></BlockText>
            <View className="mt-2">
              <InlineText width={[80, 120]} className="text-xs"></InlineText>
            </View>
          </View>
        </View>
        <View className="w-[80px] flex flex-row justify-end pr-4">
          <View className="rounded-full px-2 bg-gray-100">
            <InlineText width={8} className="text-xs" />
          </View>
        </View>
      </View>
    )
  }

  const { node, member, title, replies } = props.data

  return (
    <FixedPressable
      className="border-b border-gray-200 bg-white flex flex-row items-center active:opacity-50"
      onPress={() => {
        navigation.push('topic', {
          id: props.data.id,
          brief: props.data
        })
      }}>
      <View className="flex-1 py-2 pl-1">
        <View className="flex flex-row items-center space-x-2 pl-1 mb-1">
          <FixedPressable
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
          </FixedPressable>
          <View>
            <FixedPressable
              hitSlop={4}
              className="py-[2px] px-[6px] rounded bg-gray-100 active:opacity-60"
              onPress={() => {
                navigation.navigate('node', {
                  name: node.name,
                  brief: node
                })
              }}>
              <Text className="text-gray-500 text-xs">{node.title}</Text>
            </FixedPressable>
          </View>
          <Text className="text-gray-400">·</Text>
          <View className="relative top-[1px]">
            <FixedPressable
              className="active:opacity-60"
              hitSlop={5}
              onPress={() => {
                navigation.navigate('member', {
                  username: member.username,
                  brief: member
                })
              }}>
              <Text className="font-bold text-xs text-gray-700">
                {member.username}
              </Text>
            </FixedPressable>
          </View>
        </View>
        <View className="pl-[34px]">
          <Text className="text-base text-gray-700">{title}</Text>
          <View className="mt-2 flex flex-row items-center">
            <Text className="text-xs text-gray-400">
              {data?.last_reply_time}
            </Text>
            {data?.last_reply_by && (
              <>
                <Text className="text-gray-400 text-xs px-2">•</Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs text-gray-400">最后回复来自</Text>
                  <FixedPressable
                    className="px-1 active:opacity-60"
                    hitSlop={4}
                    onPress={() => {
                      navigation.push('member', {
                        username: data.last_reply_by
                      })
                    }}>
                    <Text className="text-xs font-bold text-gray-700">
                      {data.last_reply_by}
                    </Text>
                  </FixedPressable>
                </View>
              </>
            )}
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
    </FixedPressable>
  )
}
