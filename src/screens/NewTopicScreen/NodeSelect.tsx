import { ReactElement, useCallback, useMemo, useRef, useState } from 'react'
import { Pressable, Text, TextStyle, View, ViewStyle } from 'react-native'
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import classNames from 'classnames'
import { styled } from 'nativewind'
import useSWR from 'swr'

import MyBottomSheetModal from '@/components/MyBottomSheetModal'
import { useTheme } from '@/containers/ThemeService'
import { getNodes } from '@/utils/v2ex-client'
import { NodeDetail } from '@/utils/v2ex-client/types'

const pickerSnapPoints = ['50%']

type NodeSelectProps = {
  onChange(item: NodeDetail): void
  filterPlaceholder: string
  placeholder: string
  placeholderStyle: TextStyle
  style: ViewStyle | ViewStyle[]
  renderLabel(item: NodeDetail): ReactElement
  value?: NodeDetail
}
function NodeSelect(props: NodeSelectProps) {
  const nodesSwr = useSWR('/api/nodes/all.json', getNodes)
  const { theme, styles } = useTheme()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const selectRef = useRef<BottomSheetModal>()

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

  const renderItem = useCallback(
    ({ item }) => {
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
            {props.renderLabel(item)}
          </View>
        </Pressable>
      )
    },
    [props.renderLabel],
  )

  return (
    <>
      <Pressable
        className="active:opacity-50"
        style={props.style}
        onPress={() => {
          setOpen(true)
          selectRef.current?.present()
        }}>
        {props.value ? (
          <Text className="text-[16px]">{props.renderLabel(props.value)}</Text>
        ) : (
          <Text className="text-[16px]" style={props.placeholderStyle}>
            {props.placeholder}
          </Text>
        )}
      </Pressable>
      <MyBottomSheetModal
        ref={selectRef}
        index={0}
        snapPoints={pickerSnapPoints}
        onDismiss={() => {
          setOpen(false)
        }}>
        {open && (
          <View className="flex-1 w-full">
            <View className="p-3">
              <BottomSheetTextInput
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
              keyExtractor={(n) => n.id}
            />
          </View>
        )}
      </MyBottomSheetModal>
    </>
  )
}

export default styled(NodeSelect)
