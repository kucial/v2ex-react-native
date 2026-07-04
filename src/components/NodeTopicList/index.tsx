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
import { FlashListRef } from '@shopify/flash-list'
import { useQueryClient, UseQueryResult } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'

import AnimatedFlashList from '@/components/AnimatedFlashList'
import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'

import { PAGE_RESET_LIMIT } from '@/constants'
import { useAppSettings } from '@/containers/AppSettingsService'
import { NODE_TOPICS_KEY, useNodeTopics } from '@/hooks'
import { shouldFetch } from '@/utils/react-query'
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
  const { data: settings } = useAppSettings()
  const queryclient = useQueryClient()

  const listViewRef = useRef<FlashListRef<NodeTopicFeed> | null>(null)
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y
    },
  })

  const listQuery = useNodeTopics(name, isFocused)

  const handleRefresh = useCallback(() => {
    if (listQuery.data?.pages?.length > PAGE_RESET_LIMIT) {
      queryclient.resetQueries({
        queryKey: [NODE_TOPICS_KEY, name],
        exact: true,
      })
    }
    listQuery.refetch()
  }, [listQuery.data, listQuery.refetch, name, queryclient])

  const scrollToRefresh = useCallback(() => {
    if (listQuery.isRefetching) {
      return
    }
    if (settings.refreshHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    if (listQuery.data) {
      listViewRef.current?.scrollToOffset({
        offset: scrollY.value > 0 ? 0 : -60,
        animated: true,
      })
    }
    handleRefresh()
  }, [
    handleRefresh,
    listQuery.data,
    listQuery.isRefetching,
    scrollY,
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
    if (!listQuery.data && !listQuery.error) {
      // initial loading
      return new Array(20)
    }
    if (!listQuery.data?.pages) {
      return []
    }

    const items: NodeTopicFeed[] = []
    for (const page of listQuery.data.pages) {
      if (!page.data) {
        continue
      }
      items.push(...page.data)
    }
    return items
  }, [listQuery.data, listQuery.error])

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

  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({
        item,
        index,
        extraData: extra,
      }: {
        item: any
        index: any
        extraData?: any
      }) {
        return extra?.rowSettings?.feedLayout === 'tide' ? (
          <TideNodeTopicRow
            data={item}
            isLast={index === extra?.listLength - 1}
            showAvatar={extra?.rowSettings?.feedShowAvatar}
            showLastReplyMember={extra?.rowSettings?.feedShowLastReplyMember}
            titleStyle={extra?.rowSettings?.feedTitleStyle}
          />
        ) : (
          <NodeTopicRow
            data={item}
            isLast={index === extra?.listLength - 1}
            showAvatar={extra?.rowSettings?.feedShowAvatar}
            showLastReplyMember={extra?.rowSettings?.feedShowLastReplyMember}
            titleStyle={extra?.rowSettings?.feedTitleStyle}
          />
        )
      },
      keyExtractor(item, index) {
        return item?.id || `index-${index}`
      },
    }
  }, [])

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
      <MyRefreshControl
        refreshing={listQuery.isRefetching}
        onRefresh={handleRefresh}
      />
    ),
    [handleRefresh, listQuery.isRefetching],
  )

  return (
    <AnimatedFlashList
      scrollToOverflowEnabled
      ref={listViewRef}
      className='flex-1'
      data={listItems}
      extraData={extraData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      onEndReached={handleEndReached}
      refreshControl={refreshControl}
      ListHeaderComponent={header}
      ListFooterComponent={listFooter}
      onScroll={scrollHandler}
    />
  )
}
