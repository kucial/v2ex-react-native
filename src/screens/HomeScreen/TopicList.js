import React, { memo, useEffect, useMemo, useRef } from 'react'
import { useIsFocused } from '@react-navigation/native'
import { FlashList } from '@shopify/flash-list'
import { uniqBy } from 'lodash'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import { useAlertService } from '@/containers/AlertService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
import { hasReachEnd, isRefreshing, shouldInit } from '@/utils/swr'

import TopicRow from './TopicRow'

function TopicList(props) {
  const alert = useAlertService()
  const listViewRef = useRef()
  const { hasViewed } = useViewedTopics()
  const listSwr = useSWRInfinite(props.getKey, {
    revalidateOnMount: false,
    shouldRetryOnError: false,
    onError(err) {
      alert.alertWithType('error', '错误', err.message || '请求资源失败')
    }
  })
  const isFocused = useIsFocused()

  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({ item }) => (
        <TopicRow data={item} viewed={hasViewed(item?.id)} />
      ),
      keyExtractor: (item, index) => item?.id || `index-${index}`
    }),
    [hasViewed]
  )

  useEffect(() => {
    if (isFocused && shouldInit(listSwr)) {
      if (listSwr.data) {
        listSwr.setSize(1)
        listViewRef.current?.scrollToIndex({
          index: 0,
          viewPosition: 0
        })
      } else {
        listSwr.mutate()
      }
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
    <FlashList
      ref={listViewRef}
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={133}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (!listSwr.isValidating && !hasReachEnd(listSwr)) {
          listSwr.setSize((size) => size + 1)
        }
      }}
      refreshing={isRefreshing(listSwr) || false}
      onRefresh={() => {
        if (!listSwr.isValidating) {
          listSwr.setSize(1)
        }
      }}
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
    />
  )
}
export default memo(TopicList)
