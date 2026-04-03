import { useMemo } from 'react'
import { SharedValue } from 'react-native-reanimated'
import { FlashListProps } from '@shopify/flash-list'

import AnimatedFlashList from '@/components/AnimatedFlashList'
import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'

import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useGetViewedStatus } from '@/containers/ViewedTopicsService'
import { useMemberTopics } from '@/hooks'
import { shouldLoadMore } from '@/utils/react-query'

import MemberTopicRow from './MemberTopicRow'

export default function MemberTopics(
  props: {
    username: string
    scrollY: SharedValue<number>
    isFocused?: boolean
    onGetRef: (ref: any) => void
  } & Omit<FlashListProps<any>, 'data' | 'renderItem' | 'estimatedItemSize'>,
) {
  const alert = useAlertService()
  const getViewedStatus = useGetViewedStatus()
  const { data: settings } = useAppSettings()

  const listQuery = useMemberTopics(props.username, props.isFocused)

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
          <MemberTopicRow
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
          progressViewOffset={props.contentContainerStyle?.paddingTop as number}
        />
      }
      ListFooterComponent={() => {
        return <CommonListFooter data={listQuery} />
      }}
      onScroll={props.isFocused ? props.onScroll : undefined}
      onScrollEndDrag={props.isFocused ? props.onScrollEndDrag : undefined}
      onMomentumScrollBegin={
        props.isFocused ? props.onMomentumScrollBegin : undefined
      }
      onMomentumScrollEnd={
        props.isFocused ? props.onMomentumScrollEnd : undefined
      }
      contentContainerStyle={props.contentContainerStyle}
      ref={props.onGetRef}
    />
  )
}
