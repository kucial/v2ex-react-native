import { useCallback, useMemo } from 'react'
import { FlashList } from '@shopify/flash-list'

import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'
import { useAppSettings } from '@/containers/AppSettingsService'
import { isRefreshing, shouldLoadMore } from '@/utils/react-query'
import { getMyCollectedTopics } from '@/utils/v2ex-client'

import CollectedTopicRow from './CollectedTopicRow'
import { useInfiniteQuery } from '@tanstack/react-query'

export default function CollectedTopicsScreen() {
  const { data: settings } = useAppSettings()
  const getKey = useCallback((index: number): [string, number] => {
    return ['/page/my/topics.json', index + 1]
  }, [])


  const fetchItems = useCallback(async ({ pageParam }) => {
    return getMyCollectedTopics({ p: pageParam })
  }, [])

  const listQuery = useInfiniteQuery({
    queryKey: ['/page/my/topics.json'],
    queryFn: fetchItems,
    initialPageParam: 1,
    getNextPageParam(lastPage) {
      if (lastPage.pagination && lastPage.pagination.total > lastPage.pagination.current) {
        return lastPage.pagination.current +1
      }
      return undefined
    },
  })

  const listItems = useMemo(() => {
    if (listQuery.isLoading && !listQuery.error) {
      // initial loading
      return new Array(10)
    }
    const items = listQuery.data?.pages.reduce((combined, page) => {
      if (page.data) {
        return [...combined, ...page.data]
      }
      return combined
    }, [])
    return items
  }, [listQuery])

  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({ item, index }) {
        return (
          <CollectedTopicRow
            data={item}
            titleStyle={settings.feedTitleStyle}
            isLast={index === listItems.length - 1}
          />
        )
      },
      keyExtractor(item, index) {
        return item?.id || `index-${index}`
      },
    }
  }, [settings.feedTitleStyle, listItems.length])

  return (
    <FlashList
      className="flex-1"
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      estimatedItemSize={110}
      onEndReached={() => {
        if (shouldLoadMore(listQuery)) {
          listQuery.fetchNextPage()
        }
      }}
      refreshControl={
        <MyRefreshControl
          refreshing={listQuery.isRefetching}
          onRefresh={listQuery.refetch}
        />
      }
      ListFooterComponent={() => {
        return <CommonListFooter data={listQuery} />
      }}
    />
  )
}
