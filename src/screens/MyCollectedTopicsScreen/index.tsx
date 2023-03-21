import { useCallback, useMemo } from 'react'
import { FlashList } from '@shopify/flash-list'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'
import { useAppSettings } from '@/containers/AppSettingsService'
import { isRefreshing, shouldLoadMore } from '@/utils/swr'
import { getMyCollectedTopics } from '@/utils/v2ex-client'

import CollectedTopicRow from './CollectedTopicRow'

export default function CollectedTopicsScreen() {
  const { data: settings } = useAppSettings()
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
