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
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { uniqBy } from 'lodash'

import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'

import { PAGE_RESET_LIMIT } from '@/constants'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
import { shouldFetch } from '@/utils/react-query'
import { getHomeFeeds, getHotTopics, getRecentFeeds } from '@/utils/v2ex-client'
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
  const listViewRef = useRef<FlashList<HomeTopicFeed>>()
  const scrollY = useRef(0)
  const { data: settings } = useAppSettings()
  const { getViewedStatus } = useViewedTopics()
  const queryclient = useQueryClient()

  const fetchItems = useCallback(
    ({ pageParam }) => {
      if (tab === 'recent') {
        return getRecentFeeds({ p: pageParam })
      }
      if (tab == 'today_hots') {
        return getHotTopics()
      }
      return getHomeFeeds({ tab })
    },
    [tab],
  )

  const listQuery = useInfiniteQuery({
    queryKey: ['/page/home/feed', tab],
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
    enabled: isFocused,
  })

  const handleRefresh = useCallback(() => {
    if (listQuery.data?.pages?.length > PAGE_RESET_LIMIT) {
      queryclient.resetQueries({
        queryKey: ['/page/home/feed', tab],
        exact: true,
      })
    }
    listQuery.refetch()
  }, [listQuery.data, tab, queryclient])

  const scrollToRefresh = useCallback(() => {
    if (listQuery.isRefetching) {
      return
    }
    if (settings.refreshHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    if (listQuery.data) {
      // console.log(scrollY.current)
      listViewRef.current.scrollToOffset({
        // offset: scrollY.current > 0 ? 0 : -60,
        offset: 0,
        animated: true,
      })
    }
    handleRefresh()
  }, [listQuery.isRefetching, listQuery.data, settings.refreshHaptics])

  useEffect(() => {
    if (
      isFocused &&
      shouldFetch(
        listQuery,
        settings.autoRefresh && settings.autoRefreshDuration,
      )
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
              listQuery,
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
    if (currentListRef) {
      currentListRef.current = {
        scrollToRefresh,
      }
    }
  }, [isFocused, scrollToRefresh])

  const listItems = useMemo(() => {
    if (isFocused && !listQuery.data && !listQuery.error) {
      // initial loading
      return new Array(20)
    }
    const items = listQuery.data?.pages?.reduce((combined, page) => {
      if (page.data) {
        return uniqBy([...combined, ...page.data], 'id')
      }
      return combined
    }, [])
    return items || []
  }, [listQuery.data, isFocused, getViewedStatus])

  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({ item, index }) =>
        settings.feedLayout === 'tide' ? (
          <TideTopicRow
            data={item}
            isLast={index === listItems.length - 1}
            viewedStatus={getViewedStatus(item)}
            showAvatar={settings.feedShowAvatar}
            showLastReplyMember={settings.feedShowLastReplyMember}
            titleStyle={settings.feedTitleStyle}
          />
        ) : (
          <TopicRow
            data={item}
            isLast={index === listItems.length - 1}
            viewedStatus={getViewedStatus(item)}
            showAvatar={settings.feedShowAvatar}
            showLastReplyMember={settings.feedShowLastReplyMember}
            titleStyle={settings.feedTitleStyle}
          />
        ),
      keyExtractor: (item: HomeTopicFeed | undefined, index: number) =>
        item ? `${item.id}` : `index-${index}`,
    }),
    [getViewedStatus, settings, listItems],
  )

  return (
    <FlashList
      scrollToOverflowEnabled
      ref={listViewRef}
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
          listQuery.fetchNextPage()
        }
      }}
      refreshControl={
        <MyRefreshControl
          refreshing={listQuery.isRefetching}
          onRefresh={handleRefresh}
        />
      }
      ListFooterComponent={() => {
        return <CommonListFooter data={listQuery} />
      }}
      onScroll={(e) => {
        scrollY.current = e.nativeEvent.contentOffset.y
      }}
    />
  )
}
export default memo(FeedTopicList)
