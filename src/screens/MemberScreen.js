import { View, Text, Image } from 'react-native'
import React from 'react'
import useSWR from 'swr'

export default function MemberScreen({ route }) {
  const { username, brief } = route.params
  const memberSwr = useSWR([
    '/api/members/show.json',
    {
      params: {
        username
      }
    }
  ])
  const member = memberSwr.data || brief || {}

  return (
    <View>
      <View className="px-4 py-3 bg-white flex flex-row shadow-sm">
        <View className="mr-4">
          <Image
            className="w-[60px] h-[60px] rounded"
            source={{ uri: member.avatar_large || member.avatar_mini }}></Image>
        </View>
        <View className="flex-1">
          <View className="mb-1">
            <Text className="text-xl font-semibold">
              {member.username || ''}
            </Text>
          </View>
          <Text className="text-gray-500">
            {member.id
              ? `VE2X 第 ${member.id} 号会员，加入于 ${new Date(
                  member.created * 1000
                ).toLocaleString()}`
              : '    '}
          </Text>
        </View>
      </View>
    </View>
  )
}
