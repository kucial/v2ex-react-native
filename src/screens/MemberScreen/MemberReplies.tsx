import { useCallback, useMemo } from 'react'
import { SharedValue } from 'react-native-reanimated'
import { FlashListProps } from '@shopify/flash-list'
import { useInfiniteQuery } from '@tanstack/react-query'

import AnimatedFlashList from '@/components/AnimatedFlashList'
import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'

import { shouldLoadMore } from '@/utils/react-query'
import { getMemberReplies } from '@/utils/v2ex-client'

import MemberReplyRow from './MemberReplyRow'

export default function MemberReplies(
  props: {
    username: string
    scrollY: SharedValue<number>
    isFocused?: boolean
    onGetRef: (ref: any) => void
  } & Omit<FlashListProps<any>, 'data' | 'renderItem' | 'estimatedItemSize'>,
) {
  const fetchItems = useCallback(
    async ({ pageParam }) => {
      return getMemberReplies({
        username: props.username,
        p: pageParam,
      })
    },
    [props.username],
  )

  const listQuery = useInfiniteQuery({
    queryKey: ['/page/member/:username/replies.json', props.username],
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
          <MemberReplyRow data={item} isLast={index === listItems.length - 1} />
        )
      },
      keyExtractor(item, index) {
        return item?.reply_content_rendered || index
      },
    }
  }, [listItems?.length])

  return (
    <AnimatedFlashList
      className='flex-1'
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      scrollEventThrottle={16}
      onEndReached={() => {
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
