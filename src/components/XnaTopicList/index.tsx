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
import { useXnaFeed, XNA_LIST_KEY } from '@/hooks'
import { shouldFetch, shouldLoadMore } from '@/utils/react-query'
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
  const listViewRef = useRef<FlashList<XnaFeed>>()
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
  }, [listQuery.data, queryclient])

  const scrollToRefresh = useCallback(() => {
    if (listQuery.isRefetching) {
      return
    }
    if (settings.refreshHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    if (listQuery.data) {
      listViewRef.current.scrollToOffset({
        offset: 0,
        animated: true,
      })
    }
    listQuery.refetch()
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
    if (listQuery.isLoading && !listQuery.error) {
      // initial loading
      return new Array(20)
    }
    const items = listQuery.data?.pages.reduce((combined, page) => {
      if (page.data) {
        return uniqBy([...combined, ...page.data], 'url')
      }
      return combined
    }, [])
    return items || []
  }, [listQuery])

  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({ item, index }) =>
        settings.feedLayout === 'tide' ? (
          <TideTopicRow
            data={item}
            isLast={index === listItems.length - 1}
            viewedStatus={getViewedStatus(item?.url)}
            onView={setViewed}
            showAvatar={settings.feedShowAvatar}
            titleStyle={settings.feedTitleStyle}
          />
        ) : (
          <TopicRow
            data={item}
            isLast={index === listItems.length - 1}
            viewedStatus={getViewedStatus(item?.url)}
            showAvatar={settings.feedShowAvatar}
            onView={setViewed}
            titleStyle={settings.feedTitleStyle}
          />
        ),
      keyExtractor: (item: XnaFeed | undefined, index: number) =>
        item ? `${item.url}` : `index-${index}`,
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
      estimatedItemSize={settings.feedLayout === 'tide' ? 80 : 120}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (shouldLoadMore(listQuery)) {
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
export default memo(XnaTopicList)
