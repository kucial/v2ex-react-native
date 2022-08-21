import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  FlatList
} from 'react-native'
import React from 'react'
import { useState, useCallback, useMemo } from 'react'
import { useSWR } from '@/utils/swr'
import SlideUp from '@/components/SlideUp'

export default function NodeSelect(props) {
  const nodesSwr = useSWR('/api/nodes/all.json')
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!nodesSwr.data) {
      return null
    }
    if (!filter) {
      return nodesSwr.data
    }
    return nodesSwr.data.filter((n) =>
      ['name', 'title', 'title_alternative'].some(
        (key) => n[key].indexOf(filter) > -1
      )
    )
  }, [nodesSwr.data])

  const renderItem = useCallback(
    ({ item }) => {
      return (
        <Pressable
          className="pl-3 active:opacity-50"
          onPress={() => {
            props.onChange(item)
            setOpen(false)
          }}>
          <View className="h-[44px] flex flex-row items-center border-b border-gray-300 pr-3">
            {props.renderLabel(item)}
          </View>
        </Pressable>
      )
    },
    [props.renderLabel]
  )

  return (
    <>
      <Pressable
        className="active:opacity-50"
        style={props.style}
        onPress={() => {
          setOpen(true)
        }}>
        {props.value ? (
          <Text className="text-[16px]">{props.renderLabel(props.value)}</Text>
        ) : (
          <Text className="text-gray-900 text-[16px] opacity-30">
            {props.placeholder}
          </Text>
        )}
      </Pressable>
      {open && (
        <SlideUp
          visible
          fullHeight
          onRequestClose={() => {
            setOpen(false)
          }}>
          <View className="flex-1 w-full">
            <View className="p-3">
              <TextInput
                className="bg-gray-100 rounded-lg flex-1 px-2 h-[36px] text-[16px] leading-[20px]"
                placeholder={props.filterPlaceholder}
                returnKeyType="search"
                value={filter}
                onChangeText={(text) => {
                  setFilter(text)
                }}
              />
            </View>
            <FlatList
              className="w-full"
              data={filtered}
              renderItem={renderItem}
              keyExtractor={(n) => n.id}
            />
          </View>
        </SlideUp>
      )}
    </>
  )
}
