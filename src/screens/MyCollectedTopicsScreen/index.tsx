import { useCallback, useMemo } from 'react'
import { FlashList } from '@shopify/flash-list'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import { isRefreshing, shouldLoadMore } from '@/utils/swr'

import CollectedTopicRow from './CollectedTopicRow'
import { getMyCollectedTopics } from '@/utils/v2ex-client'

export default function CollectedTopicsScreen() {
  const getKey = useCallback((index: number): [string, number] => {
    return ['/page/my/topics.json', index + 1]
  }, [])

  const listSwr = useSWRInfinite(getKey, ([_, page]) =>
    getMyCollectedTopics({ p: page }),
  )

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
      renderItem({ item }) {
        return <CollectedTopicRow data={item} />
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
      estimatedItemSize={110}
      onEndReached={() => {
        if (shouldLoadMore(listSwr)) {
          listSwr.setSize(listSwr.size + 1)
        }
      }}
      onRefresh={() => {
        if (listSwr.isValidating) {
          return
        }
        listSwr.mutate()
      }}
      refreshing={isRefreshing(listSwr)}
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
    />
  )
}
