import { useCallback, useMemo } from 'react'
import { FlashListProps } from '@shopify/flash-list'

import AnimatedFlashList from '@/components/AnimatedFlashList'
import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'
import { ProfileCoordinatorTabRenderProps } from '@/components/ProfileCoordinator'

import { useAppSettings } from '@/containers/AppSettingsService'
import { useMemberTopics } from '@/hooks'
import { shouldLoadMore } from '@/utils/react-query'

import MemberTopicRow from './MemberTopicRow'

type MemberTopicsProps = {
  username: string
  isFocused?: boolean
} & ProfileCoordinatorTabRenderProps &
  Omit<FlashListProps<any>, 'data' | 'renderItem' | 'estimatedItemSize'>

export default function MemberTopics(props: MemberTopicsProps) {
  const { username, isFocused, listProps, contentContainerStyle } = props
  const { data: settings } = useAppSettings()

  const listQuery = useMemberTopics(username, isFocused)

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
  }, [listQuery.data, listQuery.isLoading, listQuery.error])

  const extraData = useMemo(
    () => ({
      listLength: listItems?.length ?? 0,
      settings,
    }),
    [listItems?.length, settings],
  )

  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({
        item,
        index,
        extraData: extra,
      }: {
        item: any
        index: number
        extraData?: typeof extraData
      }) {
        return (
          <MemberTopicRow
            data={item}
            isLast={index === (extra?.listLength ?? 0) - 1}
            showAvatar={extra?.settings?.feedShowAvatar}
            showLastReplyMember={extra?.settings?.feedShowLastReplyMember}
            titleStyle={extra?.settings?.feedTitleStyle}
          />
        )
      },
      keyExtractor(item, index) {
        return item?.id || `index-${index}`
      },
    }
  }, [])

  const handleEndReached = useCallback(() => {
    if (listQuery.error?.code === 'MEMBER_LOCKED') return
    if (shouldLoadMore(listQuery)) listQuery.fetchNextPage()
  }, [listQuery])

  const listFooter = useMemo(
    () => <CommonListFooter data={listQuery} />,
    [listQuery],
  )

  return (
    <AnimatedFlashList
      data={listItems}
      extraData={extraData}
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
      ListFooterComponent={listFooter}
      contentContainerStyle={contentContainerStyle}
      {...listProps}
    />
  )
}
