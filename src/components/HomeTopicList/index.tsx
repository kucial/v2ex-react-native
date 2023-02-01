import {
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { AppState } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import * as Haptics from 'expo-haptics'
import { uniqBy } from 'lodash'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
import { isRefreshing, shouldFetch, shouldLoadMore } from '@/utils/swr'
import { getHomeFeeds, getRecentFeeds } from '@/utils/v2ex-client'
import { HomeTopicFeed } from '@/utils/v2ex-client/types'

import TideTopicRow from './TideTopicRow'
import TopicRow from './TopicRow'

type FeedTopicListProps = {
  tab: string
  isFocused: boolean
  currentListRef: MutableRefObject<any>
}

function FeedTopicList(props: FeedTopicListProps) {
  const { tab, isFocused, currentListRef } = props
  const alert = useAlertService()
  const listViewRef = useRef<FlashList<HomeTopicFeed>>()
  const scrollY = useRef(0)
  const { data: settings } = useAppSettings()
  const { getViewedStatus } = useViewedTopics()
  const getKey = useCallback(
    (index: number): [string, string, number] => {
      return ['/page/home/feed', tab, index + 1]
    },
    [tab],
  )
  const listSwr = useSWRInfinite(
    getKey,
    async ([_, tab, page]) => {
      if (tab === 'recent') {
        return getRecentFeeds({ p: page })
      }
      return getHomeFeeds({ tab })
    },
    {
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError(err: Error) {
        alert.alertWithType('error', '错误', err.message || '请求资源失败')
      },
    },
  )

  const scrollToRefresh = useCallback(() => {
    if (listSwr.isValidating) {
      return
    }
    if (listSwr.data) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      listSwr.setSize(1).catch((err) => {
        console.log(err)
      })
      listViewRef.current.scrollToOffset({
        offset: scrollY.current > 0 ? 0 : -60,
        animated: true,
      })
    }
    listSwr.mutate().catch((err) => {
      console.log(err)
    })
  }, [listSwr])

  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({ item }: { item: HomeTopicFeed }) =>
        settings.feedLayout === 'tide' ? (
          <TideTopicRow
            data={item}
            viewedStatus={getViewedStatus(item)}
            showAvatar={settings.feedShowAvatar}
            showLastReplyMember={settings.feedShowLastReplyMember}
          />
        ) : (
          <TopicRow
            data={item}
            viewedStatus={getViewedStatus(item)}
            showAvatar={settings.feedShowAvatar}
            showLastReplyMember={settings.feedShowLastReplyMember}
          />
        ),
      keyExtractor: (item: HomeTopicFeed | undefined, index: number) =>
        item ? `${item.id}` : `index-${index}`,
    }),
    [getViewedStatus, settings],
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
      let toBackgroundDate: number
      const subscription = AppState.addEventListener(
        'change',
        (nextAppState) => {
          if (
            appState === 'background' &&
            nextAppState === 'active' &&
            Date.now() - toBackgroundDate > 60 * 1000 &&
            shouldFetch(
              listSwr,
              settings.autoRefresh && settings.autoRefreshDuration,
            )
          ) {
            scrollToRefresh()
          } else if (nextAppState === 'background') {
            toBackgroundDate = Date.now()
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
    currentListRef.current = {
      scrollToRefresh,
    }
  }, [isFocused, scrollToRefresh])

  const listItems = useMemo(() => {
    if (!listSwr.data && !listSwr.error) {
      // initial loading
      return new Array(20)
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
        if (shouldLoadMore(listSwr)) {
          listSwr.setSize((size) => size + 1)
        }
      }}
      refreshing={isRefreshing(listSwr) || false}
      onRefresh={() => {
        if (!listSwr.isValidating) {
          listSwr.mutate()
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
export default memo(FeedTopicList)
