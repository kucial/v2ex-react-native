import { FlatList, View, Text, RefreshControl, ScrollView } from 'react-native'
import React, { useCallback } from 'react'
import useSWR from 'swr'

import ErrorNotice from '@/Components/ErrorNotice'
import TopicRow from '@/Components/TopicRow'
import TopicRowSkeleton from '@/Components/Skeleton/TopicRowSkeleton'

export default function TopicList(props) {
  const listSwr = useSWR(`/page/index/feed.json?tab=${props.type}`)
  const renderItem = useCallback(({ item }) => {
    return <TopicRow data={item} />
  }, [])

  if (listSwr.error) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={listSwr.isValidating}
            onRefresh={listSwr.mutate}
          />
        }>
        <ErrorNotice error={listSwr.error} />
      </ScrollView>
    )
  }

  if (!listSwr.data) {
    return (
      <View>
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
      </View>
    )
  }

  return (
    <FlatList
      refreshControl={
        <RefreshControl
          refreshing={listSwr.isValidating}
          onRefresh={listSwr.mutate}
        />
      }
      data={listSwr.data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  )
}
