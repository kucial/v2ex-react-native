import { FlatList, RefreshControl, ScrollView } from 'react-native'
import React, { useEffect, useMemo } from 'react'
import { useIsFocused } from '@react-navigation/native'
import useSWRInfinite from 'swr/infinite'
import { uniqBy } from 'lodash'
import colors from 'tailwindcss/colors'

import { isRefreshing, shouldInit, hasReachEnd } from '@/utils/swr'
import CommonListFooter from '@/components/CommonListFooter'

import TopicRow from './TopicRow'
import { useAlertService } from '@/containers/AlertService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
import { useColorScheme } from 'tailwindcss-react-native'

export default function TopicList(props) {
  const { colorScheme } = useColorScheme()
  const alert = useAlertService()
  const { hasViewed } = useViewedTopics()
  const listSwr = useSWRInfinite(props.getKey, {
    revalidateOnMount: false,
    shouldRetryOnError: false,
    onError(err) {
      alert.alertWithType('error', '错误', err.message || '请求资源失败')
    }
  })
  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({ item }) => (
        <TopicRow data={item} viewed={hasViewed(item?.id)} />
      ),
      keyExtractor: (item, index) => item?.id || `index-${index}`
    }),
    [hasViewed]
  )

  const isFocused = useIsFocused()

  useEffect(() => {
    if (isFocused && shouldInit(listSwr)) {
      listSwr.mutate()
    }
  }, [isFocused])

  const listItems = useMemo(() => {
    if (!listSwr.data && !listSwr.error) {
      // initial loading
      return new Array(10)
    }
    const items = listSwr.data?.reduce((combined, page) => {
      if (page.data) {
        return uniqBy([...combined, ...page.data], 'id')
      }
      return combined
    }, [])
    return items || []
  }, [listSwr])

  return (
    <FlatList
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (!listSwr.isValidating && !hasReachEnd(listSwr)) {
          listSwr.setSize((size) => size + 1)
        }
      }}
      refreshControl={
        <RefreshControl
          tintColor={
            colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
          }
          refreshing={isRefreshing(listSwr)}
          onRefresh={() => {
            if (!listSwr.isValidating) {
              listSwr.setSize(1)
            }
          }}
        />
      }
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
    />
  )
}
