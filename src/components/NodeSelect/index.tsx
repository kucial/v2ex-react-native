import { ReactElement, useCallback, useMemo, useRef, useState } from 'react'
import {
  Pressable,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { Platform } from 'react-native'
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

const pickerSnapPoints = ['50%']

type NodeSelectProps = {
  filterPlaceholder: string
  placeholder: string
  placeholderStyle: TextStyle
  style: ViewStyle | ViewStyle[]
  renderLabel(item: NodeDetail): ReactElement
  value?: NodeDetail
  onChange(item: NodeDetail): void
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

  const renderLabel = useCallback(
    (n: NodeDetail) => {
      if (props.renderLabel) {
        return props.renderLabel(n)
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
      <Button
        size="md"
        variant="input"
        onPress={() => {
          setOpen(true)
          selectRef.current?.present()
        }}>
        <View className="w-full">
          {props.value ? (
            <Text className="text-[16px]">{renderLabel(props.value)}</Text>
          ) : (
            <Text className="text-[16px]" style={styles.text_placeholder}>
              {props.placeholder}
            </Text>
          )}
        </View>
      </Button>
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
            />
          </View>
        )}
      </MyBottomSheetModal>
    </>
  )
}

export default styled(NodeSelect)
