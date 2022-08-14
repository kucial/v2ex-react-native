import {
  Image,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl
} from 'react-native'
import React, { useEffect } from 'react'

import ErrorNotice from '@/components/ErrorNotice'
import NodesSkeleton from '@/components/Skeleton/NodesSkeleton'
import { useCustomSwr } from '@/utils/swr'

export default function NodesScreen({ navigation }) {
  const nodesSwr = useCustomSwr('/page/planes/node-groups.json')

  if (nodesSwr.error) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={nodesSwr.isValidating}
            onRefresh={nodesSwr.mutate}
          />
        }>
        <ErrorNotice error={nodesSwr.error} />
      </ScrollView>
    )
  }

  if (!nodesSwr.data) {
    return <NodesSkeleton />
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={nodesSwr.isValidating}
          onRefresh={nodesSwr.mutate}
        />
      }>
      {nodesSwr.data.map((g) => (
        <View
          className="bg-white mx-1 mt-1 mb-4 rounded-sm shadow"
          key={g.name}>
          <View className="flex flex-row justify-between items-center border-b border-b-gray-400 px-3">
            <View className="py-2">
              <Text className="font-medium">{g.title}</Text>
            </View>
            <View className="flex flex-row space-x-1">
              <Text className="color-gray-500 text-xs">{g.name}</Text>
              <Text className="color-gray-500 text-xs">•</Text>
              <Text className="color-gray-500 text-xs">
                {g.nodes.length} nodes
              </Text>
            </View>
          </View>
          <View className="flex flex-row flex-wrap py-2 px-3">
            {g.nodes.map((node) => (
              <Pressable
                key={node.name}
                className="py-2 px-2 bg-white border border-gray-400 rounded-lg mr-2 mb-2 active:opacity-60"
                onPress={() => {
                  navigation.navigate('node', {
                    name: node.name
                  })
                }}>
                <Text>{node.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  )
}
