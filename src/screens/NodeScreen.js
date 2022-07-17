import { View, Text, Image, useWindowDimensions } from 'react-native'
import React, { useLayoutEffect } from 'react'
import RenderHtml from '@/Components/RenderHtml'
import { useTailwind } from 'tailwindcss-react-native'
import NodeTopicRow from '@/Components/NodeTopicRow'
import useSWR from 'swr'

export default function NodeScreen({ route, navigation }) {
  const { name, brief } = route.params
  const nodeSwr = useSWR([
    '/api/nodes/show.json',
    {
      params: {
        name
      }
    }
  ])

  const node = nodeSwr.data || brief || {}

  const { width } = useWindowDimensions()
  const tw = useTailwind()

  useLayoutEffect(() => {
    navigation.setOptions({
      title: node.title
    })
  }, [node.title])
  return (
    <View>
      <View className="bg-white flex flex-row p-2 mb-3">
        <Image
          className="w-[60px] h-[60px] mr-3"
          source={{
            uri: node.avatar_normal
          }}></Image>
        <View className="flex-1">
          <View className="flex flex-row justify-between items-center mb-[6px]">
            <View>
              <Text className="text-lg font-semibold">{node.title}</Text>
            </View>
            <View className="flex flex-row pr-2">
              <Text className="text-sm text-gray-600 mr-1">主题总数</Text>
              <Text className="text-sm text-gray-600 font-medium">
                {node.topics || '--'}
              </Text>
            </View>
          </View>
          <View>
            <RenderHtml
              contentWidth={width - 100}
              source={{ html: `<div>${node.header}</div>` }}
              baseStyle={tw('text-sm')}
            />
          </View>
        </View>
      </View>

      <NodeTopicRow />
    </View>
  )
}
