import { useCallback, useMemo } from 'react'
import { SharedValue } from 'react-native-reanimated'
import { FlashListProps } from '@shopify/flash-list'
import { useInfiniteQuery } from '@tanstack/react-query'

import AnimatedFlashList from '@/components/AnimatedFlashList'
import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
import { shouldLoadMore } from '@/utils/react-query'
import { getMemberTopics } from '@/utils/v2ex-client'

import UserTopicRow from './MemberTopicRow'

export default function MemberTopics(
  props: {
    username: string
    scrollY: SharedValue<number>
    isFocused?: boolean
    onGetRef: (ref: any) => void
  } & Omit<FlashListProps<any>, 'data' | 'renderItem' | 'estimatedItemSize'>,
) {
  const alert = useAlertService()
  const { getViewedStatus } = useViewedTopics()
  const { data: settings } = useAppSettings()

  const fetchItems = useCallback(
    async ({ pageParam }) => {
      try {
        return getMemberTopics({ username: props.username, p: pageParam })
      } catch (err) {
        if (!err.code) {
          alert.show({
            type: 'error',
            message: err.message || '请求资源失败',
          })
        }
        throw err
      }
    },
    [props.username],
  )

  const listQuery = useInfiniteQuery({
    queryKey: ['/page/member/:username/topics.json', props.username],
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
  })

  const listItems = useMemo(() => {
    if (listQuery.isLoading && !listQuery.error) {
      // initial loading
      return new Array(10)
    }
    const items = listQuery.data?.pages.reduce((combined, page) => {
      if (page.data) {
        return [...combined, ...page.data]
      }
      return combined
    }, [])
    return items
  }, [listQuery])

  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({ item, index }) {
        return (
          <UserTopicRow
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
  }, [listItems?.length])

  return (
    <AnimatedFlashList
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      estimatedItemSize={110}
      scrollEventThrottle={16}
      onEndReached={() => {
        if (listQuery.error?.code === 'MEMBER_LOCKED') {
          return
        }
        if (shouldLoadMore(listQuery)) {
          listQuery.fetchNextPage()
        }
      }}
      refreshControl={
        <MyRefreshControl
          refreshing={listQuery.isRefetching}
          onRefresh={listQuery.refetch}
          progressViewOffset={props.contentContainerStyle.paddingTop as number}
        />
      }
      ListFooterComponent={() => {
        return <CommonListFooter data={listQuery} />
      }}
      onScroll={props.onScroll}
      onScrollEndDrag={props.onScrollEndDrag}
      onMomentumScrollBegin={props.onMomentumScrollBegin}
      onMomentumScrollEnd={props.onMomentumScrollEnd}
      contentContainerStyle={props.contentContainerStyle}
      ref={props.onGetRef}
    />
  )
}
