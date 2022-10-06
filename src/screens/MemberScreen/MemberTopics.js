import React, { useCallback, useMemo } from 'react'
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import useSWRInfinite from 'swr/infinite'
import colors from 'tailwindcss/colors'
import { useColorScheme } from 'tailwindcss-react-native'

import CommonListFooter from '@/components/CommonListFooter'
import { hasReachEnd } from '@/utils/swr'

import UserTopicRow from './UserTopicRow'

export default function MemberTopics(props) {
  const { colorScheme } = useColorScheme()
  const getKey = useCallback(
    (index) => {
      return `/page/member/${props.username}/topics.json?p=${index + 1}`
    },
    [props.username]
  )

  const listSwr = useSWRInfinite(getKey, undefined, {
    shouldRetryOnError: false
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
    <FlatList
      className="flex-1"
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (!listSwr.isValidating && !hasReachEnd(listSwr)) {
          listSwr.setSize(listSwr.size + 1)
        }
      }}
      refreshControl={
        <RefreshControl
          tintColor={
            colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
          }
          onRefresh={() => {
            if (listSwr.isValidating) {
              return
            }
            listSwr.mutate()
          }}
          refreshing={listSwr.data && listSwr.isValidating}
        />
      }
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
    />
  )
}
MemberTopics.propTypes = {
  username: PropTypes.string
}
