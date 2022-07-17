import { Image, Text, View, ScrollView } from 'react-native'
import React, { useMemo } from 'react'

import { Pressable } from 'react-native'
import useSWR from 'swr'

export default function NodesScreen({ navigation }) {
  const nodesSwr = useSWR('/api/nodes/all.json')

  if (nodesSwr.error) {
    return (
      <View>
        <Text>{nodesSwr.error.message}</Text>
      </View>
    )
  }

  if (!nodesSwr.data) {
    return (
      <View>
        <Text>LOADING...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingVertical: 12
      }}>
      <View className="flex flex-row flex-wrap">
        {nodesSwr.data.map((node) => (
          <View className="basis-1/3 px-2 mb-4" key={node.name}>
            <Pressable
              className="flex flex-col items-center py-2 bg-white shadow flex-1 rounded-lg"
              onPress={() => {
                navigation.navigate('node', {
                  id: node.id,
                  brief: node
                })
              }}>
              <Image
                className="w-[36px] h-[36px] mb-2 bg-gray-100"
                source={{ uri: node.avatar_normal }}
              />
              <View className="min-w-0 overflow-hidden">
                <Text className="truncate">{node.title}</Text>
              </View>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
