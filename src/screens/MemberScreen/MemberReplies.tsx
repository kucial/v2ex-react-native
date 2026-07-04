import { useCallback, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { FlashListProps } from '@shopify/flash-list'
import { useInfiniteQuery } from '@tanstack/react-query'

import AnimatedFlashList from '@/components/AnimatedFlashList'
import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'
import { ProfileCoordinatorTabRenderProps } from '@/components/ProfileCoordinator'

import { shouldLoadMore } from '@/utils/react-query'
import { getMemberReplies } from '@/utils/v2ex-client'

import MemberReplyRow from './MemberReplyRow'

type MemberRepliesProps = {
  username: string
  isFocused?: boolean
} & ProfileCoordinatorTabRenderProps &
  Omit<FlashListProps<any>, 'data' | 'renderItem' | 'estimatedItemSize'>

export default function MemberReplies(props: MemberRepliesProps) {
  const { username, listProps, contentContainerStyle } = props

  const fetchItems = useCallback(
    async ({ pageParam }) => getMemberReplies({ username, p: pageParam }),
    [username],
  )

  const listQuery = useInfiniteQuery({
    queryKey: ['/page/member/:username/replies.json', username],
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
      return new Array(10)
    }
    return (
      listQuery.data?.pages.reduce((combined, page) => {
        if (page.data) return [...combined, ...page.data]
        return combined
      }, []) ?? []
    )
  }, [listQuery])

  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({ item, index }) {
        return (
          <MemberReplyRow data={item} isLast={index === listItems.length - 1} />
        )
      },
      keyExtractor(item, index) {
        return item?.reply_content_rendered || String(index)
      },
    }
  }, [listItems.length])

  const handleEndReached = useCallback(() => {
    if (shouldLoadMore(listQuery)) listQuery.fetchNextPage()
  }, [listQuery])

  return (
    <AnimatedFlashList
      style={listStyles.list}
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      onEndReached={handleEndReached}
      refreshControl={
        <MyRefreshControl
          refreshing={listQuery.isRefetching}
          onRefresh={listQuery.refetch}
          progressViewOffset={contentContainerStyle?.paddingTop as number}
        />
      }
      ListFooterComponent={() => <CommonListFooter data={listQuery} />}
      contentContainerStyle={contentContainerStyle}
      {...listProps}
    />
  )
}

const listStyles = StyleSheet.create({
  list: {
    flex: 1,
  },
})
