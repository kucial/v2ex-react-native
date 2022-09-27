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
import { useColorScheme } from 'tailwindcss-react-native'
import colors from 'tailwindcss/colors'
import classNames from 'classnames'

import { useSWR } from '@/utils/swr'
import SlideUp from '@/components/SlideUp'

export default function NodeSelect(props) {
  const nodesSwr = useSWR('/api/nodes/all.json')
  const { colorScheme } = useColorScheme()
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
  }, [nodesSwr.data, filter])

  console.log(filtered)

  const renderItem = useCallback(
    ({ item }) => {
      return (
        <Pressable
          className="pl-3 active:opacity-50"
          onPress={() => {
            props.onChange(item)
            setOpen(false)
          }}>
          <View
            className={classNames(
              'h-[50px] flex flex-row items-center border-b pr-3',
              'border-neutral-300',
              'dark:border-neutral-600'
            )}>
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
          <Text className="text-neutral-400 dark:text-neutral-500 text-[16px]">
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
          <View className="flex-1 w-full bg-white dark:bg-[#333333]">
            <View className="p-3">
              <TextInput
                className="h-[36px] px-2 bg-neutral-100 rounded-md dark:bg-neutral-800 dark:text-neutral-300"
                selectionColor={
                  colorScheme === 'dark'
                    ? colors.amber[50]
                    : colors.neutral[600]
                }
                placeholderTextColor={
                  colorScheme === 'dark'
                    ? colors.neutral[500]
                    : colors.neutral[400]
                }
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
