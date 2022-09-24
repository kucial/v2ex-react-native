import { View, Text, Image, FlatList } from 'react-native'
import { useMemo } from 'react'
import classNames from 'classnames'

import { useViewedTopics } from '@/containers/ViewedTopicsService'
import FixedPressable from '@/components/FixedPressable'
import TimeAgo from '@/components/TimeAgo'

export default function ViewedTopicsScreen({ navigation }) {
  const { items } = useViewedTopics()
  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({ item }) => {
        const { node, member, title } = item
        return (
          <FixedPressable
            className="border-b border-gray-200 bg-white flex flex-row items-center active:opacity-50"
            onPress={() => {
              navigation.push('topic', {
                id: item.id,
                brief: item
              })
            }}>
            <View className="px-2 py-2 self-start">
              <FixedPressable
                onPress={() => {
                  navigation.navigate('member', {
                    username: member.username,
                    brief: member
                  })
                }}>
                <Image
                  source={{
                    uri: member.avatar_large
                  }}
                  className="w-[24px] h-[24px] rounded"
                />
              </FixedPressable>
            </View>
            <View className={classNames('flex-1 py-2')}>
              <View className="flex flex-row items-center pt-[2px] space-x-1 mb-1">
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
              <View>
                <Text className="text-base text-gray-700">{title}</Text>
                <View className="mt-2 flex flex-row items-center">
                  <Text className="text-xs text-gray-400 mr-2">上次查看</Text>
                  <Text className="text-xs text-gray-400">
                    <TimeAgo date={item.viewed_at} />
                  </Text>
                </View>
              </View>
            </View>
          </FixedPressable>
        )
      },
      keyExtractor: (item) => item.id
    }),
    []
  )

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={() => (
        <View className="items-center py-9">
          <Text className="text-neutral-600">
            你还没有查看过任何一个主题哦～
          </Text>
        </View>
      )}
    />
  )
}
