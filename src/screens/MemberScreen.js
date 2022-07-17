import { View, Text, Image } from 'react-native'
import React from 'react'

export default function MemberScreen({ route }) {
  const { username, id, data } = route.params
  console.log(data)

  return (
    <View>
      <View className="px-4 py-3 bg-white flex flex-row shadow-sm">
        <View className="mr-4">
          <Image
            className="w-[60px] h-[60px] rounded"
            source={{ uri: data.avatar_large }}></Image>
        </View>
        <View className="flex-1">
          <View className="mb-1">
            <Text className="text-xl font-semibold">{data.username}</Text>
          </View>
          <Text className="text-gray-500">
            VE2X 第 {data.id} 号会员，加入于{' '}
            {new Date(data.created * 1000).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  )
}
