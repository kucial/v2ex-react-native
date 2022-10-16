import React, { useMemo } from 'react'
import { FlashList } from '@shopify/flash-list'
import deepmerge from 'deepmerge'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
import { hasReachEnd, isRefreshing } from '@/utils/swr'

import NodeTopicRow from './NodeTopicRow'

export default function NodeTopicList(props) {
  const { header, nodeSwr, getKey } = props
  const { hasViewed } = useViewedTopics()

  const feedSwr = useSWRInfinite(getKey, {
    onSuccess: (data) => {
      const node = data[data.length - 1]?.meta?.node
      if (node && nodeSwr) {
        nodeSwr.mutate((prev) => deepmerge(prev, node), false)
      }
    }
  })

  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({ item }) {
        return <NodeTopicRow data={item} viewed={hasViewed(item?.id)} />
      },
      keyExtractor(item, index) {
        return item?.id || `index-${index}`
      }
    }
  }, [hasViewed])

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

  return (
    <FlashList
      className="flex-1"
      data={feedItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      estimatedItemSize={80}
      onEndReached={() => {
        if (!feedSwr.isValidating && !hasReachEnd(feedSwr)) {
          feedSwr.setSize(feedSwr.size + 1)
        }
      }}
      onRefresh={() => {
        feedSwr.mutate()
      }}
      refreshing={isRefreshing(feedSwr)}
      ListHeaderComponent={header}
      ListFooterComponent={() => {
        return <CommonListFooter data={feedSwr} />
      }}
    />
  )
}
