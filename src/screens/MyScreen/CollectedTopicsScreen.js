import {
  Text,
  View,
  Pressable,
  FlatList,
  RefreshControl,
  Image
} from 'react-native'
import React, { useCallback, useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'

import { useNavigation } from '@react-navigation/native'
import { InlineBox, BlockText, Box } from '@/components/Skeleton/Elements'
import CommonListFooter from '@/components/CommonListFooter'
import { hasReachEnd } from '@/utils/swr'
import { useColorScheme } from 'tailwindcss-react-native'
import colors from 'tailwindcss/colors'

const CollectedTopicRow = (props) => {
  const { data } = props
  const navigation = useNavigation()

  if (!data) {
    return (
      <View className="border-b border-neutral-200 bg-white flex flex-row items-center p-2 active:opacity-60 dark:bg-neutral-900 dark:border-neutral-700">
        <View className="self-start">
          <Box className="w-[36px] h-[36px] rounded" />
        </View>
        <View className="flex-1 pl-2">
          <View className="">
            <BlockText className="text-base" lines={[1, 3]}></BlockText>
            <View className="mt-2 flex flex-row flex-wrap items-center">
              <BlockText className="text-xs" lines={2} />
            </View>
          </View>
        </View>
        <View className="w-[64px] flex flex-row justify-end pr-1">
          <InlineBox className="rounded-full text-xs px-2" width={[26, 36]} />
        </View>
      </View>
    )
  }

  return (
    <Pressable
      className="border-b border-neutral-200 bg-white flex flex-row items-center p-2 active:opacity-60 dark:bg-neutral-900 dark:border-neutral-700"
      onPress={() => {
        if (data) {
          navigation.push('topic', {
            id: props.data.id,
            brief: props.data
          })
        }
      }}>
      <View className="self-start">
        {data.member.avatar_normal ? (
          <Pressable
            onPress={() => {
              navigation.push('member', {
                username: data.member.username,
                brief: data.member
              })
            }}>
            <Image
              className="w-[36px] h-[36px] rounded"
              source={{ uri: data.member.avatar_normal }}
            />
          </Pressable>
        ) : (
          <Box className="w-[36px] h-[36px] rounded" />
        )}
      </View>
      <View className="flex-1 pl-2">
        <View className="">
          <Text className="text-base text-neutral-700 dark:text-neutral-300">
            {data.title}
          </Text>
          <View className="mt-2 flex flex-row flex-wrap items-center">
            <Pressable
              hitSlop={4}
              className="py-[2px] px-[6px] rounded bg-neutral-100 active:opacity-60 dark:bg-neutral-750"
              onPress={() => {
                navigation.push('node', {
                  name: data.node.name,
                  brief: data.node
                })
              }}>
              <Text className="text-neutral-500 text-xs dark:text-neutral-300">
                {data.node.title}
              </Text>
            </Pressable>
            <Text className="text-neutral-400 px-1">•</Text>
            <Pressable
              className="px-1 active:opacity-60"
              hitSlop={4}
              onPress={() => {
                navigation.push('member', {
                  username: data.member.username
                })
              }}>
              <Text className="text-xs font-bold text-neutral-700 dark:text-neutral-400">
                {data.member.username}
              </Text>
            </Pressable>
            <Text className="text-neutral-400 px-1">•</Text>

            <Text className="text-xs text-neutral-400">
              {data?.last_reply_time}
            </Text>
            {data?.last_reply_by && (
              <>
                <Text className="text-neutral-400 px-1">•</Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs text-neutral-400">最后回复来自</Text>
                  <Pressable
                    className="px-1 active:opacity-60"
                    hitSlop={4}
                    onPress={() => {
                      navigation.push('member', {
                        username: data.last_reply_by
                      })
                    }}>
                    <Text className="text-xs font-bold text-neutral-700 dark:text-neutral-400">
                      {data.last_reply_by}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      <View className="w-[64px] flex flex-row justify-end pr-1">
        {data && !!data.replies && (
          <View className="rounded-full text-xs px-2 bg-neutral-400 dark:bg-neutral-600">
            <Text className="text-white dark:text-neutral-300">
              {data.replies}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}

export default function CollectedTopicsScreen() {
  const { colorScheme } = useColorScheme()
  const getKey = useCallback((index) => {
    return `/page/my/topics.json?p=${index + 1}`
  }, [])

  const listSwr = useSWRInfinite(getKey)

  const listItems = useMemo(() => {
    if (!listSwr.data && !listSwr.error) {
      // initial loading
      return new Array(10)
    }
    const items = (listSwr.data || []).reduce((combined, page) => {
      if (page.data) {
        return [...combined, ...page.data]
      }
      return combined
    }, [])
    return items
  }, [listSwr])

  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({ item, index }) {
        return <CollectedTopicRow data={item} num={index + 1} />
      },
      keyExtractor(item, index) {
        return item?.id || index
      }
    }
  }, [])

  return (
    <FlatList
      className="flex-1"
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (!listSwr.isValidating && !hasReachEnd(listSwr)) {
          listSwr.setSize(listSwr.size + 1)
        }
      }}
      refreshControl={
        <RefreshControl
          tintColor={
            colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
          }
          onRefresh={() => {
            if (listSwr.isValidating) {
              return
            }
            listSwr.mutate()
          }}
          refreshing={listSwr.data && listSwr.isValidating}
        />
      }
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
    />
  )
}
