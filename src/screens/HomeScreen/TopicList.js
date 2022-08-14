import { FlatList, RefreshControl, ScrollView } from 'react-native'
import React, { useEffect, useMemo } from 'react'
import { useIsFocused } from '@react-navigation/native'
import useSWR from 'swr'

import { isRefreshing, shouldInit } from '@/utils/swr'
import CommonListFooter from '@/components/CommonListFooter'

import TopicRow from './TopicRow'

export default function TopicList(props) {
  const listSwr = useSWR(`/page/index/topics.json?tab=${props.type}`, {
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

  const data = useMemo(() => {
    return listSwr.data || new Array(10)
  }, [listSwr.data || '1'])

  return (
    <FlatList
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing(listSwr)}
          onRefresh={listSwr.mutate}
        />
      }
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
    />
  )
}
