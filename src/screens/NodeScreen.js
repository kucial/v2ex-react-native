import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  useWindowDimensions,
  RefreshControl
} from 'react-native'
import React, { useCallback, useLayoutEffect, useMemo } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { useTailwind } from 'tailwindcss-react-native'
import PropTypes from 'prop-types'

import Loader from '@/Components/Loader'
import RenderHtml from '@/Components/RenderHtml'
import NodeTopicRow from '@/Components/NodeTopicRow'

export default function NodeScreen({ route, navigation }) {
  const { name, brief } = route.params

  const { width } = useWindowDimensions()
  const tw = useTailwind()

  const nodeSwr = useSWR([
    '/api/nodes/show.json',
    {
      params: {
        name
      }
    }
  ])
  const getKey = useCallback(
    (index) => {
      return `/page/go/${name}/feed.json?p=${index + 1}`
    },
    [name]
  )

  const feedSwr = useSWRInfinite(getKey)

  const node = nodeSwr.data || brief || {}
  useLayoutEffect(() => {
    navigation.setOptions({
      title: node.title
    })
  }, [node.title])

  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({ item, index }) {
        return <NodeTopicRow data={item} num={index + 1} />
      },
      keyExtractor(item, index) {
        return item?.id || index
      }
    }
  }, [])

  const feedItems = useMemo(() => {
    if (!feedSwr.data && !feedSwr.error) {
      // initial loading
      return new Array(10)
    }
    const items = feedSwr.data.reduce((combined, page) => {
      if (page.data) {
        return [...combined, ...page.data]
      }
      return combined
    }, [])
    return items
  }, [feedSwr])

  const header = (
    <View className="bg-white flex flex-row p-2 mb-3">
      <Image
        style={[
          tw('w-[60px] h-[60px] mr-3'),
          !node.avatar_normal && tw('bg-gray-100')
        ]}
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
          {node.header && (
            <RenderHtml
              contentWidth={width - 100}
              source={{ html: node.header }}
              baseStyle={tw('text-sm')}
            />
          )}
        </View>
      </View>
    </View>
  )

  return (
    <View className="flex-1">
      <FlatList
        className="flex-1"
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!feedSwr.isValidating) {
            feedSwr.setSize(feedSwr.size + 1)
          }
        }}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              feedSwr.mutate()
            }}
            refreshing={feedSwr.data && feedSwr.isValidating}
          />
        }
        ListHeaderComponent={header}
        ListFooterComponent={() => {
          return (
            <View className="min-h-[44px] py-4 flex flex-row items-center justify-center">
              {feedSwr.isValidating && <Loader />}
              {feedSwr.error && !feedSwr.isValidating && (
                <View>
                  <View className="my-4">
                    <Text>{feedSwr.error.message}</Text>
                  </View>
                  <View className="flex flex-row justify-center">
                    <Pressable
                      className="px-4 h-[44px] w-[120px] rounded-full bg-gray-900 text-white items-center justify-center"
                      onPress={() => {
                        feedSwr.mutate()
                      }}>
                      <Text className="text-white">重试</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )
        }}
      />
    </View>
  )
}

NodeScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      name: PropTypes.string,
      brief: PropTypes.object
    })
  }),
  navigation: PropTypes.shape({
    setOptions: PropTypes.func,
    push: PropTypes.func
  })
}
