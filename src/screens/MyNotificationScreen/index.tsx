import { useCallback, useMemo } from 'react'
import { FlashList } from '@shopify/flash-list'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'
import { useAuthService } from '@/containers/AuthService'
import { isRefreshing, shouldLoadMore } from '@/utils/swr'
import { getMyNotifications } from '@/utils/v2ex-client'

import NotificationRow from './NotificationRow'

const fetcher = ([_, page]) => getMyNotifications({ p: page })
export default function NotificationScreen() {
  const { updateMeta, user } = useAuthService()
  const getKey = useCallback(
    (index: number): [string, number] => {
      return [`/member/${user.username}/notifications.json`, index + 1]
    },
    [user.username],
  )
  const listSwr = useSWRInfinite(getKey, fetcher, {
    revalidateOnMount: true,
    onSuccess: () => {
      updateMeta({
        unread_count: 0,
      })
    },
  })
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
        return <NotificationRow data={item} />
      },
      keyExtractor(item, index) {
        return item?.id || `index-${index}`
      },
    }
  }, [])

  return (
    <FlashList
      className="flex-1"
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      estimatedItemSize={80}
      onEndReached={() => {
        if (shouldLoadMore(listSwr)) {
          listSwr.setSize(listSwr.size + 1)
        }
      }}
      refreshControl={
        <MyRefreshControl
          onRefresh={() => {
            if (listSwr.isValidating) {
              return
            }
            listSwr.mutate()
          }}
          refreshing={isRefreshing(listSwr)}
        />
      }
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
    />
  )
}
