import { forwardRef, useCallback, useMemo, useRef, useState } from 'react'
import { Platform, Pressable, Text, TextInput, View } from 'react-native'
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import composeRefs from '@seznam/compose-react-refs'
import classNames from 'classnames'
import useSWR from 'swr'

import CheckIcon from '@/components/CheckIcon'
import MyBottomSheetModal from '@/components/MyBottomSheetModal'
import { useTheme } from '@/containers/ThemeService'
import { getNodes } from '@/utils/v2ex-client'
import { HomeTabOption } from '@/utils/v2ex-client/types'

import TypeIcon from './TypeIcon'

const pickerSnapPoints = ['50%']

type Props = {
  selected: HomeTabOption[]
  onChange: (tabs: HomeTabOption[]) => void
}

const AddTabPanelSheet = forwardRef<BottomSheetModal, Props>((props, ref) => {
  const { selected = [], onChange } = props
  const nodesSwr = useSWR('/api/nodes/all.json', getNodes)
  const { theme, styles } = useTheme()
  const sheetRef = useRef<BottomSheetModal>(null)

  const selectedMap = {}
  selected.forEach(function (item) {
    if (!item.disabled) {
      selectedMap[`${item.type}:${item.value}`] = true
    }
  })

  const tintColor = theme.colors.text

  const [filter, setFilter] = useState('')
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

  const Input = Platform.OS === 'android' ? TextInput : BottomSheetTextInput
  const renderItem = useCallback(
    ({ item, index }) => {
      return (
        <Pressable
          className="pl-3 active:opacity-50"
          onPress={() => {
            const relatedItemIndex = selected.findIndex(
              (t) => t.type === 'node' && t.value === item.name,
            )
            if (relatedItemIndex > -1) {
              onChange([
                ...selected.slice(0, relatedItemIndex),
                ...selected.slice(relatedItemIndex + 1),
              ])
            } else {
              onChange([
                {
                  type: 'node',
                  value: item.name,
                  label: item.title,
                },
                ...selected,
              ])
            }
          }}>
          <View
            className={classNames('h-[50px] flex flex-row items-center pr-3')}
            style={[styles.border_b_light, index === 0 && styles.border_t]}>
            <TypeIcon size={18} color={tintColor} type="node" />
            <View className="ml-3 flex-1">
              <Text style={styles.text}>{item.title}</Text>
            </View>
            {selectedMap[`node:${item.name}`] && (
              <View style={{ marginRight: 8 }}>
                <CheckIcon size={16} color={theme.colors.success} />
              </View>
            )}
          </View>
        </Pressable>
      )
    },
    [selected, onChange],
  )

  return (
    <MyBottomSheetModal
      ref={composeRefs(sheetRef, ref)}
      snapPoints={pickerSnapPoints}>
      <View className="flex-1 h-full w-full">
        <BottomSheetFlatList
          className="w-full flex-1 bg-blue-300"
          data={filtered}
          // estimatedItemSize={50}
          renderItem={renderItem}
          keyExtractor={(n) => n.id}
          ListHeaderComponent={
            <View className="p-3">
              <Input
                onFocus={() => {
                  sheetRef.current?.snapToIndex(0)
                }}
                onBlur={() => {
                  sheetRef.current?.snapToIndex(0)
                }}
                style={{
                  height: 36,
                  paddingHorizontal: 8,
                  borderRadius: 6,
                  backgroundColor: theme.colors.overlay_input_bg,
                  color: theme.colors.text,
                }}
                selectionColor={theme.colors.primary}
                placeholderTextColor={theme.colors.text_placeholder}
                placeholder={'查找'}
                returnKeyType="search"
                onChangeText={(text) => {
                  setFilter(text)
                }}
              />
            </View>
          }
        />
      </View>
    </MyBottomSheetModal>
  )
})

AddTabPanelSheet.displayName = 'AddTabPanelSheet'

export default AddTabPanelSheet
