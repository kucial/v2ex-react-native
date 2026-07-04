import {
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { AppState, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'

import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'

import { PAGE_RESET_LIMIT } from '@/constants'
import { useAppSettings } from '@/containers/AppSettingsService'
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
  currentListRef: MutableRefObject<{
    scrollToRefresh: () => void
  } | null>
}

function FeedTopicList(props: FeedTopicListProps) {
  const { tab, isFocused, currentListRef } = props
  const listViewRef = useRef<FlashListRef<HomeTopicFeed | undefined> | null>(
    null,
  )
  const scrollY = useRef(0)
  const { data: settings } = useAppSettings()
  const queryclient = useQueryClient()

  const listQuery = useHomeTabFeed(tab, isFocused)
  const { refetch, data: listQueryData, isRefetching } = listQuery

  const handleRefresh = useCallback(() => {
    if ((listQueryData?.pages?.length ?? 0) > PAGE_RESET_LIMIT) {
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
        settings.autoRefresh ? settings.autoRefreshDuration : undefined,
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
              settings.autoRefresh ? settings.autoRefreshDuration : undefined,
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
  }, [
    isFocused,
    settings.autoRefresh,
    settings.autoRefreshDuration,
    scrollToRefresh,
  ])

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
      return Array.from<HomeTopicFeed | undefined>({ length: 20 })
    }
    if (!listQueryData?.pages) {
      return []
    }

    const seenIds = new Set<HomeTopicFeed['id']>()
    const items: HomeTopicFeed[] = []
    for (const page of listQueryData.pages) {
      if (!page.data) {
        continue
      }
      for (const item of page.data) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id)
          items.push(item)
        }
      }
    }
    return items
  }, [listQueryData, isFocused])

  useEffect(() => {
    const topicItems = listItems.filter((item): item is HomeTopicFeed => !!item)
    if (tab === 'today_hots') {
      updateHotsFeedWidget(topicItems.slice(0, 10)).catch((err) => {
        if (__DEV__) console.warn('updateHotsFeedWidget failed', err)
      })
    } else if (tab === 'recent') {
      updateRecentWidgetFeedWidget(topicItems.slice(0, 10)).catch((err) => {
        if (__DEV__) console.warn('updateRecentWidgetFeedWidget failed', err)
      })
    } else {
      updateHomeFeedWidget(tab, topicItems.slice(0, 10)).catch((err) => {
        if (__DEV__) console.warn('updateHomeFeedWidget failed', err)
      })
    }
  }, [listItems, tab])

  const rowSettings = useMemo(
    () => ({
      feedLayout: settings.feedLayout,
      feedShowAvatar: settings.feedShowAvatar,
      feedShowLastReplyMember: settings.feedShowLastReplyMember,
      feedTitleStyle: settings.feedTitleStyle,
    }),
    [
      settings.feedLayout,
      settings.feedShowAvatar,
      settings.feedShowLastReplyMember,
      settings.feedTitleStyle,
    ],
  )

  const extraData = useMemo(
    () => ({
      listLength: listItems.length,
      rowSettings,
    }),
    [listItems.length, rowSettings],
  )

  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({
        item,
        index,
        extraData: extra,
      }: {
        item: HomeTopicFeed | undefined
        index: number
        extraData?: typeof extraData
      }) =>
        extra?.rowSettings?.feedLayout === 'tide' ? (
          <TideTopicRow
            data={item}
            isLast={index === (extra?.listLength ?? 0) - 1}
            showAvatar={extra?.rowSettings?.feedShowAvatar ?? true}
            showLastReplyMember={
              extra?.rowSettings?.feedShowLastReplyMember ?? true
            }
            titleStyle={extra?.rowSettings?.feedTitleStyle ?? 'normal'}
          />
        ) : (
          <TopicRow
            data={item}
            isLast={index === (extra?.listLength ?? 0) - 1}
            showAvatar={extra?.rowSettings?.feedShowAvatar ?? true}
            showLastReplyMember={
              extra?.rowSettings?.feedShowLastReplyMember ?? true
            }
            titleStyle={extra?.rowSettings?.feedTitleStyle ?? 'normal'}
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
  }, [
    listQuery.fetchNextPage,
    listQuery.hasNextPage,
    listQuery.isFetchingNextPage,
  ])

  const listFooter = useMemo(
    () => <CommonListFooter data={listQuery} />,
    [listQuery],
  )

  const refreshControl = useMemo(
    () => (
      <MyRefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
    ),
    [handleRefresh, isRefetching],
  )

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.current = e.nativeEvent.contentOffset.y
    },
    [],
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
      refreshControl={refreshControl}
      ListFooterComponent={listFooter}
      onScroll={handleScroll}
    />
  )
}

export default memo(FeedTopicList)
