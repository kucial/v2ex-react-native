import { FlatList, RefreshControl, ScrollView } from 'react-native'
import React, { useEffect, useMemo } from 'react'
import { useIsFocused } from '@react-navigation/native'
import useSWRInfinite from 'swr/infinite'
import { uniqBy } from 'lodash'

import { isRefreshing, shouldInit, hasReachEnd } from '@/utils/swr'
import CommonListFooter from '@/components/CommonListFooter'

import TopicRow from './TopicRow'

export default function TopicList(props) {
  const listSwr = useSWRInfinite(props.getKey, {
    revalidateOnMount: false
  })
  const { renderItem, keyExtractor } = useMemo(() => ({
    renderItem: ({ item }) => <TopicRow data={item} />,
    keyExtractor: (item, index) => item?.id || `index-${index}`
  }))

  const isFocused = useIsFocused()

  useEffect(() => {
    if (isFocused && shouldInit(listSwr)) {
      listSwr.mutate()
    }
  }, [isFocused])

  const listItems = useMemo(() => {
    if (!listSwr.data && !listSwr.error) {
      // initial loading
      return new Array(10)
    }
    const items = listSwr.data?.reduce((combined, page) => {
      if (page.data) {
        return uniqBy([...combined, ...page.data], 'id')
      }
      return combined
    }, [])
    return items || []
  }, [listSwr])

  return (
    <FlatList
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (!listSwr.isValidating && !hasReachEnd(listSwr)) {
          listSwr.setSize((size) => size + 1)
        }
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing(listSwr)}
          onRefresh={() => {
            listSwr.setSize(1)
          }}
        />
      }
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
    />
  )
}
