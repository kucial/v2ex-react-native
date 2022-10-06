import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  useWindowDimensions,
  View
} from 'react-native'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import useSWR, { useSWRConfig } from 'swr'
import useSWRInfinite from 'swr/infinite'
import colors from 'tailwindcss/colors'
import { useColorScheme, useTailwind } from 'tailwindcss-react-native'

import CommonListFooter from '@/components/CommonListFooter'
import HtmlRender from '@/components/HtmlRender'
import { useActivityIndicator } from '@/containers/ActivityIndicator'
import { useAlertService } from '@/containers/AlertService'
import { useAuthService } from '@/containers/AuthService'
import fetcher from '@/utils/fetcher'
import { hasReachEnd, isRefreshing } from '@/utils/swr'

import NodeTopicRow from './NodeTopicRow'

export default function NodeScreen({ route, navigation }) {
  const { name, brief } = route.params
  const [collecting, setCollecting] = useState(false)
  const { mutate } = useSWRConfig()
  const { colorScheme } = useColorScheme()

  const { width } = useWindowDimensions()
  const tw = useTailwind()
  const aIndicator = useActivityIndicator()
  const alert = useAlertService()
  const { composeAuthedNavigation } = useAuthService()

  const nodeSwr = useSWR(`/page/go/${name}/node.json`, {
    shouldRetryOnError: false
  })
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

  const htmlProps = useMemo(() => {
    return {
      source: { html: node.header },
      baseStyle: tw('text-sm')
    }
  }, [node])

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
    const items = feedSwr.data?.reduce((combined, page) => {
      if (page.data) {
        return [...combined, ...page.data]
      }
      return combined
    }, [])
    return items || []
  }, [feedSwr])

  const header = (
    <View className="mb-3 p-2 bg-white dark:bg-neutral-900">
      <View className="rounded-lg">
        <View className="flex flex-row">
          <Image
            style={[
              tw('w-[60px] h-[60px] mr-3'),
              !node.avatar_large && tw('bg-neutral-100 dark:bg-neutral-750')
            ]}
            source={{
              uri: node.avatar_large
            }}></Image>
          <View className="flex-1">
            <View className="flex flex-row justify-between items-center mb-[6px]">
              <View>
                <Text className="text-lg font-semibold dark:text-neutral-200">
                  {node.title}
                </Text>
              </View>
              <View className="flex flex-row pr-2">
                <Text className="text-sm text-neutral-600 mr-1 dark:text-neutral-500">
                  主题总数
                </Text>
                <Text className="text-sm text-neutral-600 font-medium dark:text-neutral-500">
                  {node.topics || '--'}
                </Text>
              </View>
            </View>
            <View>
              {!!node.header && (
                <HtmlRender contentWidth={width - 100} {...htmlProps} />
              )}
            </View>
            <View className="flex flex-row mt-3 mb-2 justify-end mr-1">
              <Pressable
                className={classNames(
                  'h-[38px] rounded-lg border border-neutral-500 px-3 items-center justify-center active:opacity-60',
                  {
                    'opacity-60': collecting
                  }
                )}
                disabled={collecting}
                onPress={composeAuthedNavigation(() => {
                  const endpoint = node.collected
                    ? `/page/go/${name}/uncollect.json`
                    : `/page/go/${name}/collect.json`
                  aIndicator.show()
                  setCollecting(true)
                  fetcher(endpoint)
                    .then((result) => {
                      nodeSwr.mutate((data) => ({
                        ...data,
                        ...result
                      }))
                      mutate('/page/my/nodes.json')
                    })
                    .catch((err) => {
                      alert.alertWithType('error', '错误', err.message)
                    })
                    .finally(() => {
                      aIndicator.hide()
                      setCollecting(false)
                    })
                })}>
                <Text className="dark:text-neutral-300">
                  {node.collected ? '取消收藏' : '加入收藏'}
                </Text>
              </Pressable>
              <Pressable
                className={classNames(
                  'ml-2 h-[38px] rounded-lg border border-neutral-500 px-3 items-center justify-center active:opacity-60'
                )}
                onPress={composeAuthedNavigation(() => {
                  navigation.push('new-topic', {
                    node
                  })
                })}>
                <Text className="dark:text-neutral-300">创建新主题</Text>
              </Pressable>
            </View>
          </View>
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
          if (!feedSwr.isValidating && !hasReachEnd(feedSwr)) {
            feedSwr.setSize(feedSwr.size + 1)
          }
        }}
        refreshControl={
          <RefreshControl
            tintColor={
              colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
            }
            onRefresh={() => {
              feedSwr.mutate()
            }}
            refreshing={isRefreshing(feedSwr)}
          />
        }
        ListHeaderComponent={header}
        ListFooterComponent={() => {
          return <CommonListFooter data={feedSwr} />
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
