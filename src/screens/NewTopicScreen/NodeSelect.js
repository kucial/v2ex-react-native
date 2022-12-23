import { useCallback, useMemo, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import classNames from 'classnames'
import colors from 'tailwindcss/colors'

import { useTheme } from '@/containers/ThemeService'
import { useSWR } from '@/utils/swr'

const pickerSnapPoints = ['50%']
const renderBackdrop = (props) => {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  )
}

export default function NodeSelect(props) {
  const nodesSwr = useSWR('/api/nodes/all.json')
  const { theme, styles } = useTheme()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const selectRef = useRef()

  const filtered = useMemo(() => {
    if (!nodesSwr.data) {
      return null
    }
    if (!filter) {
      return nodesSwr.data
    }
    return nodesSwr.data.filter((n) =>
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
            style={[styles.border_b, styles.border_light]}>
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
      <BottomSheetModal
        ref={selectRef}
        index={0}
        snapPoints={pickerSnapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.overlay}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.bg_bottom_sheet_handle,
        }}
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
                  backgroundColor: theme.colors.bg_input,
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
      </BottomSheetModal>
    </>
  )
}
