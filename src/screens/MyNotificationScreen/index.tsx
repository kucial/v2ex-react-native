import { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useInfiniteQuery } from '@tanstack/react-query'

import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'
import NavigationHeader from '@/components/NavigationHeader'

import { useAuthService } from '@/containers/AuthService'
import { shouldLoadMore } from '@/utils/react-query'
import { getMyNotifications } from '@/utils/v2ex-client'

import NotificationRow from './NotificationRow'

export default function NotificationScreen() {
  const { updateMeta, user } = useAuthService()
  const getKey = useCallback(
    (index: number): [string, number] => {
      return [`/member/${user.username}/notifications.json`, index + 1]
    },
    [user.username],
  )

  const fetchItems = useCallback(
    async ({ pageParam }) => {
      const res = await getMyNotifications({ p: pageParam })
      updateMeta({
        unread_count: 0,
      })
      return res
    },
    [updateMeta],
  )

  const listQuery = useInfiniteQuery({
    queryKey: ['/member/:username/notifications.json', user.username],
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
    refetchOnMount: true,
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
        return <NotificationRow data={item} />
      },
      keyExtractor(item, index) {
        return item?.id || `index-${index}`
      },
    }
  }, [])

  return (
    <View className='flex-1'>
      <NavigationHeader canGoBack title='消息' />
      <FlashList
        className='flex-1'
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
