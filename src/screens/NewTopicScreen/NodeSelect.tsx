import { ReactElement, useCallback, useMemo, useRef, useState } from 'react'
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'

import MyBottomSheetModal from '@/components/MyBottomSheetModal'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
import { getNodes } from '@/utils/v2ex-client'
import { NodeDetail } from '@/utils/v2ex-client/types'

const pickerSnapPoints = ['50%']

type NodeSelectProps = {
  onChange(item: NodeDetail): void
  filterPlaceholder: string
  placeholder: string
  placeholderStyle: TextStyle
  className?: string
  style?: ViewStyle | ViewStyle[]
  renderLabel(item: NodeDetail): ReactElement
  value?: string
}
function NodeSelect(props: NodeSelectProps) {
  const nodesQuery = useQuery({
    queryKey: ['/api/nodes/all.json'],
    queryFn: getNodes,
  })
  const { theme, styles } = useTheme()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const selectRef = useRef<BottomSheetModal>(null)

  const Input = Platform.OS === 'android' ? TextInput : BottomSheetTextInput

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

  const renderItem = useCallback(
    ({ item }) => {
      return (
        <Pressable
          className='pl-3 active:opacity-50'
          onPress={() => {
            props.onChange(item)
            selectRef.current?.close()
          }}
        >
          <View
            className={cn('h-[50px] flex flex-row items-center pr-3')}
            style={[styles.border_b_light]}
          >
            {props.renderLabel(item)}
          </View>
        </Pressable>
      )
    },
    [props.renderLabel],
  )

  const selectedValue = nodesQuery.data?.data.find(
    (item) => item.name === props.value,
  )

  return (
    <>
      <Pressable
        className={cn('active:opacity-50', props.className)}
        style={props.style}
        onPress={() => {
          setOpen(true)
          selectRef.current?.present()
        }}
      >
        {selectedValue ? (
          <Text style={styles.text_base}>
            {props.renderLabel(selectedValue)}
          </Text>
        ) : (
          <Text style={[styles.text_base, props.placeholderStyle]}>
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
        }}
      >
        {open && (
          <View className='flex-1 w-full'>
            <View className='p-3'>
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
                returnKeyType='search'
                onChangeText={(text) => {
                  setFilter(text)
                }}
              />
            </View>
            <FlashList
              className='w-full'
              data={filtered}
              renderItem={renderItem}
              keyExtractor={(n) => n.id}
              renderScrollComponent={ScrollView}
            />
          </View>
        )}
      </MyBottomSheetModal>
    </>
  )
}

export default NodeSelect
