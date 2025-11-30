import { ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
import { getNodes } from '@/utils/v2ex-client'
import { NodeDetail } from '@/utils/v2ex-client/types'

import Button from '../Button'
import MyClearButton from '../MyClearButton'

type NodeSelectProps = {
  filterPlaceholder?: string
  placeholder: string
  renderLabel?(item: NodeDetail): ReactNode
  canClear?: boolean
  value?: NodeDetail | string
  onChange(item?: NodeDetail): void
  onBlur?(): void
}

function NodeSelect(props: NodeSelectProps) {
  const nodesQuery = useQuery({
    queryKey: ['/api/nodes/all.json'],
    queryFn: getNodes,
  })
  const { theme, styles } = useTheme()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const selectRef = useRef<TrueSheet>(null)

  const filtered = useMemo(() => {
    if (!nodesQuery.data) {
      return null
    }
    if (!filter) {
      return nodesQuery.data.data
    }
    return nodesQuery.data.data.filter((n) =>
      ['name', 'title', 'title_alternative'].some(
        (key) => n[key].indexOf(filter) > -1,
      ),
    )
  }, [nodesQuery.data, filter])

  const value = useMemo(() => {
    if (!props.value) {
      return null
    }
    if (typeof props.value === 'object') {
      return props.value
    }
    if (!nodesQuery.data) {
      return { name: props.value } as NodeDetail
    }
    return nodesQuery.data.data.find((item) => item.name === props.value)
  }, [props.value, nodesQuery.data])

  const renderLabel = useCallback(
    (n: NodeDetail) => {
      if (props.renderLabel) {
        const label = props.renderLabel(n)
        if (typeof label === 'string') {
          return <Text style={styles.text}>{label}</Text>
        }
        return label
      }
      return (
        <Text style={styles.text}>
          {n.title} / {n.name}
        </Text>
      )
    },
    [props.renderLabel, styles],
  )

  const renderItem = useCallback(
    ({ item }: { item: NodeDetail }) => {
      return (
        <Pressable
          className='pl-3 active:opacity-50'
          onPress={() => {
            props.onChange(item)
            selectRef.current?.dismiss()
          }}
        >
          <View
            className={cn('h-[50px] flex flex-row items-center pr-3')}
            style={[styles.border_b_light]}
          >
            {renderLabel(item)}
          </View>
        </Pressable>
      )
    },
    [renderLabel, props.onChange],
  )
  return (
    <>
      <View className='relative'>
        <Button
          size='md'
          variant='input'
          onPress={() => {
            setOpen(true)
            selectRef.current?.present()
          }}
        >
          <View className='w-full'>
            {value ? (
              <Text style={styles.text_base}>{renderLabel(value)}</Text>
            ) : (
              <Text style={[styles.text_placeholder, styles.text_base]}>
                {props.placeholder}
              </Text>
            )}
          </View>
        </Button>
        {props.canClear && props.value && (
          <View className='absolute right-0 h-full flex flex-row items-center justify-center'>
            <MyClearButton
              onPress={() => {
                props.onChange(undefined)
              }}
            />
          </View>
        )}
      </View>
      <TrueSheet
        ref={selectRef}
        detents={[0.5]}
        onDidDismiss={() => {
          props.onBlur?.()
          setOpen(false)
        }}
        backgroundColor={styles.overlay.backgroundColor}
      >
        {open && (
          <View className='flex-1 w-full'>
            <View className='p-3'>
              <TextInput
                autoFocus={!props.value}
                style={{
                  height: 36,
                  paddingHorizontal: 8,
                  borderRadius: 6,
                  backgroundColor: theme.colors.overlay_input_bg,
                  color: theme.colors.text,
                }}
                selectionColor={theme.colors.primary}
                placeholderTextColor={theme.colors.text_placeholder}
                placeholder={props.filterPlaceholder}
                returnKeyType='search'
                value={filter}
                onChangeText={(text) => {
                  setFilter(text)
                }}
              />
            </View>
            <FlashList
              className='w-full'
              data={filtered}
              renderItem={renderItem}
              keyExtractor={(n) => n.name}
              renderScrollComponent={ScrollView}
            />
          </View>
        )}
      </TrueSheet>
    </>
  )
}

export default NodeSelect
