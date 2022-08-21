import {
  Image,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput
} from 'react-native'
import React, { useRef, useState } from 'react'
import useSwr from 'swr'

import { useAuthService } from '@/containers/AuthService'
import { isRefreshing } from '@/utils/swr'

import CollectedNodes from './CollectedNodes'
import CommonNodes from './CommonNodes'
import SearchInput from '@/components/SearchInput'

export default function NodesScreen({ navigation }) {
  const { status } = useAuthService()
  const hasAuthed = status === 'authed'
  const collectedNodesSwr = useSwr(hasAuthed ? '/page/my/nodes.json' : null, {
    revalidateOnMount: false
  })
  const commonNodesSwr = useSwr('/page/planes/node-groups.json', {
    revalidateOnMount: false
  })
  const nodeFilterSwr = useSwr('/ui/nodes/filter', () => undefined, {
    revalidateOnMount: false
  })

  const filterInput = useRef()

  console.log(nodeFilterSwr)

  return (
    <View className="flex-1">
      <View className="bg-white">
        <SearchInput
          placeholder="查询"
          initialValue={nodeFilterSwr.data || ''}
          ref={filterInput}
          onSubmit={(text) => {
            nodeFilterSwr.mutate(text.trim(), false)
          }}
          onReset={() => {
            nodeFilterSwr.mutate('', false)
          }}
        />
      </View>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={
              isRefreshing(commonNodesSwr) ||
              (hasAuthed && isRefreshing(collectedNodesSwr))
            }
            onRefresh={() => {
              if (hasAuthed) {
                collectedNodesSwr?.mutate()
              }
              commonNodesSwr?.mutate()
            }}
          />
        }>
        {hasAuthed && (
          <CollectedNodes filter={nodeFilterSwr.data} navigation={navigation} />
        )}
        <CommonNodes filter={nodeFilterSwr.data} navigation={navigation} />
      </ScrollView>
    </View>
  )
}
