import { Image, Text, View, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import {
  ClockIcon,
  CollectionIcon,
  DocumentIcon,
  PencilAltIcon,
  PhotographIcon
} from 'react-native-heroicons/outline'

export default function MyScreen({ navigation }) {
  useEffect(() => {
    navigation.setOptions({
      title: '我的'
    })
  }, [])

  return (
    <View>
      <View className="bg-white shadow-sm mb-3">
        <View className="flex flex-row py-3 px-4">
          <Image className="w-[40px] h-[40px] bg-gray-100 mr-3" />
          <View className="flex-1">
            <Text className="text-xl font-semibold mb-1">username</Text>
            <View>
              <Text className="text-gray-500">V2EX 第 号会员</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="shadow-sm divide-y divide-gray-300 mb-3">
        <Pressable className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white">
          <View className="mr-3">
            <CollectionIcon size={24} color="#111" />
          </View>
          <Text className="text-base">节点收藏</Text>
        </Pressable>
        <Pressable className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white">
          <View className="mr-3">
            <DocumentIcon size={24} color="#111" />
          </View>
          <Text className="text-base">主题收藏</Text>
        </Pressable>
      </View>

      <View className="shadow-sm divide-y divide-gray-300 mb-3">
        <Pressable className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white">
          <View className="mr-3">
            <PhotographIcon size={24} color="#111" />
          </View>
          <Text className="text-base">图片库</Text>
        </Pressable>
        <Pressable className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white">
          <View className="mr-3">
            <PencilAltIcon size={24} color="#111" />
          </View>
          <Text className="text-base">记事本</Text>
        </Pressable>
        <Pressable className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white">
          <View className="mr-3">
            <ClockIcon size={24} color="#111" />
          </View>
          <Text className="text-base">时间轴</Text>
        </Pressable>
      </View>
    </View>
  )
}
