import { useCallback, useMemo } from 'react'
import { SharedValue } from 'react-native-reanimated'
import { FlashListProps } from '@shopify/flash-list'
import useSWRInfinite from 'swr/infinite'

import AnimatedFlashList from '@/components/AnimatedFlashList'
import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'
import { isRefreshing, shouldLoadMore } from '@/utils/swr'
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
  const getKey = useCallback(
    (index: number): [string, string, number] => {
      return ['/page/member/:username/replies.json', props.username, index + 1]
    },
    [props.username],
  )

  const listSwr = useSWRInfinite(
    getKey,
    ([_, username, page]) => getMemberReplies({ username, p: page }),
    {
      shouldRetryOnError: false,
    },
  )

  const listItems = useMemo(() => {
    if (!listSwr.data && !listSwr.error) {
      // initial loading
      return new Array(10)
    }
    const items = (listSwr.data || []).reduce((combined, page) => {
      if (page.data) {
        return [...combined, ...page.data]
      }
      return combined
    }, [])
    return items
  }, [listSwr])

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
      className="flex-1"
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      estimatedItemSize={124}
      scrollEventThrottle={16}
      onEndReached={() => {
        if (shouldLoadMore(listSwr)) {
          listSwr.setSize(listSwr.size + 1)
        }
      }}
      refreshControl={
        <MyRefreshControl
          refreshing={isRefreshing(listSwr)}
          onRefresh={() => {
            if (listSwr.isValidating) {
              return
            }
            listSwr.mutate()
          }}
          progressViewOffset={props.contentContainerStyle.paddingTop as number}
        />
      }
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
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
