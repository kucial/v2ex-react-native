import { useCallback, useMemo } from 'react'
import { FlashList } from '@shopify/flash-list'
import PropTypes from 'prop-types'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import { useAlertService } from '@/containers/AlertService'
import { isRefreshing, shouldLoadMore } from '@/utils/swr'

import UserTopicRow from './UserTopicRow'

export default function MemberTopics(props) {
  const alert = useAlertService()
  const getKey = useCallback(
    (index) => {
      return `/page/member/${props.username}/topics.json?p=${index + 1}`
    },
    [props.username]
  )

  const listSwr = useSWRInfinite(getKey, {
    shouldRetryOnError: false,
    onError(err) {
      if (!err.code) {
        alert.alertWithType('error', '错误', err.message || '请求资源失败')
      }
    }
  })

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
        return <UserTopicRow data={item} num={index + 1} />
      },
      keyExtractor(item, index) {
        return item?.id || index
      }
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
  username: PropTypes.string
}
