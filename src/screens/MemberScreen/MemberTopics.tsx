import { useCallback, useMemo } from 'react'
import { FlashList } from '@shopify/flash-list'
import PropTypes from 'prop-types'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
import { isRefreshing, shouldLoadMore } from '@/utils/swr'
import { getMemberTopics } from '@/utils/v2ex-client'

import UserTopicRow from './MemberTopicRow'

export default function MemberTopics(props: { username: string }) {
  const alert = useAlertService()
  const { getViewedStatus } = useViewedTopics()
  const { data: settings } = useAppSettings()
  const getKey = useCallback(
    (index: number): [string, string, number] => {
      return ['/page/member/:username/topics.json', props.username, index + 1]
    },
    [props.username],
  )

  const listSwr = useSWRInfinite(
    getKey,
    ([_, username, page]) => getMemberTopics({ username, p: page }),
    {
      shouldRetryOnError: false,
      onError(err) {
        if (!err.code) {
          alert.alertWithType('error', '错误', err.message || '请求资源失败')
        }
      },
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
      renderItem({ item }) {
        return (
          <UserTopicRow
            data={item}
            viewedStatus={getViewedStatus(item)}
            showAvatar={settings.feedShowAvatar}
            showLastReplyMember={settings.feedShowLastReplyMember}
          />
        )
      },
      keyExtractor(item, index) {
        return item?.id || `index-${index}`
      },
    }
  }, [])

  return (
    <FlashList
      className="flex-1"
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      estimatedItemSize={110}
      onEndReached={() => {
        if (listSwr.error?.code === 'member_locked') {
          return
        }
        if (shouldLoadMore(listSwr)) {
          listSwr.setSize(listSwr.size + 1)
        }
      }}
      onRefresh={() => {
        if (listSwr.isValidating) {
          return
        }
        listSwr.mutate()
      }}
      refreshing={isRefreshing(listSwr)}
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
    />
  )
}
MemberTopics.propTypes = {
  username: PropTypes.string,
}
