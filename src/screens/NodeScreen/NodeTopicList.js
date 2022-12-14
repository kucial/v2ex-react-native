import { useCallback, useEffect, useMemo, useRef } from 'react'
import { AppState } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import deepmerge from 'deepmerge'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
import { isRefreshing, shouldFetch, shouldLoadMore } from '@/utils/swr'

import NodeTopicRow from './NodeTopicRow'
import TideNodeTopicRow from './TideNodeTopicRow'

export default function NodeTopicList(props) {
  const { header, nodeSwr, getKey, isFocused, currentListRef } = props
  const { hasViewed } = useViewedTopics()
  const alert = useAlertService()
  const { data: settings } = useAppSettings()
  const listViewRef = useRef()
  const scrollY = useRef(0)

  const listSwr = useSWRInfinite(getKey, {
    revalidateOnMount: false,
    shouldRetryOnError: false,
    onError(err) {
      alert.alertWithType('error', '错误', err.message || '请求资源失败')
    },
    onSuccess: (data) => {
      const node = data[data.length - 1]?.meta?.node
      if (node && nodeSwr) {
        nodeSwr.mutate((prev) => deepmerge(prev, node), false)
      }
    },
  })

  const scrollToRefresh = useCallback(() => {
    if (listSwr.isValidating) {
      return
    }
    if (listSwr.data) {
      listSwr.setSize(1)
      const params = {
        offset: scrollY.current > 0 ? 0 : -60,
        animated: true,
      }
      listViewRef.current.scrollToOffset(params)
    } else {
      listSwr.mutate().catch(() => {})
    }
  }, [listSwr])

  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({ item }) {
        return settings.feedLayout === 'tide' ? (
          <TideNodeTopicRow
            data={item}
            viewed={hasViewed(item?.id)}
            showAvatar={settings.feedShowAvatar}
          />
        ) : (
          <NodeTopicRow
            data={item}
            viewed={hasViewed(item?.id)}
            showAvatar={settings.feedShowAvatar}
          />
        )
      },
      keyExtractor(item, index) {
        return item?.id || `index-${index}`
      },
    }
  }, [hasViewed, settings])

  useEffect(() => {
    if (
      isFocused &&
      shouldFetch(listSwr, settings.autoRefresh && settings.autoRefreshDuration)
    ) {
      scrollToRefresh()
    }
    if (isFocused) {
      let appState = AppState.currentState
      let toBackDate
      const subscription = AppState.addEventListener(
        'change',
        (nextAppState) => {
          if (
            appState === 'background' &&
            nextAppState === 'active' &&
            Date.now() - toBackDate > 60 * 1000 &&
            shouldFetch(
              listSwr,
              settings.autoRefresh && settings.autoRefreshDuration,
            )
          ) {
            scrollToRefresh()
          } else if (nextAppState === 'background') {
            toBackDate = Date.now()
          }
          appState = nextAppState
        },
      )
      return () => {
        subscription.remove()
      }
    }
  }, [isFocused, settings.autoRefresh, settings.autoRefreshDuration])

  useEffect(() => {
    if (currentListRef) {
      currentListRef.current = {
        scrollToRefresh,
      }
    }
  }, [isFocused, scrollToRefresh])

  const listItems = useMemo(() => {
    if (!listSwr.data && !listSwr.error) {
      // initial loading
      return new Array(20)
    }
    const items = listSwr.data?.reduce((combined, page) => {
      if (page.data) {
        return [...combined, ...page.data]
      }
      return combined
    }, [])
    return items || []
  }, [listSwr])

  return (
    <FlashList
      scrollToOverflowEnabled
      ref={listViewRef}
      className="flex-1"
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      estimatedItemSize={settings.feedLayout === 'tide' ? 65 : 80}
      onEndReached={() => {
        if (shouldLoadMore(listSwr)) {
          listSwr.setSize(listSwr.size + 1)
        }
      }}
      refreshing={isRefreshing(listSwr)}
      onRefresh={() => {
        if (!listSwr.isValidating) {
          listSwr.setSize(1)
        }
      }}
      ListHeaderComponent={header}
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
      onScroll={(e) => {
        scrollY.current = e.nativeEvent.contentOffset.y
      }}
    />
  )
}
