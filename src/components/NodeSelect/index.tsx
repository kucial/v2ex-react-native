import { ReactElement, useCallback, useMemo, useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { Platform } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import classNames from 'classnames'
import { styled } from 'nativewind'
import useSWR from 'swr'

import MyBottomSheetModal from '@/components/MyBottomSheetModal'
import { useTheme } from '@/containers/ThemeService'
import { getNodes } from '@/utils/v2ex-client'
import { NodeDetail } from '@/utils/v2ex-client/types'

import Button from '../Button'
import MyClearButton from '../MyClearButton'

const pickerSnapPoints = Platform.select({
  ios: ['50%'],
  android: ['50%', '80%'],
})

type NodeSelectProps = {
  filterPlaceholder?: string
  placeholder: string
  renderLabel?(item: NodeDetail): ReactElement
  canClear?: boolean
  value?: NodeDetail | string
  onChange(item?: NodeDetail): void
  onBlur?(): void
}

function NodeSelect(props: NodeSelectProps) {
  const nodesSwr = useSWR('/api/nodes/all.json', getNodes)
  const { theme, styles } = useTheme()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const selectRef = useRef<BottomSheetModal>()

  const Input = Platform.OS === 'android' ? TextInput : BottomSheetTextInput

  const filtered = useMemo(() => {
    if (!nodesSwr.data) {
      return null
    }
    if (!filter) {
      return nodesSwr.data.data
    }
    return nodesSwr.data.data.filter((n) =>
      ['name', 'title', 'title_alternative'].some(
        (key) => n[key].indexOf(filter) > -1,
      ),
    )
  }, [nodesSwr.data, filter])

  const value = useMemo(() => {
    if (!props.value) {
      return null
    }
    if (typeof props.value === 'object') {
      return props.value
    }
    if (!nodesSwr.data) {
      return { name: props.value } as NodeDetail
    }
    return nodesSwr.data.data.find((item) => item.name === props.value)
  }, [props.value, nodesSwr.data])

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
          className="pl-3 active:opacity-50"
          onPress={() => {
            props.onChange(item)
            selectRef.current?.close()
          }}>
          <View
            className={classNames('h-[50px] flex flex-row items-center pr-3')}
            style={[styles.border_b_light]}>
            {renderLabel(item)}
          </View>
        </Pressable>
      )
    },
    [renderLabel],
  )
  return (
    <>
      <View className="relative">
        <Button
          size="md"
          variant="input"
          onPress={() => {
            setOpen(true)
            selectRef.current?.present()
          }}>
          <View className="w-full">
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
          <View className="absolute right-0 h-full flex flex-row items-center justify-center">
            <MyClearButton
              onPress={() => {
                props.onChange(undefined)
              }}
            />
          </View>
        )}
      </View>
      <MyBottomSheetModal
        ref={selectRef}
        index={0}
        snapPoints={pickerSnapPoints}
        onDismiss={() => {
          props.onBlur?.()
          setOpen(false)
        }}>
        {open && (
          <View className="flex-1 w-full">
            <View className="p-3">
              <Input
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
                returnKeyType="search"
                value={filter}
                onChangeText={(text) => {
                  setFilter(text)
                }}
              />
            </View>
            <FlashList
              className="w-full"
              data={filtered}
              estimatedItemSize={50}
              renderItem={renderItem}
              keyExtractor={(n) => n.name}
              renderScrollComponent={ScrollView}
            />
          </View>
        )}
      </MyBottomSheetModal>
    </>
  )
}

export default styled(NodeSelect)
