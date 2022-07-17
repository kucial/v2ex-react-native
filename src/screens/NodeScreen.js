import { View, Text, Image, useWindowDimensions } from 'react-native'
import React, { useLayoutEffect } from 'react'
import RenderHtml from '@/Components/RenderHtml'
import { useTailwind } from 'tailwindcss-react-native'
import NodeTopicRow from '@/Components/NodeTopicRow'

export default function NodeScreen({ route, navigation }) {
  const { width } = useWindowDimensions()
  const tw = useTailwind()
  const { data } = route.params
  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.data.title
    })
  }, [])
  return (
    <View>
      <View className="bg-white flex flex-row p-2 mb-3">
        <Image
          className="w-[60px] h-[60px] mr-3"
          source={{
            uri: data.avatar_normal
          }}></Image>
        <View className="flex-1">
          <View className="flex flex-row justify-between items-center mb-[6px]">
            <View>
              <Text className="text-lg font-semibold">{data.title}</Text>
            </View>
            <View className="flex flex-row pr-2">
              <Text className="text-sm text-gray-600 mr-1">主题总数</Text>
              <Text className="text-sm text-gray-600 font-medium">
                {data.topics}
              </Text>
            </View>
          </View>
          <View>
            <RenderHtml
              contentWidth={width - 100}
              source={{ html: `<div>${data.header}</div>` }}
              baseStyle={tw('text-sm')}
            />
          </View>
        </View>
      </View>

      <NodeTopicRow />
    </View>
  )
}
