import { Image, Text, View, ScrollView } from 'react-native'
import React, { useMemo } from 'react'
import listToTree from 'list-to-tree-lite'
import nodes from '@/mock/nodes'
import { Pressable } from 'react-native'

export default function NodesScreen({ navigation }) {
  console.log(nodes[0], nodes.length)
  const tree = useMemo(() => {
    return listToTree(JSON.parse(JSON.stringify(nodes)), {
      idKey: 'name',
      parentKey: 'parent_node_name'
    })
  }, [])

  return (
    <ScrollView
      contentContainerStyle={{
        paddingVertical: 12
      }}>
      <View className="flex flex-row flex-wrap">
        {tree.map((node) => (
          <View className="basis-1/3 px-2 mb-4" key={node.name}>
            <Pressable
              className="flex flex-col items-center py-2 bg-white shadow flex-1 rounded-lg"
              onPress={() => {
                navigation.navigate('node', {
                  id: node.id,
                  data: node
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
