import { FlatList, View, Text } from 'react-native'
import React, { useCallback } from 'react'

import TopicRow from '@/Components/TopicRow'
import TopicRowSkeleton from '@/Components/Skeleton/TopicRowSkeleton'
import useSWR from 'swr'

export default function TopicList(props) {
  const { data, error } = useSWR([
    '/page/index/feed.json',
    {
      params: {
        tab: props.type
      }
    }
  ])
  const renderItem = useCallback(({ item }) => {
    return <TopicRow data={item} />
  }, [])

  if (error) {
    return (
      <View>
        <Text>{error.message}</Text>
      </View>
    )
  }

  if (!data) {
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
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  )
}
