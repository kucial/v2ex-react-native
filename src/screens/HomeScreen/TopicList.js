import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { AppState } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import * as Haptics from 'expo-haptics'
import { uniqBy } from 'lodash'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
import { hasReachEnd, isRefreshing, shouldFetch } from '@/utils/swr'

import TideTopicRow from './TideTopicRow'
import TopicRow from './TopicRow'

function TopicList(props) {
  const { getKey, isFocused, currentListRef } = props
  const alert = useAlertService()
  const listViewRef = useRef()
  const scrollY = useRef(0)
  const { data: settings } = useAppSettings()
  const { hasViewed } = useViewedTopics()
  const listSwr = useSWRInfinite(getKey, {
    revalidateOnMount: false,
    shouldRetryOnError: false,
    onError(err) {
      alert.alertWithType('error', '错误', err.message || '请求资源失败')
    }
  })

  const scrollToRefresh = useCallback(() => {
    if (listSwr.isValidating) {
      return
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (listSwr.data) {
      listSwr.setSize(1)
      listViewRef.current.scrollToOffset({
        offset: scrollY.current > 0 ? 0 : -60,
        animated: true
      })
    } else {
      listSwr.mutate().catch(() => {})
    }
  }, [listSwr])

  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({ item }) =>
        settings.feedLayout === 'tide' ? (
          <TideTopicRow
            data={item}
            viewed={hasViewed(item?.id)}
            showAvatar={settings.feedShowAvatar}
            showLastReplyMember={settings.feedShowLastReplyMember}
          />
        ) : (
          <TopicRow
            data={item}
            viewed={hasViewed(item?.id)}
            showAvatar={settings.feedShowAvatar}
            showLastReplyMember={settings.feedShowLastReplyMember}
          />
        ),
      keyExtractor: (item, index) => item?.id || `index-${index}`
    }),
    [hasViewed, settings]
  )

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
              settings.autoRefresh && settings.autoRefreshDuration
            )
          ) {
            scrollToRefresh()
          } else if (nextAppState === 'background') {
            toBackDate = Date.now()
          }
          appState = nextAppState
        }
      )
      return () => {
        subscription.remove()
      }
    }
  }, [isFocused, settings.autoRefresh, settings.autoRefreshDuration])

  useEffect(() => {
    currentListRef.current = {
      scrollToRefresh
    }
  }, [isFocused, scrollToRefresh])

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
      scrollToOverflowEnabled
      ref={listViewRef}
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={settings.feedLayout === 'tide' ? 80 : 120}
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
      onScroll={(e) => {
        scrollY.current = e.nativeEvent.contentOffset.y
      }}
    />
  )
}
export default memo(TopicList)
