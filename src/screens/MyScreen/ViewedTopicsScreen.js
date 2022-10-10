import { useLayoutEffect, useMemo } from 'react'
import { FlatList, Image, Pressable, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { EllipsisHorizontalIcon } from 'react-native-heroicons/outline'
import { useActionSheet } from '@expo/react-native-action-sheet'
import classNames from 'classnames'

import FixedPressable from '@/components/FixedPressable'
import TimeAgo from '@/components/TimeAgo'
import { useViewedTopics } from '@/containers/ViewedTopicsService'

export default function ViewedTopicsScreen({ navigation }) {
  const { items, clear } = useViewedTopics()
  const { showActionSheetWithOptions } = useActionSheet()
  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({ item }) => {
        const { node, member, title } = item
        return (
          <FixedPressable
            className="border-b border-neutral-200 bg-white flex flex-row items-center active:opacity-50 dark:bg-neutral-900 dark:border-neutral-600"
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
                <FastImage
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
                    className="py-[2px] px-[6px] rounded bg-neutral-100 active:opacity-60 dark:bg-neutral-750"
                    onPress={() => {
                      navigation.navigate('node', {
                        name: node.name,
                        brief: node
                      })
                    }}>
                    <Text className="text-neutral-500 text-xs dark:text-neutral-300">
                      {node.title}
                    </Text>
                  </FixedPressable>
                </View>
                <Text className="text-neutral-400">·</Text>
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
                    <Text className="font-bold text-xs text-neutral-700 dark:text-neutral-400">
                      {member.username}
                    </Text>
                  </FixedPressable>
                </View>
              </View>
              <View>
                <Text className="text-base text-neutral-700 dark:text-neutral-300">
                  {title}
                </Text>
                <View className="mt-2 flex flex-row items-center">
                  <Text className="text-xs text-neutral-400 mr-2">
                    上次查看
                  </Text>
                  <Text className="text-xs text-neutral-400">
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (props) => (
        <Pressable
          className="h-[44px] w-[44px] items-center justify-center -mr-4 active:opacity-60"
          onPress={() => {
            // actionsheet
            showActionSheetWithOptions(
              {
                options: ['取消', '清除缓存'],
                cancelButtonIndex: 0,
                destructiveButtonIndex: 1
              },
              (buttonIndex) => {
                if (buttonIndex === 1) {
                  clear()
                }
              }
            )
          }}>
          <EllipsisHorizontalIcon size={24} color={props.tintColor} />
        </Pressable>
      )
    })
  }, [])

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={() => (
        <View className="items-center py-9">
          <Text className="text-neutral-600 dark:text-neutral-400">
            你还没有查看过任何一个主题哦～
          </Text>
        </View>
      )}
    />
  )
}
