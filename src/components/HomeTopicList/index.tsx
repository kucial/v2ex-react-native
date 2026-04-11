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
  const listViewRef = useRef<FlashList<HomeTopicFeed>>()
  const scrollY = useRef(0)
  const { data: settings } = useAppSettings()
  const getViewedStatus = useGetViewedStatus()
  const queryclient = useQueryClient()

  const listQuery = useHomeTabFeed(tab, isFocused)

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
  }, [listQuery.data, isFocused])

  useEffect(() => {
    if (tab === 'today_hots') {
      updateHotsFeedWidget(listItems.slice(0, 10)).catch((err) => {
        // do nothing.
      })
    } else if (tab === 'recent') {
      updateRecentWidgetFeedWidget(listItems.slice(0, 10)).catch((err) => {
        // do nothing.
      })
    } else {
      updateHomeFeedWidget(tab, listItems.slice(0, 10)).catch((err) => {
        // do nothing.
      })
    }
  }, [listItems])

  const extraData = useMemo(
    () => ({
      listLength: listItems.length,
      getViewedStatus,
      settings,
    }),
    [listItems.length, getViewedStatus, settings],
  )

  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({ item, index, extraData: extra }: { item: any; index: any; extraData?: any }) =>
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
          refreshing={listQuery.isRefetching}
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
