import { FlatList } from 'react-native'
import React, { useCallback } from 'react'

import TopicRow from '@/Components/TopicRow'
import topics from '@/mock/topics'

export default function TopicList(props) {
  const renderItem = useCallback(({ item }) => {
    return <TopicRow data={item} />
  }, [])

  return (
    <FlatList
      data={topics}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  )
}
