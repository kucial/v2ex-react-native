import {
  MutableRefObject,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { AppState } from 'react-native'
import { SharedValue, useAnimatedScrollHandler } from 'react-native-reanimated'
import { FlashList } from '@shopify/flash-list'
import {
  useInfiniteQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'

import AnimatedFlashList from '@/components/AnimatedFlashList'
import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'

import { PAGE_RESET_LIMIT } from '@/constants'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
import { shouldFetch } from '@/utils/react-query'
import { getNodeFeeds } from '@/utils/v2ex-client'
import { NodeTopicFeed } from '@/utils/v2ex-client/types'

import NodeTopicRow from './NodeTopicRow'
import TideNodeTopicRow from './TideNodeTopicRow'

type NodeTopicListProps = {
  name: string
  isFocused: boolean
  currentListRef?: MutableRefObject<any>
  header?: ReactElement
  nodeQuery?: UseQueryResult
  scrollY: SharedValue<number>
}

export default function NodeTopicList(props: NodeTopicListProps) {
  const { header, name, isFocused, currentListRef, scrollY } = props
  const { getViewedStatus } = useViewedTopics()
  const alert = useAlertService()
  const { data: settings } = useAppSettings()
  const queryclient = useQueryClient()

  const listViewRef = useRef<FlashList<NodeTopicFeed>>()
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y
    },
  })

  const fetchItems = useCallback(
    async ({ pageParam }) => {
      try {
        return getNodeFeeds({ name, p: pageParam })
      } catch (err) {
        if (err.code !== '2FA_ENABLED') {
          alert.show({
            type: 'error',
            message: err.message || '请求资源失败',
          })
        }
        throw err
      }
    },
    [name],
  )

  const listQuery = useInfiniteQuery({
    queryKey: ['/page/go/:name/feed.json', name],
    initialPageParam: 1,
    queryFn: fetchItems,
    getNextPageParam(lastPage) {
      if (
        lastPage.pagination &&
        lastPage.pagination.total > lastPage.pagination.current
      ) {
        return lastPage.pagination.current + 1
      }
      return undefined
    },
  })

  const handleRefresh = useCallback(() => {
    if (listQuery.data?.pages?.length > PAGE_RESET_LIMIT) {
      queryclient.resetQueries({
        queryKey: ['/page/go/:name/feed.json', name],
        exact: true,
      })
    }
    listQuery.refetch()
  }, [listQuery.data, name, queryclient])

  const scrollToRefresh = useCallback(() => {
    if (listQuery.isRefetching) {
      return
    }
    if (settings.refreshHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    if (listQuery.data) {
      listViewRef.current.scrollToOffset({
        offset: scrollY.value > 0 ? 0 : -60,
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
      let toBackDate
      const subscription = AppState.addEventListener(
        'change',
        (nextAppState) => {
          if (
            appState === 'background' &&
            nextAppState === 'active' &&
            Date.now() - toBackDate > 60 * 1000 &&
            shouldFetch(
              listQuery,
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
    if (listQuery.isLoading && !listQuery.error) {
      // initial loading
      return new Array(20)
    }
    const items = listQuery.data?.pages.reduce((combined, page) => {
      if (page.data) {
        return [...combined, ...page.data]
      }
      return combined
    }, [])
    return items || []
  }, [listQuery])

  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({ item, index }) {
        return settings.feedLayout === 'tide' ? (
          <TideNodeTopicRow
            data={item}
            isLast={index === listItems.length - 1}
            viewedStatus={getViewedStatus(item)}
            showAvatar={settings.feedShowAvatar}
            showLastReplyMember={settings.feedShowLastReplyMember}
            titleStyle={settings.feedTitleStyle}
          />
        ) : (
          <NodeTopicRow
            data={item}
            isLast={index === listItems.length - 1}
            viewedStatus={getViewedStatus(item)}
            showAvatar={settings.feedShowAvatar}
            showLastReplyMember={settings.feedShowLastReplyMember}
            titleStyle={settings.feedTitleStyle}
          />
        )
      },
      keyExtractor(item, index) {
        return item?.id || `index-${index}`
      },
    }
  }, [getViewedStatus, settings, listItems])

  return (
    <AnimatedFlashList
      scrollToOverflowEnabled
      ref={listViewRef}
      className='flex-1'
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
      ListHeaderComponent={header}
      ListFooterComponent={() => {
        return <CommonListFooter data={listQuery} />
      }}
      onScroll={scrollHandler}
    />
  )
}
