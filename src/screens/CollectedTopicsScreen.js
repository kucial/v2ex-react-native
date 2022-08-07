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
import { InlineBox, BlockText, Box } from '@/Components/Skeleton/Elements'
import CommonListFooter from '@/Components/CommonListFooter'
import { hasReachEnd } from '@/utils/swr'

const CollectedTopicRow = (props) => {
  const { data } = props
  const navigation = useNavigation()

  if (!data) {
    return (
      <View className="border-b border-gray-200 bg-white flex flex-row items-center p-2 active:opacity-60">
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
      className="border-b border-gray-200 bg-white flex flex-row items-center p-2 active:opacity-60"
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
          <Image
            className="w-[36px] h-[36px] rounded"
            source={{ uri: data.member.avatar_normal }}
          />
        ) : (
          <Box className="w-[36px] h-[36px] rounded" />
        )}
      </View>
      <View className="flex-1 pl-2">
        <View className="">
          <Text className="text-base text-gray-700">{data.title}</Text>
          <View className="mt-2 flex flex-row flex-wrap items-center">
            <Pressable
              hitSlop={4}
              className="py-[2px] px-[6px] rounded bg-gray-100 active:opacity-60"
              onPress={() => {
                navigation.push('node', {
                  name: data.node.name,
                  brief: data.node
                })
              }}>
              <Text className="text-gray-500 text-xs">{data.node.title}</Text>
            </Pressable>
            <Text className="text-gray-400 px-1">•</Text>
            <Pressable
              className="px-1 active:opacity-60"
              hitSlop={4}
              onPress={() => {
                navigation.push('member', {
                  username: data.member.username
                })
              }}>
              <Text className="text-xs font-bold text-gray-700">
                {data.member.username}
              </Text>
            </Pressable>
            <Text className="text-gray-400 px-1">•</Text>

            <Text className="text-xs text-gray-400">
              {data?.last_reply_time}
            </Text>
            {data?.last_reply_by && (
              <>
                <Text className="text-gray-400 px-1">•</Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs text-gray-400">最后回复来自</Text>
                  <Pressable
                    className="px-1 active:opacity-60"
                    hitSlop={4}
                    onPress={() => {
                      navigation.push('member', {
                        username: data.last_reply_by
                      })
                    }}>
                    <Text className="text-xs font-bold text-gray-700">
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
          <View className="rounded-full text-xs px-2 bg-gray-400">
            <Text className="text-white">{data.replies}</Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}

export default function CollectedTopicsScreen() {
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
