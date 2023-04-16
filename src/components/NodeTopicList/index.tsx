import {
  MutableRefObject,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { AppState } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import * as Haptics from 'expo-haptics'
import { SWRResponse } from 'swr'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
import { isRefreshing, shouldFetch, shouldLoadMore } from '@/utils/swr'
import { getNodeFeeds } from '@/utils/v2ex-client'
import { NodeTopicFeed } from '@/utils/v2ex-client/types'

import NodeTopicRow from './NodeTopicRow'
import TideNodeTopicRow from './TideNodeTopicRow'

type NodeTopicListProps = {
  name: string
  isFocused: boolean
  currentListRef?: MutableRefObject<any>
  header?: ReactElement
  nodeSwr?: SWRResponse
}

export default function NodeTopicList(props: NodeTopicListProps) {
  const { header, name, isFocused, currentListRef } = props
  const { getViewedStatus } = useViewedTopics()
  const alert = useAlertService()
  const { data: settings } = useAppSettings()
  const listViewRef = useRef<FlashList<NodeTopicFeed>>()
  const scrollY = useRef(0)

  const getKey = useCallback(
    (index: number): [string, string, number] => {
      return ['/page/go/:name/feed.json', name, index + 1]
    },
    [name],
  )

  const listSwr = useSWRInfinite(
    getKey,
    ([_, name, page]) => getNodeFeeds({ name, p: page }),
    {
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError(err) {
        if (err.code === '2FA_ENABLED') {
          return
        }
        alert.alertWithType({
          type: 'error',
          message: err.message || '请求资源失败',
        })
      },
    },
  )

  const scrollToRefresh = useCallback(() => {
    if (listSwr.isValidating) {
      return
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (listSwr.data) {
      listViewRef.current.scrollToOffset({
        offset: scrollY.current > 0 ? 0 : -60,
        animated: true,
      })
    }
    listSwr.mutate()
  }, [listSwr])

  useEffect(() => {
    if (
      isFocused &&
      shouldFetch(listSwr, settings.autoRefresh && settings.autoRefreshDuration)
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
              listSwr,
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
    if (!listSwr.data && !listSwr.error) {
      // initial loading
      return new Array(20)
    }
    const items = listSwr.data?.reduce((combined, page) => {
      if (page.data) {
        return [...combined, ...page.data]
      }
      return combined
    }, [])
    return items || []
  }, [listSwr])

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
    <FlashList
      scrollToOverflowEnabled
      ref={listViewRef}
      className="flex-1"
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      estimatedItemSize={settings.feedLayout === 'tide' ? 65 : 80}
      onEndReached={() => {
        if (shouldLoadMore(listSwr)) {
          listSwr.setSize(listSwr.size + 1)
        }
      }}
      refreshControl={
        <MyRefreshControl
          refreshing={isRefreshing(listSwr)}
          onRefresh={() => {
            if (!listSwr.isValidating) {
              listSwr.mutate()
            }
          }}
        />
      }
      ListHeaderComponent={header}
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
      onScroll={(e) => {
        scrollY.current = e.nativeEvent.contentOffset.y
      }}
    />
  )
}
