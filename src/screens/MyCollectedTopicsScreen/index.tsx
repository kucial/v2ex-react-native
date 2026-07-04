import { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useInfiniteQuery } from '@tanstack/react-query'

import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'
import NavigationHeader from '@/components/NavigationHeader'

import { useAppSettings } from '@/containers/AppSettingsService'
import { shouldLoadMore } from '@/utils/react-query'
import { getMyCollectedTopics } from '@/utils/v2ex-client'

import CollectedTopicRow from './CollectedTopicRow'

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
      if (
        lastPage.pagination &&
        lastPage.pagination.total > lastPage.pagination.current
      ) {
        return lastPage.pagination.current + 1
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
    <View style={collectedStyles.container}>
      <NavigationHeader canGoBack title='收藏的主题' />
      <FlashList
        style={collectedStyles.container}
        data={listItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReachedThreshold={0.4}
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
    </View>
  )
}

const collectedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
