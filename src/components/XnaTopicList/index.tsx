import {
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { AppState } from 'react-native'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'

import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'

import { PAGE_RESET_LIMIT } from '@/constants'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useXnaFeed, XNA_LIST_KEY } from '@/hooks'
import { shouldFetch } from '@/utils/react-query'
import { XnaFeed } from '@/utils/v2ex-client/types'

import { useViewedLinks } from './hooks'
import TideTopicRow from './TideTopicRow'
import TopicRow from './TopicRow'

type XnaTopicListProps = {
  isFocused: boolean
  currentListRef: MutableRefObject<any>
}

function XnaTopicList(props: XnaTopicListProps) {
  const { isFocused, currentListRef } = props
  const listViewRef = useRef<FlashListRef<XnaFeed> | null>(null)
  const scrollY = useRef(0)
  const { data: settings } = useAppSettings()
  const { setViewed, getViewedStatus } = useViewedLinks()
  const queryclient = useQueryClient()

  const listQuery = useXnaFeed(isFocused)

  const handleRefresh = useCallback(() => {
    if (listQuery.data?.pages?.length > PAGE_RESET_LIMIT) {
      queryclient.resetQueries({
        queryKey: [XNA_LIST_KEY],
        exact: true,
      })
    }
    listQuery.refetch()
  }, [listQuery.data, listQuery.refetch, queryclient])

  const scrollToRefresh = useCallback(() => {
    if (listQuery.isRefetching) {
      return
    }
    if (settings.refreshHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    if (listQuery.data) {
      listViewRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      })
    }
    handleRefresh()
  }, [
    handleRefresh,
    listQuery.data,
    listQuery.isRefetching,
    settings.refreshHaptics,
  ])

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
    if (listQuery.isLoading && !listQuery.error) {
      // initial loading
      return new Array(20)
    }
    if (!listQuery.data?.pages) {
      return []
    }

    const seenUrls = new Set<XnaFeed['url']>()
    const items: XnaFeed[] = []
    for (const page of listQuery.data.pages) {
      if (!page.data) {
        continue
      }
      for (const item of page.data) {
        if (!seenUrls.has(item.url)) {
          seenUrls.add(item.url)
          items.push(item)
        }
      }
    }
    return items
  }, [listQuery.data, listQuery.isLoading, listQuery.error])

  const rowSettings = useMemo(
    () => ({
      feedLayout: settings.feedLayout,
      feedShowAvatar: settings.feedShowAvatar,
      feedTitleStyle: settings.feedTitleStyle,
    }),
    [settings.feedLayout, settings.feedShowAvatar, settings.feedTitleStyle],
  )

  const extraData = useMemo(
    () => ({
      listLength: listItems.length,
      getViewedStatus,
      rowSettings,
      setViewed,
    }),
    [listItems.length, getViewedStatus, rowSettings, setViewed],
  )

  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({
        item,
        index,
        extraData: extra,
      }: {
        item: any
        index: any
        extraData?: any
      }) =>
        extra?.rowSettings?.feedLayout === 'tide' ? (
          <TideTopicRow
            data={item}
            isLast={index === extra?.listLength - 1}
            viewedStatus={extra?.getViewedStatus(item?.url)}
            onView={extra?.setViewed}
            showAvatar={extra?.rowSettings?.feedShowAvatar}
            titleStyle={extra?.rowSettings?.feedTitleStyle}
          />
        ) : (
          <TopicRow
            data={item}
            isLast={index === extra?.listLength - 1}
            viewedStatus={extra?.getViewedStatus(item?.url)}
            showAvatar={extra?.rowSettings?.feedShowAvatar}
            onView={extra?.setViewed}
            titleStyle={extra?.rowSettings?.feedTitleStyle}
          />
        ),
      keyExtractor: (item: XnaFeed | undefined, index: number) =>
        item ? `${item.url}` : `index-${index}`,
    }),
    [],
  )

  const handleEndReached = useCallback(() => {
    if (
      listQuery.hasNextPage &&
      !listQuery.isFetchingNextPage &&
      !listQuery.error
    ) {
      listQuery.fetchNextPage()
    }
  }, [
    listQuery.error,
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
      <MyRefreshControl
        refreshing={listQuery.isRefetching}
        onRefresh={handleRefresh}
      />
    ),
    [handleRefresh, listQuery.isRefetching],
  )

  const handleScroll = useCallback((e) => {
    scrollY.current = e.nativeEvent.contentOffset.y
  }, [])

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
export default memo(XnaTopicList)
