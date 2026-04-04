import {
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { AppState, View } from 'react-native'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { uniqBy } from 'lodash'

import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'

import { PAGE_RESET_LIMIT } from '@/constants'
import { useAppSettings } from '@/containers/AppSettingsService'
import { PLANET_FEED_LIST_KEY, usePlanetFeed } from '@/hooks'
import { useAudioResourceInterceptor } from '@/stores/audio'
import { shouldFetch, shouldLoadMore } from '@/utils/react-query'
import { PlanetFeedItem } from '@/utils/v2ex-client/types'

import { useViewedLinks } from './hooks'
import TopicCard from './TopicCard'

type PlanetFeedListProps = {
  isFocused: boolean
  currentListRef: MutableRefObject<{
    scrollToRefresh: () => void
  } | null>
}

function PlanetFeedList(props: PlanetFeedListProps) {
  const { isFocused, currentListRef } = props
  const listViewRef = useRef<FlashListRef<PlanetFeedItem> | null>(null)
  const scrollY = useRef(0)
  const { data: settings } = useAppSettings()
  const { setViewed, getViewedStatus } = useViewedLinks()
  const queryclient = useQueryClient()

  const listQuery = usePlanetFeed(isFocused)

  useAudioResourceInterceptor(listQuery.data?.pages)

  const handleRefresh = useCallback(() => {
    if (listQuery.data?.pages?.length > PAGE_RESET_LIMIT) {
      queryclient.resetQueries({
        queryKey: [PLANET_FEED_LIST_KEY],
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
        return uniqBy([...combined, ...page.data], 'uuid')
      }
      return combined
    }, [])
    return items || []
  }, [listQuery])

  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({ item, index }) => (
        <View className='py-1 px-2'>
          <TopicCard
            data={item}
            isLast={index === listItems.length - 1}
            viewedStatus={getViewedStatus(item?.url || item?.uuid)}
            showAvatar={settings.feedShowAvatar}
            onView={setViewed}
            titleStyle={settings.feedTitleStyle}
          />
        </View>
      ),
      keyExtractor: (item: PlanetFeedItem | undefined, index: number) =>
        item ? `${item.uuid}` : `index-${index}`,
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
      contentContainerStyle={{ paddingVertical: 4 }}
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
export default memo(PlanetFeedList)
