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
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { uniqBy } from 'lodash'

import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'

import { PAGE_RESET_LIMIT } from '@/constants'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useGetViewedStatus } from '@/containers/ViewedTopicsService'
import { useHomeTabFeed } from '@/hooks'
import {
  updateHomeFeedWidget,
  updateHotsFeedWidget,
  updateRecentWidgetFeedWidget,
} from '@/lib/widget-background-task'
import { shouldFetch } from '@/utils/react-query'
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
  const listViewRef = useRef<FlashList<HomeTopicFeed> | null>(null)
  const scrollY = useRef(0)
  const { data: settings } = useAppSettings()
  const getViewedStatus = useGetViewedStatus()
  const queryclient = useQueryClient()

  const listQuery = useHomeTabFeed(tab, isFocused)
  const { refetch, data: listQueryData, isRefetching } = listQuery

  const handleRefresh = useCallback(() => {
    if (listQueryData?.pages?.length > PAGE_RESET_LIMIT) {
      queryclient.resetQueries({
        queryKey: ['/page/home/feed', tab],
        exact: true,
      })
    }
    refetch()
  }, [listQueryData, tab, queryclient, refetch])

  const scrollToRefresh = useCallback(() => {
    if (isRefetching) {
      return
    }
    if (settings.refreshHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    if (listQueryData) {
      listViewRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      })
    }
    handleRefresh()
  }, [isRefetching, listQueryData, settings.refreshHaptics, handleRefresh])

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
      // Initialize to 0 so Date.now() - toBackgroundDate is never NaN
      let toBackgroundDate: number = 0
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
  }, [isFocused, settings.autoRefresh, settings.autoRefreshDuration, scrollToRefresh])

  useEffect(() => {
    if (currentListRef) {
      currentListRef.current = {
        scrollToRefresh,
      }
    }
  }, [isFocused, scrollToRefresh])

  const listItems = useMemo(() => {
    if (isFocused && !listQueryData && !listQuery.error) {
      // initial loading — return skeleton placeholders
      return new Array(20)
    }
    const items = listQueryData?.pages?.reduce((combined, page) => {
      if (page.data) {
        return uniqBy([...combined, ...page.data], 'id')
      }
      return combined
    }, [])
    return items || []
  }, [listQueryData, isFocused])

  useEffect(() => {
    if (tab === 'today_hots') {
      updateHotsFeedWidget(listItems.slice(0, 10)).catch((err) => {
        if (__DEV__) console.warn('updateHotsFeedWidget failed', err)
      })
    } else if (tab === 'recent') {
      updateRecentWidgetFeedWidget(listItems.slice(0, 10)).catch((err) => {
        if (__DEV__) console.warn('updateRecentWidgetFeedWidget failed', err)
      })
    } else {
      updateHomeFeedWidget(tab, listItems.slice(0, 10)).catch((err) => {
        if (__DEV__) console.warn('updateHomeFeedWidget failed', err)
      })
    }
  }, [listItems, tab])

  const extraData = useMemo(
    () => ({
      listLength: listItems.length,
      getViewedStatus,
      settings,
    }),
    [listItems.length, settings, getViewedStatus],
  )

  const { renderItem, keyExtractor } = useMemo(
    () => ({
      // renderItem intentionally has no deps — all dynamic data flows through extraData
      renderItem: ({
        item,
        index,
        extraData: extra,
      }: {
        item: HomeTopicFeed | undefined
        index: number
        extraData?: typeof extraData
      }) =>
        extra?.settings?.feedLayout === 'tide' ? (
          <TideTopicRow
            data={item}
            isLast={index === extra?.listLength - 1}
            viewedStatus={extra?.getViewedStatus(item)}
            showAvatar={extra?.settings?.feedShowAvatar}
            showLastReplyMember={extra?.settings?.feedShowLastReplyMember}
            titleStyle={extra?.settings?.feedTitleStyle}
          />
        ) : (
          <TopicRow
            data={item}
            isLast={index === extra?.listLength - 1}
            viewedStatus={extra?.getViewedStatus(item)}
            showAvatar={extra?.settings?.feedShowAvatar}
            showLastReplyMember={extra?.settings?.feedShowLastReplyMember}
            titleStyle={extra?.settings?.feedTitleStyle}
          />
        ),
      keyExtractor: (item: HomeTopicFeed | undefined, index: number) =>
        item ? `${item.id}` : `index-${index}`,
    }),
    [],
  )

  const handleEndReached = useCallback(() => {
    if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
      listQuery.fetchNextPage()
    }
  }, [listQuery.hasNextPage, listQuery.isFetchingNextPage])

  const listFooter = useMemo(
    () => <CommonListFooter data={listQuery} />,
    [listQuery],
  )

  return (
    <FlashList
      scrollToOverflowEnabled
      ref={listViewRef}
      data={listItems}
      extraData={extraData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      onEndReached={handleEndReached}
      refreshControl={
        <MyRefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
        />
      }
      ListFooterComponent={listFooter}
      onScroll={(e) => {
        scrollY.current = e.nativeEvent.contentOffset.y
      }}
    />
  )
}

export default memo(FeedTopicList)
